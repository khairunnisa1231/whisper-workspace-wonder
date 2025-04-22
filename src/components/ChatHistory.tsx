
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, MessageSquare, Trash2, Star } from "lucide-react";

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isPinned?: boolean;
}

interface ChatHistoryProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onPinSession: (sessionId: string) => void;  // Added this prop
}

export function ChatHistory({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onPinSession,
}: ChatHistoryProps) {
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);
  
  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-4">
        <Button 
          onClick={onNewSession}
          className="w-full flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <h3 className="text-sm font-medium mb-2">Recent Conversations</h3>
      
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`relative rounded-md p-3 text-sm cursor-pointer transition-colors ${
                activeSessionId === session.id
                  ? "bg-secondary text-white"
                  : "hover:bg-muted"
              }`}
              onClick={() => onSelectSession(session.id)}
              onMouseEnter={() => setHoveredSession(session.id)}
              onMouseLeave={() => setHoveredSession(null)}
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-1">
                    <h4 className="font-medium truncate flex-1">{session.title}</h4>
                    {session.isPinned && (
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                  <p className="truncate text-xs opacity-70">
                    {session.lastMessage}
                  </p>
                  <span className="text-xs opacity-50 mt-1 block">
                    {session.timestamp.toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {(hoveredSession === session.id || activeSessionId === session.id) && (
                <div className="absolute right-1 top-1 flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-70 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPinSession(session.id);
                    }}
                    title={session.isPinned ? "Unpin chat" : "Pin chat"}
                  >
                    <Star className={`h-3 w-3 ${session.isPinned && "fill-yellow-400 text-yellow-400"}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-70 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
