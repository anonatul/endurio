import OpenAI from "openai";
import 'dotenv/config'

const openai = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY
});

// ToDo: Add a src/config/prompts.js file and move all system prompts there
const SYSTEM_PROMPT = 'You are a professional training coach focused on helping clients improve strength, fitness, and performance through clear, practical guidance. Create effective workout plans, track progress, and provide straightforward feedback while prioritizing safety and consistency';

// What i learned:
// - what is SDK - SDK provides a set of tools, lib,
// and docs that allow me to interact with the API in a more convenient way
// than using the raw HTTP requests.

export const generateChatResponse = async (messages) => {
    try {
        const chatCompletion = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages
            ],

            temperature: 0.7,
            max_completion_tokens: 1000
        });

        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error('AI Service Error:', error);
        throw new Error('Failed to generate AI response');
    };
};