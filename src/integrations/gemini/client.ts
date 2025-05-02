
import { supabase } from "@/integrations/supabase/client";

/**
 * Send a prompt to the Gemini AI for answering questions
 * Includes support for passing file content context
 */
export async function askGemini(prompt: string, fileContext?: string): Promise<string> {
  try {
    console.log("Calling Gemini with prompt:", prompt.substring(0, 100) + (prompt.length > 100 ? "..." : ""));
    console.log("File context provided:", fileContext ? "Yes" : "No");
    
    let enhancedPrompt = prompt;
    let includeFileContent = false;
    
    if (fileContext) {
      console.log("File context length:", fileContext.length, "characters");
      includeFileContent = true;
      
      // Limit file context if it's too large to avoid token issues
      if (fileContext.length > 50000) {
        console.log("File context is too large, trimming to 50k chars");
        fileContext = fileContext.substring(0, 50000) + "\n... [Content truncated due to size limitations] ...";
      }
      
      // For suggestion generation, we make the prompt more focused on concise responses
      if (prompt.includes("Generate follow-up questions")) {
        enhancedPrompt = `${prompt}

Please return ONLY a numbered list of questions with no preamble or explanation. Example format:
1. First question here?
2. Second question here?`;
      } else {
        // Format the prompt to make it clear we're sending file content for context
        enhancedPrompt = `I have the following file content that I want you to analyze and use to answer my question.
        
File content:
${fileContext}

My question is: ${prompt}

Please analyze the file content above and answer my question based on that information.`;
      }
      
      // Enhanced logging to diagnose content issues
      console.log("Enhanced prompt with file context, total length:", enhancedPrompt.length);
      console.log("First 500 chars of file context:", fileContext.substring(0, 500) + "...");
    }
    
    // Check if this is a suggestion request
    const isSuggestionRequest = prompt.includes("Generate follow-up questions");
    
    // Generate a unique cache key to avoid using stale suggestion data
    const timestamp = Date.now();
    const cacheKey = isSuggestionRequest ? 
      `suggestions-${timestamp}-${prompt.substring(0, 50)}` : 
      undefined;
    
    console.log("Cache key for request:", cacheKey || "none (not a suggestion request)");
    
    // Call the Supabase Edge Function with improved error handling
    const { data, error } = await supabase.functions.invoke('gemini-faq', {
      body: { 
        prompt: enhancedPrompt,
        includeFileContent: includeFileContent, // Explicitly signal that file content is included
        fileContext: fileContext,
        isSuggestionRequest: isSuggestionRequest,
        cacheKey: cacheKey // Add unique cache key for suggestion requests
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
