
import { supabase } from "@/integrations/supabase/client";

/**
 * Send a prompt to the Gemini AI for answering questions
 * Includes support for passing file content context
 */
export async function askGemini(prompt: string, fileContext?: string): Promise<string> {
  try {
    console.log("Calling Gemini with prompt:", prompt.substring(0, 100) + (prompt.length > 100 ? "..." : ""));
    console.log("File context provided:", fileContext ? "Yes" : "No");
    
    let processedFileContext = fileContext;
    if (fileContext) {
      console.log("File context length:", fileContext.length, "characters");
      // Limit file context if it's too large to avoid token issues
      if (fileContext.length > 50000) {
        console.log("File context is too large, trimming to 50k chars");
        processedFileContext = fileContext.substring(0, 50000) + "\n... [Content truncated due to size limitations] ...";
      }
      
      // Check if the file content is actually readable or just a placeholder
      if (fileContext.startsWith("(") && fileContext.endsWith(")") && 
          (fileContext.includes("unavailable") || fileContext.includes("preview"))) {
        console.log("File content is a placeholder, providing more context to the model");
        processedFileContext += "\n\nNote to AI: This file could not be processed directly. Please acknowledge this limitation in your response.";
      } else {
        // Enhanced logging to diagnose content issues
        console.log("File context sample:", fileContext.substring(0, 500) + "...");
      }
    }
    
    // Call the Supabase Edge Function with improved error handling
    const { data, error } = await supabase.functions.invoke('gemini-faq', {
      body: { 
        prompt,
        fileContext: processedFileContext,
        includeFileContent: !!fileContext // Explicitly signal that file content is included
      },
    });

    if (error) {
      console.error('Error invoking gemini-faq function:', error);
      throw new Error(`Failed to get answer from Gemini AI: ${error.message}`);
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
