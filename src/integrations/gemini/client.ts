
import { supabase } from "@/integrations/supabase/client";

/**
 * Send a prompt to the Gemini AI for answering FAQ questions
 */
export async function askGemini(prompt: string): Promise<string> {
  try {
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('gemini-faq', {
      body: { prompt },
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
