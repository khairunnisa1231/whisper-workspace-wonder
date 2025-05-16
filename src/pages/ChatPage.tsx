import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { useChat } from "@/context/ChatContext";
import { WorkspaceSelector } from "@/components/WorkspaceSelector";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ChatShareDialog } from "@/components/ChatShareDialog";
import { useSettings } from "@/context/SettingsContext";
import { ChatStyleSelector } from "@/components/ChatStyleSelector";
import { ChatSidebar } from "@/components/ChatSidebar";
import { useGemini } from "@/hooks/use-gemini";
import { getFileContent } from "@/utils/readFileContent";

function ChatPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { chatStyle, botImageUrl, setChatStyle } = useSettings();
  const { getSuggestions, isSuggestionsLoading } = useGemini();
  
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
  
  // Track when suggestions were last updated
  const [lastSuggestionUpdate, setLastSuggestionUpdate] = useState<number>(Date.now());
  
  // Use memoized state for suggestedPrompts
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    "Help me understand this document",
    "What are the key points in this file?",
    "Summarize the main ideas",
    "Explain the context of this information",
    "Identify important patterns or trends"
  ]);
  
  // Memoize active session to prevent unnecessary re-renders and get the chat title
  const activeSession = useMemo(() => 
    sessions.find(s => s.id === activeSessionId),
    [sessions, activeSessionId]
  );
  
  // Get the first user message if available, to use as title
  const firstUserMessage = useMemo(() => {
    if (messages.length === 0) return null;
    return messages.find(msg => msg.role === 'user')?.content;
  }, [messages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // User plan information
  const userPlan = "Basic";
  const promptsRemaining = 85;
  
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState<null | "success" | "error" | "notfound">(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  // Parse workspace ID from URL query parameters when component loads
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const queryParams = new URLSearchParams(location.search);
      const workspaceId = queryParams.get('workspace');
      
      if (workspaceId && workspaceId !== activeWorkspaceId) {
        console.log('Setting active workspace from URL params:', workspaceId);
        setActiveWorkspace(workspaceId);
      }
    }
  }, [isAuthenticated, isLoading, location.search, activeWorkspaceId, setActiveWorkspace]);
  
  // Generate suggestions based on uploaded files and/or last message
  useEffect(() => {
    let isMounted = true;
    
    const generateSuggestions = async () => {
      try {
        // Only generate when we have messages or files
        if ((messages.length === 0 && files.length === 0) || isProcessing) {
          return;
        }

        // Get the last user message if available
        const lastUserMessage = [...messages]
          .reverse()
          .find(msg => msg.role === 'user')?.content;
          
        // Get the last assistant message if available to generate better follow-ups
        const lastAssistantMessage = [...messages]
          .reverse()
          .find(msg => msg.role === 'assistant')?.content;
        
        let fileContext = '';
        if (files.length > 0) {
          // Only use the most recent file for suggestions
          const mostRecentFile = [...files].sort((a, b) => 
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          )[0];
          
          try {
            const content = await getFileContent(mostRecentFile);
            if (content) {
              const trimmedContent = content.substring(0, 5000); // Limit for suggestions generation
              fileContext = `File: ${mostRecentFile.name}\n${trimmedContent}`;
            }
          } catch (error) {
            console.error(`Error reading file ${mostRecentFile.name} for suggestions:`, error);
          }
        }

        // Only proceed if the component is still mounted
        if (!isMounted) return;

        // Generate new suggestions with added context from assistant's last reply
        let lastQuestionContext = lastUserMessage;
        if (lastAssistantMessage && lastUserMessage) {
          lastQuestionContext = `${lastUserMessage} (Last AI response: ${lastAssistantMessage.substring(0, 200)}${lastAssistantMessage.length > 200 ? '...' : ''})`;
        }

        const newSuggestions = await getSuggestions(lastQuestionContext, fileContext);
        if (isMounted && newSuggestions.length > 0) {
          console.log("New suggestions generated:", newSuggestions);
          setSuggestedPrompts(newSuggestions);
        }
      } catch (error) {
        console.error("Failed to generate suggestions:", error);
      }
    };

    // Generate suggestions when messages change or lastSuggestionUpdate is updated
    const debounceTimer = setTimeout(() => {
      if (!isSuggestionsLoading) {
        generateSuggestions();
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [messages, files, getSuggestions, isSuggestionsLoading, isProcessing, lastSuggestionUpdate]);
  
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
      
      // Update suggestions after file upload
      setLastSuggestionUpdate(Date.now());
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleUrlUpload = async (url: string) => {
    try {
      console.log('Adding URL document:', url);
      
      // Create a mock File object with URL metadata
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1] || 'external-document';
      
      // Add URL as a special type of file
      await handleFileUpload({
        name: fileName,
        type: 'application/url',
        size: url.length,
        url: url,
        lastModified: Date.now()
      } as unknown as File);
      
      if (!isFileViewerOpen) {
        setIsFileViewerOpen(true);
        setIsFileViewerMinimized(false);
      }
      
      // Update suggestions after URL upload
      setLastSuggestionUpdate(Date.now());
      
      return true;
    } catch (error) {
      console.error('Error adding URL document:', error);
      throw error;
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

  const handleWorkspaceSelect = useCallback((workspaceId: string) => {
    console.log('Selected workspace:', workspaceId);
    setActiveWorkspace(workspaceId);
  }, [setActiveWorkspace]);

  // Modified message handler to also update suggestions after sending
  const handleSendMessageWithLog = useCallback(async (content: string) => {
    console.log('Sending message:', content);
    try {
      await handleSendMessage(content);
      console.log('Message sent successfully, messages length:', messages.length + 1);
      
      // After sending a message and getting a response, update suggestions
      // We use a slight delay to ensure the response has been received
      setTimeout(() => {
        setLastSuggestionUpdate(Date.now());
      }, 500);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [handleSendMessage, messages.length]);

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

  // Memoize the recommended prompts to prevent unnecessary re-renders
  const memoizedSuggestedPrompts = useMemo(() => {
    return suggestedPrompts;
  }, [suggestedPrompts]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get appropriate chat title
  const getChatTitle = () => {
    if (activeSessionId) {
      return sessions.find((s) => s.id === activeSessionId)?.title || "Conversation";
    }
    
    // If there's no active session but we have a first user message, use that as title
    if (firstUserMessage) {
      // Truncate long messages
      return firstUserMessage.length > 30 
        ? `${firstUserMessage.substring(0, 30)}...`
        : firstUserMessage;
    }
    
    // Default fallback
    return "New Conversation";
  };

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      
      <main className="flex flex-1 overflow-hidden">
        {/* Fixed sidebar */}
        <div 
          className={`${isSidebarExpanded ? 'w-72' : 'w-20'} border-r bg-card transition-all duration-300 flex flex-col ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } ${isMobile ? "absolute z-20 h-[calc(100%-64px)]" : "relative"}`}
        >
          {/* Use ChatSidebar component instead of inline sidebar */}
          <ChatSidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={() => handleNewSession()}
            onDeleteSession={handleDeleteSession}
            onPinSession={handlePinSession}
            onExportChats={handleExportChats}
            userPlan={userPlan}
            promptsRemaining={promptsRemaining}
            onToggleSidebar={toggleSidebar}
            onWorkspaceSelect={handleWorkspaceSelect}
          />
        </div>
        
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
                {getChatTitle()}
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
                <div className="sticky bottom-0 left-0 right-0 bg-background z-10">
                  <ChatInput
                    onSendMessage={handleSendMessageWithLog}
                    onFileUpload={handleFileInputChange}
                    onUrlUpload={handleUrlUpload}
                    isProcessing={isProcessing}
                    recommendedPrompts={memoizedSuggestedPrompts}
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
            <div className="absolute bottom-24 right-4 z-20">
              <FileViewer 
                files={files}
                onClose={toggleFileViewer}
                onDelete={handleDeleteFile}
                isMinimized={isFileViewerMinimized}
                onToggleMinimize={toggleFileViewerMinimize}
              />
            </div>
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

export default ChatPage;
