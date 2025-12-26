# CV Generator Pipeline

An automated portfolio website generator that transforms Typeform submissions into fully deployed Vercel sites.

## 🚀 How It Works

```
Typeform → n8n (AI Brief) → API → Orchestrator → Vercel
```

1. **User fills Typeform** with their info (name, role, projects, etc.)
2. **n8n processes submission** and uses AI to create a Product Brief
3. **API receives the brief** and triggers the generation pipeline
4. **Orchestrator runs** the full generation sequence:
   - Inspiration Engine (scrapes design trends)
   - Spec Generator (creates style guides & requirements)
   - Site Generator (builds Next.js components)
   - Deploy Service (publishes to Vercel)
5. **User receives** a live portfolio URL

## 📁 Project Structure

```
cv-generator-project/
├── api/                    # Express API server
│   └── server.js           # Main API endpoints
├── scripts/                # Core pipeline scripts
│   ├── orchestrator.js     # Main pipeline coordinator
│   ├── inspiration_engine.js
│   ├── spec_generator.js
│   ├── site_generator.js
│   └── deploy_service.js
├── prompts/                # AI prompt templates
├── website-guidelines/     # Generated specs (gitignored)
├── website-sections/       # Generated section specs (gitignored)
├── output/                 # Generated Next.js site (gitignored)
├── Procfile               # Heroku deployment config
└── package.json
```

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- Heroku account (for API hosting)
- n8n instance (Heroku or self-hosted)
- Typeform account
- Vercel account

### Environment Variables

```bash
# API Keys
OPENROUTER_API_KEY=your_openrouter_key
FIRECRAWL_API_KEY=your_firecrawl_key
TAVILY_API_KEY=your_tavily_key
VERCEL_API_TOKEN=your_vercel_token

# Server Config
API_PORT=3001
```

### Local Development

```bash
# Install dependencies
npm install

# Run API server locally
npm run api

# Run orchestrator manually
npm run generate
```

### Deploy to Heroku

```bash
# Login and create app
heroku login
heroku create cv-generator-api

# Set environment variables
heroku config:set OPENROUTER_API_KEY=xxx
heroku config:set FIRECRAWL_API_KEY=xxx
heroku config:set TAVILY_API_KEY=xxx
heroku config:set VERCEL_API_TOKEN=xxx

# Deploy
git push heroku main
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/generate` | POST | Start generation with briefContent, name, vibe |
| `/status/:jobId` | GET | Check job status |
| `/health` | GET | Health check |

## 🔧 n8n Workflow

The n8n workflow is stored separately. Import it into your n8n instance.

Required n8n credentials:
- Typeform API
- OpenRouter API

Set n8n environment variable:
```
CV_GENERATOR_API_URL=https://your-api.herokuapp.com
```

## 📝 License

MIT
