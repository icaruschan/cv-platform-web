/**
 * Deploy Service - Deploys generated sites to Vercel
 * 
 * Uses Vercel API to:
 * 1. Create/update project
 * 2. Upload build files
 * 3. Trigger deployment
 * 4. Return live URL
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID; // Optional

/**
 * Deploy to Vercel using CLI (most reliable method)
 * 
 * @param {Object} options
 * @param {string} options.projectName - Name for the Vercel project
 * @param {string} options.outputDir - Path to the Next.js output directory
 * @returns {Promise<{url: string, projectId: string}>}
 */
async function deployToVercel(options) {
    const { projectName, outputDir } = options;

    if (!VERCEL_API_TOKEN) {
        console.warn('⚠️ VERCEL_API_TOKEN not set. Skipping deployment.');
        return {
            url: `https://${projectName}.vercel.app (deployment skipped - no token)`,
            projectId: null,
            skipped: true
        };
    }

    console.log(`\n🚀 Deploying to Vercel...`);
    console.log(`   Project: ${projectName}`);
    console.log(`   Source: ${outputDir}`);

    try {
        // Check if Vercel CLI is installed
        try {
            execSync('vercel --version', { stdio: 'pipe' });
        } catch {
            console.log('📦 Installing Vercel CLI...');
            execSync('npm install -g vercel', { stdio: 'inherit' });
        }

        // Create vercel.json if it doesn't exist
        const vercelConfigPath = path.join(outputDir, 'vercel.json');
        if (!fs.existsSync(vercelConfigPath)) {
            const vercelConfig = {
                "framework": "nextjs",
                "buildCommand": "npm run build",
                "outputDirectory": ".next"
            };
            fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
            console.log('   ✅ Created vercel.json');
        }

        // Deploy using Vercel CLI
        const deployCommand = [
            'vercel',
            '--token', VERCEL_API_TOKEN,
            '--yes',
            '--name', projectName,
            VERCEL_TEAM_ID ? `--scope ${VERCEL_TEAM_ID}` : '',
            '--prod'
        ].filter(Boolean).join(' ');

        console.log('   📤 Uploading to Vercel...');

        const result = execSync(deployCommand, {
            cwd: outputDir,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Extract URL from output
        const url = result.trim().split('\n').pop();

        console.log(`   ✅ Deployed: ${url}`);

        return {
            url,
            projectId: projectName,
            skipped: false
        };

    } catch (error) {
        console.error('❌ Vercel deployment failed:', error.message);

        // Return a fallback
        return {
            url: `https://${projectName}.vercel.app (deployment failed)`,
            projectId: null,
            error: error.message,
            skipped: true
        };
    }
}

/**
 * Alternative: Deploy using Vercel API directly (for serverless environments)
 * This is more complex but works without CLI
 */
async function deployViaAPI(options) {
    const { projectName, outputDir } = options;

    const baseUrl = 'https://api.vercel.com';
    const headers = {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json'
    };

    // This is a simplified version - full implementation would:
    // 1. Create deployment with file hashes
    // 2. Upload missing files
    // 3. Finalize deployment

    // For now, recommend using CLI method
    console.log('⚠️ API deployment not fully implemented. Use CLI method.');
    return deployToVercel(options);
}

/**
 * Get deployment status
 */
async function getDeploymentStatus(deploymentId) {
    if (!VERCEL_API_TOKEN) return null;

    try {
        const response = await fetch(
            `https://api.vercel.com/v13/deployments/${deploymentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${VERCEL_API_TOKEN}`
                }
            }
        );

        return await response.json();
    } catch (error) {
        console.error('Error fetching deployment status:', error);
        return null;
    }
}

/**
 * List projects
 */
async function listProjects() {
    if (!VERCEL_API_TOKEN) return [];

    try {
        const response = await fetch(
            'https://api.vercel.com/v9/projects',
            {
                headers: {
                    'Authorization': `Bearer ${VERCEL_API_TOKEN}`
                }
            }
        );

        const data = await response.json();
        return data.projects || [];
    } catch (error) {
        console.error('Error listing projects:', error);
        return [];
    }
}

// CLI Support
if (require.main === module) {
    const testOptions = {
        projectName: 'test-portfolio-' + Date.now(),
        outputDir: path.join(__dirname, '../output')
    };

    deployToVercel(testOptions).then(result => {
        console.log('\n📊 Deploy Result:');
        console.log(JSON.stringify(result, null, 2));
    }).catch(err => {
        console.error('Deploy failed:', err);
        process.exit(1);
    });
}

module.exports = { deployToVercel, getDeploymentStatus, listProjects };
