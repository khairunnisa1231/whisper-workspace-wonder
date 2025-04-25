
import { supabase } from "@/integrations/supabase/client";

/**
 * Send a prompt to the Gemini AI for answering questions
 * Includes support for passing file content context
 */
export async function askGemini(prompt: string, fileContext?: string): Promise<string> {
  try {
    // Create the full prompt with file context if provided
    const fullPrompt = fileContext 
      ? `${prompt}\n\nContext from uploaded files:\n${fileContext}` 
      : prompt;
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('gemini-faq', {
      body: { prompt: fullPrompt, fileContext },
    });

    if (error) {
      console.error('Error invoking gemini-faq function:', error);
      throw new Error('Failed to get answer from Gemini AI');
    }

    return data.answer;
  } catch (error) {
    console.error('Error in askGemini:', error);
    throw error;
  }
}
