import { query } from "../db/pool.js";
import { generateChatResponse } from "../services/aiCoachService.js";

// Notes: 
// Architecture Pattern: 
// [user input] -> [controller] -> [service] -> [AI API] -> [service] -> [controller] -> [response to user]
// Controller: Handles the HTTP request
// Service: Handles the business logic and interacts with the AI API
// AI API: The external AI service that generates responses based on the input
// Database: Stores chat history for context and continuity

export const getChatResponse = async (req, res) => {
    const { userId } = req.session;
    const { message } = req.body;

    if (!userId) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    };

    if(!message) {
        return res.status(400).json({
            error: "Message is required!"
        });
    };

    const userInput = { role: 'user', content: message };
    
    const fetchChatHistoryQuery = `
    SELECT role, content
    FROM chat_history 
    WHERE user_id = $1;
    `;
    
    const insertChatHistoryQuery = `
    INSERT INTO chat_history (user_id, role, content)
    VALUES 
    ($1, $2, $3),
    ($1, $4, $5);
    `;
    
    
    try {
        // Fetch chat history from DB
        const data = await query(fetchChatHistoryQuery, [userId]);
        const historyChats = await data.rows;
        
        // store history chats + new user input
        const messages = [...historyChats, userInput];

        // get the chat response
        const chatResponse = await generateChatResponse(messages);

        const coachResponse = { role: 'assistant', content: chatResponse };
        // save the chats into DB
        await query(insertChatHistoryQuery, [userId, userInput.role, userInput.content, coachResponse.role, coachResponse.content]);

        res.status(200).json({
            response: chatResponse
        });

    } catch (error) {
        console.error('Controller Error:', error);
        res.status(500).json({
            error: "Failed to get chat response"
        });
    };
}