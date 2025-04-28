
import { supabase } from "@/integrations/supabase/client";

/**
 * Send a prompt to the Gemini AI for answering questions
 * Includes support for passing file content context
 */
export async function askGemini(prompt: string, fileContext?: string): Promise<string> {
  try {
    console.log("Calling Gemini with prompt:", prompt.substring(0, 100) + (prompt.length > 100 ? "..." : ""));
    console.log("File context provided:", fileContext ? "Yes" : "No");
    
    if (fileContext) {
      console.log("File context length:", fileContext.length, "characters");
      // Limit file context if it's too large to avoid token issues
      if (fileContext.length > 50000) {
        console.log("File context is too large, trimming to 50k chars");
        fileContext = fileContext.substring(0, 50000) + "\n... [Content truncated due to size limitations] ...";
      }
    }
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('gemini-faq', {
      body: { prompt, fileContext },
    });

    if (error) {
      console.error('Error invoking gemini-faq function:', error);
      throw new Error('Failed to get answer from Gemini AI');
    }

    if (!data || !data.answer) {
      console.error('Empty or invalid response from gemini-faq function', data);
      throw new Error('Received empty response from Gemini AI');
    }

    return data.answer;
  } catch (error) {
    console.error('Error in askGemini:', error);
    throw error;
  }
}
