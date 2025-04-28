
import { useState } from 'react';
import { askGemini } from '@/integrations/gemini/client';
import { useToast } from '@/hooks/use-toast';

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  return {
    askQuestion,
    isLoading,
    response,
    error,
  };
}
