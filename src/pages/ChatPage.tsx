
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatHistory } from "@/components/ChatHistory";
import { ChatExportButton } from "@/components/ChatExportButton";
import { FileViewer } from "@/components/FileViewer";
import { BotSettings } from "@/components/BotSettings";
import { useAuth } from "@/components/AuthProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Settings, Menu, File, Users, Share2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ChatProvider, useChat } from "@/context/ChatContext";
import { WorkspaceSelector } from "@/components/WorkspaceSelector";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ChatShareDialog } from "@/components/ChatShareDialog";
import { SettingsProvider, useSettings } from "@/context/SettingsContext";
import { ChatStyleSelector } from "@/components/ChatStyleSelector";

function ChatPageContent() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { chatStyle, botImageUrl, setChatStyle } = useSettings();
  
  const {
    sessions,
    activeSessionId,
    activeWorkspaceId,
    messages,
    files,
    isLoading,
    isProcessing,
    handleSelectSession,
    handleNewSession,
    handleDeleteSession,
    handlePinSession,
    handleSendMessage,
    handleFileUpload,
    handleDeleteFile,
    setActiveWorkspace
  } = useChat();
  
  const [isBotSettingsOpen, setIsBotSettingsOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  
  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [isFileViewerMinimized, setIsFileViewerMinimized] = useState(false);
  
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const userPlan = "Basic";
  const promptsRemaining = 85;
  
  const recommendedPrompts = [
    "Help me draft an email to my boss",
    "Explain machine learning concepts to a beginner",
    "Write a blog post about productivity tips",
    "Create a workout plan for beginners",
    "Suggest 5 books to read this summer",
    "Generate ideas for my marketing campaign",
    "Help me troubleshoot my code",
    "Write a story about a space traveler"
  ];
  
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState<null | "success" | "error" | "notfound">(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    console.log("Messages updated:", messages);
  }, [messages]);
  
  const handleFileInputChange = async (file: File) => {
    try {
      console.log('Uploading file:', file.name);
      await handleFileUpload(file);
      if (!isFileViewerOpen) {
        setIsFileViewerOpen(true);
        setIsFileViewerMinimized(false);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleSelectMessage = (messageId: string, selected: boolean) => {
    setSelectedMessageIds(prev => {
      if (selected) {
        return [...prev, messageId];
      } else {
        return prev.filter(id => id !== messageId);
      }
    });
  };

  const toggleSelectionMode = () => {
    setSelectionMode(prev => !prev);
    if (selectionMode) {
      setSelectedMessageIds([]);
    }
  };

  const handleExportChats = () => {
    try {
      toast({
        title: "Exporting all chats",
        description: "Your conversations are being exported.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your chats. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarExpand = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const toggleFileViewer = () => {
    if (isFileViewerMinimized) {
      setIsFileViewerMinimized(false);
    } else {
      setIsFileViewerOpen(!isFileViewerOpen);
    }
  };

  const toggleFileViewerMinimize = () => {
    setIsFileViewerMinimized(!isFileViewerMinimized);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);
  
  const handleWorkspaceSelect = (workspaceId: string) => {
    console.log('Selected workspace:', workspaceId);
    setActiveWorkspace(workspaceId);
  };

  const handleSendMessageWithLog = async (content: string) => {
    console.log('Sending message:', content);
    try {
      await handleSendMessage(content);
      console.log('Message sent successfully, messages length:', messages.length + 1);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleInviteUser = async () => {
    setInviteLoading(true);
    setInviteStatus(null);

    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", inviteEmail.toLowerCase())
      .maybeSingle();

    if (error) {
      setInviteStatus("error");
      setInviteLoading(false);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return;
    }

    if (!data || !data.id) {
      setInviteStatus("notfound");
      setInviteLoading(false);
      toast({
        title: "User Not Found",
        description: "This email is not registered. Please ask them to sign up.",
        variant: "destructive"
      });
      return;
    }

    setInviteStatus("success");
    setInviteLoading(false);
    toast({
      title: "User Invited",
      description: `Invitation sent to ${inviteEmail}`,
    });
    setInviteEmail("");
    setIsInviteOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      
      <main className="flex flex-1 overflow-hidden">
        <aside
          className={`${isSidebarExpanded ? 'w-72' : 'w-20'} border-r bg-card transition-all duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } ${isMobile ? "absolute z-20 h-[calc(100%-64px)]" : "relative"}`}
        >
          <div className="p-4 flex flex-col gap-3 border-b">
            <WorkspaceSelector onSelect={handleWorkspaceSelect} />
          </div>
          
          <ChatHistory
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={() => handleNewSession()}
            onDeleteSession={handleDeleteSession}
            onPinSession={handlePinSession}
          />
        </aside>
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              title="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">
                {activeSessionId 
                  ? sessions.find((s) => s.id === activeSessionId)?.title || "Conversation"
                  : "New Conversation"}
              </h1>
              
              {activeSession && (
                <ChatExportButton 
                  sessionId={activeSession.id}
                  sessionTitle={activeSession.title}
                  messages={messages}
                  selectedMessageIds={selectedMessageIds}
                  onToggleSelectionMode={toggleSelectionMode}
                  selectionMode={selectionMode}
                />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {activeSession && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsShareDialogOpen(true)}
                  title="Share chat"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsBotSettingsOpen(true)}
                title="Bot settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFileViewer}
                title="Toggle file viewer"
              >
                <File className="h-5 w-5" />
              </Button>
              <ChatStyleSelector 
                currentStyle={chatStyle} 
                onChange={setChatStyle}
              />
            </div>
          </div>
          
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={isFileViewerOpen ? 70 : 100} minSize={40}>
              <div className="flex flex-col h-full">
                <ScrollArea className="flex-1 p-4">
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="rounded-full bg-primary/10 p-4 mb-4">
                        <MessageSquare className="h-10 w-10 text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold mb-2">
                        Start a New Conversation
                      </h2>
                      <p className="text-muted-foreground max-w-md">
                        Type a message below to start chatting with Katagrafy.ai, your AI-powered
                        conversation assistant.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 pb-20">
                      {messages.map((message) => (
                        <ChatMessage 
                          key={message.id} 
                          message={message} 
                          botImage={botImageUrl}
                          isSelected={selectedMessageIds.includes(message.id)}
                          onSelectMessage={handleSelectMessage}
                          selectionMode={selectionMode}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
                <div className="absolute bottom-0 left-0 right-0">
                  <ChatInput
                    onSendMessage={handleSendMessageWithLog}
                    onFileUpload={handleFileInputChange}
                    isProcessing={isProcessing}
                    recommendedPrompts={recommendedPrompts}
                  />
                </div>
              </div>
            </ResizablePanel>
            
            {isFileViewerOpen && !isFileViewerMinimized && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={20}>
                  <FileViewer 
                    files={files}
                    onClose={toggleFileViewer}
                    onDelete={handleDeleteFile}
                    isMinimized={isFileViewerMinimized}
                    onToggleMinimize={toggleFileViewerMinimize}
                  />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
          
          {isFileViewerMinimized && (
            <FileViewer 
              files={files}
              onClose={toggleFileViewer}
              onDelete={handleDeleteFile}
              isMinimized={isFileViewerMinimized}
              onToggleMinimize={toggleFileViewerMinimize}
            />
          )}
        </div>
      </main>

      <BotSettings 
        open={isBotSettingsOpen}
        onOpenChange={setIsBotSettingsOpen}
        botImageUrl={botImageUrl}
        onSelectBotImage={() => {}}
      />
      
      {activeSession && (
        <ChatShareDialog
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          sessionId={activeSession.id}
          sessionTitle={activeSession.title}
        />
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <SettingsProvider>
      <ChatProvider>
        <ChatPageContent />
      </ChatProvider>
    </SettingsProvider>
  );
}
