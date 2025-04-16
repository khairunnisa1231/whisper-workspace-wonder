
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API with the API key from environment variables
// This should be set in Supabase Edge Function Secrets
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateAIResponse(
  message: string, 
  history: { role: 'user' | 'assistant', content: string }[] = []
) {
  try {
    // For safety check if API key is available
    if (!API_KEY) {
      console.error('Missing Gemini API key');
      return "I'm unable to respond right now due to a configuration issue. Please check the API key setup.";
    }

    // Use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Format chat history for Gemini
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Start a chat session
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    // Generate a response
    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}
