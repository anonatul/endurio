import 'dotenv/config'
import { CHAT_SYSTEM_PROMPT, PLAN_GENERATION_PROMPT } from '../config/prompts.js';

import { ai, AI_MODEL } from './aiProvider.js';

// What i learned:
// - what is SDK - SDK provides a set of tools, lib,
// and docs that allow me to interact with the API in a more convenient way
// than using the raw HTTP requests.

export const generateChatResponse = async (messages) => {
    try {
        const response = await ai.responses.create({
            model: AI_MODEL,
            instructions: CHAT_SYSTEM_PROMPT,
            input: messages.map(m => ({ role: m.role, content: m.content })),
        });

        return response.output_text;
    } catch (error) {
        console.error('AI Service Error:', error);
        throw new Error('Failed to generate AI response');
    };
};

export const generateTrainingPlan = async (userProfile) => {

    const weeks = userProfile?.goals?.duration_weeks || 12;
    const today = new Date().toLocaleDateString('en-CA');

    try {
        const response = await ai.responses.create({
            model: AI_MODEL,

            instructions: `${PLAN_GENERATION_PROMPT}
            ## Required top-level keys
            Output one object with exactly these keys, no extras, no "trainingPlan" wrapper:
            plan_metadata, athlete_snapshot, training_paces, phases, weeks, coach_instructions`,

            input: `Today is ${today}. Start the plan on the next Monday on or after today.
                    Generate exactly ${weeks} weeks of training.
                    Here is the athlete profile:
                    ${JSON.stringify(userProfile, null, 2)}
                    Return only valid JSON.`,

            text: { format: { type: 'json_object' } }
        });

        if (response.status !== "completed") {
            throw new Error(`AI ${response.status}: ${JSON.stringify(response.incomplete_details ?? response.error)}`);
        };

        const raw = response.output_text
            .trim()
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/```$/, "")
            .trim();

        const plan = JSON.parse(raw);

        if (!Array.isArray(plan.weeks) || plan.weeks.length !== weeks) {
            throw new Error(`Bad plan shape: got ${plan.weeks?.length} weeks, expected ${weeks}`);
        };

        return plan;

    } catch (error) {
        console.error('AI Service Error:', error);
        throw new Error('Failed to generate Training Plan');
    };
};
