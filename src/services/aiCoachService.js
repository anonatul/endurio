import 'dotenv/config'
import OpenAI from "openai";
import { CHAT_SYSTEM_PROMPT, PLAN_GENERATION_PROMPT, PLAN_GENERATION_PROMPT_LIGHT } from '../config/prompts.js';

const openai = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY
});

// What i learned:
// - what is SDK - SDK provides a set of tools, lib,
// and docs that allow me to interact with the API in a more convenient way
// than using the raw HTTP requests.

export const generateChatResponse = async (messages) => {
    try {
        const chatCompletion = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: 'system', content: CHAT_SYSTEM_PROMPT },
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

export const generateTrainingPlan = async (userProfile) => {
    try {
        const chatCompletion = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: 'system', content: PLAN_GENERATION_PROMPT_LIGHT },
                { role: 'user', content: `Here is my running data: \n ${JSON.stringify(userProfile, null, 2)}`}
            ],

            temperature: 0.5,
            max_completion_tokens: 8000,
            response_format: { type: "json_object" }
        });

        return JSON.parse(chatCompletion.choices[0].message.content);
    } catch (error) {
        console.error('AI Service Error:', error);
        throw new Error('Failed to generate Training Plan');
    };
};