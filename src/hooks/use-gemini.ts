
import { useState } from 'react';
import { askGemini } from '@/integrations/gemini/client';
import { useToast } from '@/hooks/use-toast';

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const askQuestion = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const answer = await askGemini(prompt);
      setResponse(answer);
      return answer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get answer';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
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
