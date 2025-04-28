
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ChatMessage as ChatMessageType } from "@/models/workspace";
import { useSettings } from "@/context/SettingsContext";
import { User } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
  botImage?: string | null;
  isSelected?: boolean;
  onSelectMessage?: (messageId: string, selected: boolean) => void;
  selectionMode?: boolean;
}

export function ChatMessage({
  message,
  botImage,
  isSelected = false,
  onSelectMessage,
  selectionMode = false,
}: ChatMessageProps) {
  const { chatStyle } = useSettings();
  const isUser = message.role === "user";
  const messageContent = message.content.trim();

  if (chatStyle === 'compact') {
    return (
      <div className={cn(
        "flex items-start gap-3 py-4 px-3 group relative",
        isUser ? "bg-muted/50" : "bg-background"
      )}>
        <div className="flex-shrink-0">
          {isUser ? (
            <Avatar>
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar>
              {botImage ? (
                <AvatarImage src={botImage} alt="Bot" />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground">
                  AI
                </AvatarFallback>
              )}
            </Avatar>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold">{isUser ? "You" : "Gemini AI"}</p>
          <div className="text-sm whitespace-pre-wrap">
            {messageContent.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < messageContent.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {selectionMode && onSelectMessage && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectMessage(message.id, !!checked)}
            className="absolute top-4 right-3"
          />
        )}
      </div>
    );
  } else if (chatStyle === 'bubble') {
    return (
      <div className={cn(
        "flex items-end gap-3 py-4 px-3 group relative",
        isUser ? "justify-end" : "justify-start"
      )}>
        {!isUser && (
          <Avatar className="flex-shrink-0 mb-1">
            {botImage ? (
              <AvatarImage src={botImage} alt="Bot" />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground">
                AI
              </AvatarFallback>
            )}
          </Avatar>
        )}
        
        <div className={cn(
          "max-w-[80%] p-3 rounded-xl text-sm whitespace-pre-wrap",
          isUser 
            ? "bg-primary text-primary-foreground rounded-br-sm" 
            : "bg-muted rounded-bl-sm"
        )}>
          {messageContent.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < messageContent.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
        
        {isUser && (
          <Avatar className="flex-shrink-0 mb-1">
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
        
        {selectionMode && onSelectMessage && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectMessage(message.id, !!checked)}
            className={cn(
              "absolute top-4",
              isUser ? "left-3" : "right-3"
            )}
          />
        )}
      </div>
    );
  }

  // Default 'standard' style
  return (
    <Card
      className={cn(
        "relative group border-muted-foreground/20 mb-4",
        isSelected && "ring-2 ring-primary"
      )}
    >
      <div
        className={cn(
          "flex flex-col p-4",
          isUser ? "bg-muted/50" : "bg-background"
        )}
      >
        <div className={cn("flex items-start gap-4", isUser && "flex-row-reverse")}>
          <div className="flex-shrink-0">
            {isUser ? (
              <Avatar>
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar>
                {botImage ? (
                  <AvatarImage src={botImage} alt="Bot" />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    AI
                  </AvatarFallback>
                )}
              </Avatar>
            )}
          </div>
          <div className={cn("flex-1", isUser && "text-right")}>
            <p className="text-sm font-semibold mb-1">{isUser ? "You" : "Gemini AI"}</p>
            <div className="text-sm whitespace-pre-wrap">
              {messageContent.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < messageContent.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {selectionMode && onSelectMessage && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectMessage(message.id, !!checked)}
          className="absolute top-4 right-4"
        />
      )}
    </Card>
  );
}
