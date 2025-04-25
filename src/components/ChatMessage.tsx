
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useSettings } from '@/context/SettingsContext';
import { Copy, Speaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant";
    sessionId: string;
    timestamp: Date;
  };
  botImage?: string | null;
  isSelected?: boolean;
  onSelectMessage?: (messageId: string, selected: boolean) => void;
  selectionMode?: boolean;
}

const fontSizeClasses = {
  small: 'text-sm',
  default: 'text-base',
  large: 'text-lg'
};

export function ChatMessage({ message, botImage, isSelected, onSelectMessage, selectionMode }: ChatMessageProps) {
  const { fontSize } = useSettings();
  const { toast } = useToast();
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        description: "Message copied to clipboard",
      });
    } catch (err) {
      toast({
        description: "Failed to copy message",
        variant: "destructive"
      });
    }
  };
  
  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(message.content);
    window.speechSynthesis.speak(utterance);
  };
  
  return (
    <div className={`flex gap-4 ${message.role === 'assistant' ? 'bg-muted/50' : ''} p-4 rounded-lg`}>
      {selectionMode && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => {
            if (onSelectMessage) {
              onSelectMessage(message.id, checked === true);
            }
          }}
          className="shrink-0 mt-1.5"
        />
      )}
      
      <div className={`flex w-full gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        {message.role === 'assistant' ? (
          <Avatar>
            <AvatarImage src={botImage || "/katagrafy-logo.png"} alt="Bot Avatar" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        ) : (
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex-1 space-y-2 overflow-hidden ${fontSizeClasses[fontSize]}`}>
          <div className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative max-w-[80%] group ${
              message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            } rounded-lg p-4`}>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              
              <div className={`absolute ${
                message.role === 'user' ? '-left-12' : '-right-12'
              } top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleSpeak}
                >
                  <Speaker className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <time
            dateTime={message.timestamp.toISOString()}
            className={`block text-xs text-gray-500 dark:text-gray-400 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            {message.timestamp.toLocaleTimeString()}
          </time>
        </div>
      </div>
    </div>
  );
}
