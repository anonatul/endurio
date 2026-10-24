import OpenAI from "openai";

export const AI_MODEL = process.env.AI_MODEL ||  "gpt-5.6-sol";

export const ai = new OpenAI({
    apiKey: process.env.AGENTROUTER_API_KEY,
    baseURL: "https://agentrouter.org/v1",
    defaultHeaders: { "User-Agent": "claude-cli/1.0.108 (external, cli)" }
});