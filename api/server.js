require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { runPipeline, getJobStatus } = require('../scripts/orchestrator');

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory job storage (use Redis/DB for production)
const jobs = new Map();

/**
 * Health Check
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * POST /generate
 * Trigger the full generation pipeline
 * 
 * Body: {
 *   name: string,
 *   role: string,
 *   vibe: string,
 *   tagline?: string,
 *   about?: string,
 *   projects?: Array<{ name, description, image?, link? }>,
 *   skills?: string[],
 *   contact?: { email?, linkedin?, github?, twitter? }
 * }
 */
app.post('/generate', async (req, res) => {
    try {
        const { name, role, vibe, tagline, about, projects, skills, contact } = req.body;

        // Validate required fields
        if (!name || !role || !vibe) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['name', 'role', 'vibe']
            });
        }

        // Create job
        const jobId = uuidv4();
        const job = {
            id: jobId,
            status: 'queued',
            input: { name, role, vibe, tagline, about, projects, skills, contact },
            createdAt: new Date().toISOString(),
            outputPath: null,
            deployUrl: null,
            error: null
        };

        jobs.set(jobId, job);

        // Start pipeline asynchronously
        runPipeline(job).then(() => {
            job.status = 'complete';
        }).catch((error) => {
            job.status = 'failed';
            job.error = error.message;
        });

        // Return immediately with job ID
        res.status(202).json({
            jobId,
            status: 'queued',
            message: 'Generation started. Poll /status/:jobId for updates.'
        });

    } catch (error) {
        console.error('Generate error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /status/:jobId
 * Check the status of a generation job
 */
app.get('/status/:jobId', (req, res) => {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
        jobId: job.id,
        status: job.status,
        createdAt: job.createdAt,
        outputPath: job.outputPath,
        deployUrl: job.deployUrl,
        error: job.error
    });
});

/**
 * GET /jobs
 * List all jobs (for debugging)
 */
app.get('/jobs', (req, res) => {
    const jobList = Array.from(jobs.values()).map(job => ({
        id: job.id,
        status: job.status,
        createdAt: job.createdAt
    }));
    res.json(jobList);
});

/**
 * POST /webhook/typeform
 * Typeform webhook endpoint - matches your CV Builder Form
 * 
 * Your form questions (in order):
 * 1. Full Name
 * 2. Professional role/title
 * 3. Years of experience
 * 4. Professional tagline
 * 5. Professional bio (about)
 * 6. Visual style (vibe)
 * 7. Avatar Image
 * 8. Social media links
 * 9. Email address
 * 10. Number of projects
 * 11. Top projects/clients
 * 12. Project Links
 * 13. Contribution/impact
 * 14. Testimonials (optional)
 */
app.post('/webhook/typeform', async (req, res) => {
    try {
        const data = req.body;
        console.log('📩 Received Typeform webhook');

        // Extract answers from Typeform format
        const answers = data.form_response?.answers || [];

        // Helper to get answer by index (0-based)
        const getAnswer = (index) => {
            const answer = answers[index];
            if (!answer) return null;

            // Handle different answer types
            if (answer.text) return answer.text;
            if (answer.choice?.label) return answer.choice.label;
            if (answer.email) return answer.email;
            if (answer.url) return answer.url;
            if (answer.number) return answer.number;
            if (answer.file_url) return answer.file_url;
            if (answer.choices?.labels) return answer.choices.labels;

            return null;
        };

        // Map Typeform answers to our input format
        // Matching your 14 questions in order
        const input = {
            // Basic Info
            name: getAnswer(0) || 'Unknown',           // Q1: Full Name
            role: getAnswer(1) || 'Professional',       // Q2: Role/Title
            experience: getAnswer(2),                   // Q3: Years of experience
            tagline: getAnswer(3),                      // Q4: Professional tagline
            about: getAnswer(4),                        // Q5: Professional bio
            vibe: getAnswer(5) || 'Modern Professional Portfolio', // Q6: Visual style

            // Media
            avatar: getAnswer(6),                       // Q7: Avatar image

            // Contact
            socialLinks: getAnswer(7),                  // Q8: Social media links
            email: getAnswer(8),                        // Q9: Email address

            // Projects
            projectCount: getAnswer(9),                 // Q10: Number of projects
            projects: getAnswer(10),                    // Q11: Top projects/clients
            projectLinks: getAnswer(11),                // Q12: Project Links
            projectImpact: getAnswer(12),               // Q13: Contribution/impact

            // Optional
            testimonials: getAnswer(13),                // Q14: Testimonials
        };

        console.log('📋 Extracted input:', {
            name: input.name,
            role: input.role,
            vibe: input.vibe
        });

        // Create and start job
        const jobId = uuidv4();
        const job = {
            id: jobId,
            status: 'queued',
            input,
            createdAt: new Date().toISOString(),
            outputPath: null,
            deployUrl: null,
            error: null,
            source: 'typeform'
        };

        jobs.set(jobId, job);

        // Start pipeline
        runPipeline(job).then(() => {
            job.status = 'complete';
            console.log(`✅ Typeform job ${jobId} complete: ${job.deployUrl}`);
        }).catch((error) => {
            job.status = 'failed';
            job.error = error.message;
            console.error(`❌ Typeform job ${jobId} failed:`, error.message);
        });

        res.status(200).json({ received: true, jobId });

    } catch (error) {
        console.error('Typeform webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CV Generator API running on http://localhost:${PORT}`);
    console.log(`   POST /generate - Start generation`);
    console.log(`   GET  /status/:jobId - Check status`);
    console.log(`   POST /webhook/typeform - Typeform webhook`);
});

module.exports = app;
