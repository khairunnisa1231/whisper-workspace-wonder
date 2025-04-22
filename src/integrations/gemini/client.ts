
import { supabase } from "@/integrations/supabase/client";

/**
 * Send a prompt to the Gemini AI for answering questions
 * Includes support for passing file content context
 */
export async function askGemini(prompt: string, fileContext?: string): Promise<string> {
  try {
    console.log('Sending prompt to Gemini:', prompt.substring(0, 100) + "...");
    
    // Create the full prompt with file context if provided
    const fullPrompt = fileContext 
      ? `${prompt}\n\nContext from uploaded files:\n${fileContext}` 
      : prompt;
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('gemini-faq', {
      body: { prompt: fullPrompt },
    });

    if (error) {
      console.error('Error invoking gemini-faq function:', error);
      throw new Error('Failed to get answer from Gemini AI: ' + error.message);
    }

    if (!data || !data.answer) {
      console.error('Invalid response from Gemini:', data);
      throw new Error('Failed to get a valid response from Gemini AI');
    }

    console.log('Received answer from Gemini successfully');
    return data.answer;
  } catch (error) {
    console.error('Error in askGemini:', error);
    throw error;
  }
}
