
import { useState } from 'react';
import { askGemini } from '@/integrations/gemini/client';
import { useToast } from '@/hooks/use-toast';

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSuggestionsContext, setLastSuggestionsContext] = useState<{
    lastQuestion?: string;
    fileContext?: string;
    timestamp?: number;
  }>({});
  const { toast } = useToast();

  const askQuestion = async (prompt: string, fileContext?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Asking Gemini with file context:", fileContext ? "Yes" : "No");
      const answer = await askGemini(prompt, fileContext);
      setResponse(answer);
      
      // After getting a response, force new suggestions by adding a timestamp
      setLastSuggestionsContext({
        lastQuestion: prompt,
        fileContext: fileContext ? 'yes' : undefined,
        timestamp: Date.now()
      });
      
      return answer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get answer';
      setError(errorMessage);
      let description = errorMessage;
      if (errorMessage.toLowerCase().includes("api key")) {
        description = "Gemini API key is missing or invalid. Please check your Gemini key.";
      }
      toast({
        title: "Gemini Error",
        description,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = async (lastQuestion?: string, fileContext?: string): Promise<string[]> => {
    // Create context object with timestamp to track changes
    const newContext = { 
      lastQuestion, 
      fileContext: fileContext ? 'yes' : undefined,
      timestamp: lastSuggestionsContext.timestamp
    };
    
    // Debug the context comparison
    console.log("Current context:", JSON.stringify(newContext));
    console.log("Last context:", JSON.stringify(lastSuggestionsContext));
    
    // Check if contexts are equal - ignoring timestamp for comparison
    const lastContextWithoutTimestamp = {...lastSuggestionsContext};
    delete lastContextWithoutTimestamp.timestamp;
    
    const newContextWithoutTimestamp = {...newContext};
    delete newContextWithoutTimestamp.timestamp;
    
    const contextsEqual = JSON.stringify(newContextWithoutTimestamp) === JSON.stringify(lastContextWithoutTimestamp);
    
    // If we're already loading suggestions or context hasn't changed and no timestamp change, don't fetch again
    // Only skip if we have the same context AND it's not a fresh request after a Gemini reply
    if (isSuggestionsLoading || (contextsEqual && lastContextWithoutTimestamp.lastQuestion !== undefined && 
        newContext.timestamp === lastSuggestionsContext.timestamp)) {
      console.log("Skipping suggestions fetch - context unchanged or already loading");
      return [];
    }
    
    try {
      setIsSuggestionsLoading(true);
      setLastSuggestionsContext({...newContext, timestamp: Date.now()});
      console.log("Fetching new suggestions with context:", JSON.stringify(newContext));

      let prompt = "Generate 3 to 6 follow-up questions that would be useful for the user to ask next. ";
      
      if (lastQuestion) {
        prompt += `They previously asked: "${lastQuestion}". `;
      }
      
      if (fileContext) {
        prompt += "Based on the file content they've uploaded: " + fileContext;
      } else if (!lastQuestion) {
        // Default if we have neither
        prompt += "Suggest general questions that would be good starting points.";
      }
      
      prompt += " Return ONLY the questions as a numbered list, with no additional text.";
      
      const suggestionsText = await askGemini(prompt, undefined);
      console.log("Received suggestions text:", suggestionsText);
      
      // Parse the numbered list into array of questions
      const suggestions = suggestionsText
        .split('\n')
        .filter(line => /^\d+\./.test(line.trim())) // Only take numbered lines
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbers
        .filter(question => question.length > 0)
        .slice(0, 6); // Limit to 6 questions
      
      console.log("Parsed suggestions:", suggestions);
      
      if (suggestions.length >= 3) {
        return suggestions;
      } else {
        // Fallback if parsing fails
        console.log("Using fallback suggestions");
        return [
          "Can you explain more about this document?",
          "What are the main points in this file?",
          "Can you summarize this for me?",
          "What are the key insights from this information?",
          "How would you analyze this content?"
        ];
      }
    } catch (err) {
      console.error("Error getting suggestions:", err);
      // Return default questions if there's an error
      return [
        "Can you explain more about this document?",
        "What are the main points in this file?",
        "Can you summarize this for me?",
        "What are the key insights from this information?",
        "How would you analyze this content?"
      ];
    } finally {
      setIsSuggestionsLoading(false);
    }
  };

  return {
    askQuestion,
    getSuggestions,
    isLoading,
    isSuggestionsLoading,
    response,
    error,
  };
}
