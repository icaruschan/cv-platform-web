import OpenAI from 'openai';
import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkOpenRouter() {
    console.log("Checking OpenRouter...");
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error("❌ OPENROUTER_API_KEY missing");
        return;
    }
    const openai = new OpenAI({ apiKey, baseURL: "https://openrouter.ai/api/v1" });
    try {
        await openai.models.list();
        console.log("✅ OpenRouter (Models List): Success");
    } catch (e: any) {
        console.error(`❌ OpenRouter Failed: ${e.status} - ${e.message}`);
        if (e.response) console.error(JSON.stringify(e.response.data));
    }
}

async function checkTavily() {
    console.log("Checking Tavily...");
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
        console.error("❌ TAVILY_API_KEY missing");
        return;
    }
    try {
        await axios.post("https://api.tavily.com/search", { api_key: apiKey, query: "test", max_results: 1 });
        console.log("✅ Tavily: Success");
    } catch (e: any) {
        console.error(`❌ Tavily Failed: ${e.message}`);
        if (e.response) console.error(JSON.stringify(e.response.data));
    }
}

async function checkFirecrawl() {
    console.log("Checking Firecrawl...");
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
        console.error("❌ FIRECRAWL_API_KEY missing");
        return;
    }
    // Simple check if SDK creates, but better to hit an endpoint if possible without credit cost? 
    // Firecrawl doesn't have a cheap 'list models' equiv easily accessible via raw axios maybe?
    // Let's just assume if header 401 it fails.
    try {
        await axios.get("https://api.firecrawl.dev/v1/crawl/status/123", { headers: { Authorization: `Bearer ${apiKey}` } });
        // This will likely 404 but NOT 401 if key is good? Or 401 if bad.
        console.log("✅ Firecrawl: Key accepted (likely)");
    } catch (e: any) {
        if (e.response && e.response.status === 401) {
            console.error(`❌ Firecrawl Failed: 401 Unauthorized`);
        } else {
            console.log("✅ Firecrawl: Key accepted (Got non-401 response)");
        }
    }
}

async function run() {
    await checkOpenRouter();
    await checkTavily();
    await checkFirecrawl();
}

run();
