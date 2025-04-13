
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, MessageSquare, Trash2, Star, ArrowLeftFromLine, ArrowRightFromLine, Copyright } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSelector } from "./WorkspaceSelector";

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isPinned?: boolean;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onPinSession: (sessionId: string) => void;
  userPlan: string;
  isSidebarExpanded: boolean;
  onToggleSidebar: () => void;
  promptsRemaining?: number;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onPinSession,
  userPlan,
  isSidebarExpanded,
  onToggleSidebar,
  promptsRemaining = 100,
}: ChatSidebarProps) {
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);
  
  // Group and sort chats - pinned first, then by date
  const sortedSessions = [...sessions].sort((a, b) => {
    // Pinned sessions first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then sort by date (newest first)
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
  
  const handleWorkspaceSelect = (workspaceId: string) => {
    console.log("Selected workspace: ", workspaceId);
    // In a real app, you would filter chats by workspace
  };
  
  return (
    <div className="flex flex-col h-full border-r bg-card">
      <div className="p-4 flex flex-col gap-3 border-b">
        <WorkspaceSelector onSelect={handleWorkspaceSelect} />
        
        <Button 
          onClick={onNewSession}
          className="w-full flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
        
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            title={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarExpanded ? <ArrowLeftFromLine className="h-4 w-4" /> : <ArrowRightFromLine className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-medium">Recent Conversations</h3>
      </div>
      
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pb-4">
          {sortedSessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "relative rounded-md p-3 text-sm cursor-pointer transition-colors group",
                activeSessionId === session.id
                  ? "bg-secondary text-secondary-foreground"
                  : "hover:bg-muted"
              )}
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
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
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
                    <Star className={cn("h-3 w-3", session.isPinned && "fill-yellow-400 text-yellow-400")} />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-70 hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                        title="Delete chat"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this chat from your history.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t mt-auto space-y-4">
        <div className="rounded-md bg-muted p-3">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Current Plan</h4>
            <Badge variant="outline" className="text-xs">{userPlan}</Badge>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Usage this month</span>
              <span className="font-medium">{promptsRemaining} prompts left</span>
            </div>
            <div className="w-full h-2 bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${Math.min(100 - (promptsRemaining / 150 * 100), 100)}%` }}
              ></div>
            </div>
          </div>
          <Link to="/pricing">
            <Button size="sm" className="w-full">
              Upgrade Plan
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-center text-xs text-muted-foreground">
          <Copyright className="h-3 w-3 mr-1" />
          <span>{new Date().getFullYear()} Katagrafy.ai</span>
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
