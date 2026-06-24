import 'dotenv/config'
import { trainingPlanSchema } from '../schemas/trainingPlan.schema.js';
import { GoogleGenAI } from '@google/genai';
import { CHAT_SYSTEM_PROMPT, PLAN_GENERATION_PROMPT, PLAN_GENERATION_PROMPT_LIGHT } from '../config/prompts.js';

const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// What i learned:
// - what is SDK - SDK provides a set of tools, lib,
// and docs that allow me to interact with the API in a more convenient way
// than using the raw HTTP requests.

export const generateChatResponse = async (messages) => {
    try {
        const chatCompletion = await aiClient.models.generateContent({
            model: "gemini-3.5-flash",
            systemInstruction: CHAT_SYSTEM_PROMPT,
            contents: messages.map(m => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }]
            }))
        });

        return chatCompletion.text;
    } catch (error) {
        console.error('AI Service Error:', error);
        throw new Error('Failed to generate AI response');
    };
};

export const generateTrainingPlan = async (userProfile) => {
    try {
        const chatCompletion = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            systemInstruction: PLAN_GENERATION_PROMPT,
            contents: [{
                role: "user",
                parts: [{
                    text: `Generate exactly ${userProfile?.goals?.duration_weeks || 12 } weeks of training.
                           Here is the athlete profile:
                           ${JSON.stringify(userProfile, null, 2)}
                           Return only valid JSON.` 
                        }]
            }],
            config: {
                responseMimeType: "application/json",
                responseSchema: trainingPlanSchema,
                temperature: 0,
                topP: 0.1
            }
        });

        const trainingPlan = JSON.parse(chatCompletion.text);

        return trainingPlan;
    } catch (error) {
        console.error('AI Service Error:', error);
        throw new Error('Failed to generate Training Plan');
    };
};
