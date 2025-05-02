
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
  }>({});
  const { toast } = useToast();

  const askQuestion = async (prompt: string, fileContext?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Asking Gemini with file context:", fileContext ? "Yes" : "No");
      const answer = await askGemini(prompt, fileContext);
      setResponse(answer);
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
    // Compare with last context to avoid unnecessary fetches
    const newContext = { lastQuestion, fileContext: fileContext ? 'yes' : undefined };
    const contextsEqual = JSON.stringify(newContext) === JSON.stringify(lastSuggestionsContext);
    
    // If we're already loading suggestions or context hasn't changed, don't fetch again
    if (isSuggestionsLoading || (contextsEqual && lastSuggestionsContext.lastQuestion !== undefined)) {
      console.log("Skipping suggestions fetch - context unchanged or already loading");
      return [];
    }
    
    try {
      setIsSuggestionsLoading(true);
      setLastSuggestionsContext(newContext);

      let prompt = "Generate 5 follow-up questions that would be useful for the user to ask next. ";
      
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
      
      // Parse the numbered list into array of questions
      const suggestions = suggestionsText
        .split('\n')
        .filter(line => /^\d+\./.test(line.trim())) // Only take numbered lines
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbers
        .filter(question => question.length > 0)
        .slice(0, 5); // Limit to 5 questions
      
      return suggestions.length > 0 ? suggestions : [
        "Can you explain more about this document?",
        "What are the main points in this file?",
        "Can you summarize this for me?",
        "What are the key insights from this information?",
        "How would you analyze this content?"
      ];
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
