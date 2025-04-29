
import React, { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatInput } from "@/components/ChatInput";
import { ChatHistory } from "@/components/ChatHistory";
import { ChatShareDialog } from "@/components/ChatShareDialog";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, Menu as MenuIcon, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChat } from "@/context/ChatContext";

export default function ChatPage() {
  const { isAuthenticated, user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  
  const { 
    sessions,
    activeSessionId,
    messages, 
    handleSendMessage, 
    handleNewSession,
    handleSelectSession,
    handleDeleteSession,
    handlePinSession,
    isLoading, 
    isProcessing
  } = useChat();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleNewChatClick = () => {
    handleNewSession();
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      
      <div className="flex-1 relative flex overflow-hidden">
        {/* Left Sidebar */}
        <div className={`${isMobile && !isSidebarOpen ? 'hidden' : 'flex'} flex-col w-full md:w-64 lg:w-80 border-r h-full bg-muted/40 dark:bg-muted/20 shrink-0 overflow-hidden`}>
          <ChatSidebar 
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
            onPinSession={handlePinSession}
            onExportChats={() => {}}
            userPlan="Basic"
            promptsRemaining={100}
            onToggleSidebar={() => setIsSidebarOpen(false)}
          />
        </div>
        
        {/* Main Chat Area - ensure it doesn't get pushed under sidebar */}
        <div className={`flex-1 flex flex-col h-full relative ${isMobile && isSidebarOpen ? 'hidden' : ''}`}>
          {/* Show toggle sidebar button on mobile */}
          {isMobile && !isSidebarOpen && (
            <Button
              onClick={() => setIsSidebarOpen(true)}
              variant="ghost"
              size="icon"
              className="absolute top-2 left-2 z-50"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          )}
          
          {/* Ensure the chat history and input are properly positioned */}
          <div className="flex-1 overflow-hidden relative flex flex-col">
            {/* Show empty state or chat history */}
            {!activeSessionId ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-2xl font-bold mb-2">Welcome to Katagrafy.ai</h2>
                  <p className="text-muted-foreground mb-4">
                    Start a new conversation or select an existing one to chat with our AI assistant.
                  </p>
                  <Button onClick={handleNewChatClick}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Conversation
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <ChatHistory 
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  onSelectSession={handleSelectSession}
                  onNewSession={handleNewSession}
                  onDeleteSession={handleDeleteSession}
                  onPinSession={handlePinSession}
                />
                <ChatInput 
                  onSendMessage={handleSendMessage}
                  isProcessing={isProcessing}
                />
              </>
            )}
          </div>
        </div>
      </div>
      
      <ChatShareDialog 
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        sessionId={activeSessionId || ""}
        sessionTitle={activeSessionId ? (sessions.find(s => s.id === activeSessionId)?.title || "Chat") : "Chat"}
      />
    </div>
  );
}
