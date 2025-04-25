import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useSettings } from '@/context/SettingsContext';

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
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <time
          dateTime={message.timestamp.toISOString()}
          className="block text-xs text-gray-500 dark:text-gray-400"
        >
          {message.timestamp.toLocaleTimeString()}
        </time>
      </div>
    </div>
  );
}
