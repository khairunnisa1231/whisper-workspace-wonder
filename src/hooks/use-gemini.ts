
import { useState } from 'react';
import { askGemini } from '@/integrations/gemini/client';
import { useToast } from '@/hooks/use-toast';

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const askQuestion = async (prompt: string, fileContext?: string) => {
    console.log('Starting askQuestion with prompt:', prompt.substring(0, 50) + '...');
    setIsLoading(true);
    setError(null);
    
    try {
      const answer = await askGemini(prompt, fileContext);
      console.log('Received answer from Gemini, length:', answer.length);
      setResponse(answer);
      return answer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get answer';
      console.error('Error in askQuestion:', errorMessage);
      setError(errorMessage);
      toast({
        title: "Gemini Error",
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
