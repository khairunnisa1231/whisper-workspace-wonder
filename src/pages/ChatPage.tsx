
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatHistory } from "@/components/ChatHistory";
import { ChatExportButton } from "@/components/ChatExportButton";
import { FileViewer } from "@/components/FileViewer";
import { BotImageSelector } from "@/components/BotImageSelector";
import { useAuth } from "@/components/AuthProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Settings, Menu, File, AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { ChatProvider, useChat } from "@/context/ChatContext";
import { WorkspaceSelector } from "@/components/WorkspaceSelector";
import { useWorkspaceRedirect } from "@/utils/workspaceUtils";

function ChatPageContent() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { checkAndRedirect } = useWorkspaceRedirect();
  
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
  
  const [botImageUrl, setBotImageUrl] = useState<string | null>(null);
  const [isBotSettingsOpen, setIsBotSettingsOpen] = useState(false);
  
  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [isFileViewerMinimized, setIsFileViewerMinimized] = useState(false);
  
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
  
  // Check if user is authenticated and if there's an active workspace
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (activeWorkspaceId === null) {
      toast({
        title: "No workspace selected",
        description: "Please create or select a workspace first",
        variant: "destructive"
      });
      navigate("/workspaces");
    }
  }, [isAuthenticated, activeWorkspaceId, navigate, toast]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Debug log for messages
  useEffect(() => {
    console.log("Messages updated, count:", messages.length);
  }, [messages]);
  
  // Handle file upload
  const handleFileInputChange = async (file: File) => {
    if (!checkAndRedirect(activeWorkspaceId)) return;
    
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

  // Message selection handling
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

  // UI toggle functions
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
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
  
  // Workspace selection
  const handleWorkspaceSelect = (workspaceId: string) => {
    console.log('Selected workspace:', workspaceId);
    setActiveWorkspace(workspaceId);
  };

  // Send message with validation
  const handleSendMessageWithLog = async (content: string) => {
    if (!checkAndRedirect(activeWorkspaceId)) return;
    
    console.log('Sending message:', content);
    try {
      await handleSendMessage(content);
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Loading state
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No workspace selected
  if (activeWorkspaceId === null) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center max-w-md p-6">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Workspace Selected</h2>
            <p className="text-muted-foreground mb-6">
              You need to create or select a workspace before you can start chatting with Gemini.
            </p>
            <Button onClick={() => navigate("/workspaces")}>
              Go to Workspaces
            </Button>
          </div>
        </div>
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
                        Type a message below to start chatting with Gemini, your AI-powered
                        conversation assistant.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
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
                <ChatInput
                  onSendMessage={handleSendMessageWithLog}
                  onFileUpload={handleFileInputChange}
                  isProcessing={isProcessing}
                  recommendedPrompts={recommendedPrompts}
                />
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

      <Dialog open={isBotSettingsOpen} onOpenChange={setIsBotSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bot Settings</DialogTitle>
            <DialogDescription>
              Customize the appearance of your AI assistant
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <BotImageSelector 
                selectedImage={botImageUrl} 
                onSelectImage={setBotImageUrl} 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBotSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Settings updated",
                description: "Bot appearance has been updated successfully."
              });
              setIsBotSettingsOpen(false);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatPageContent />
    </ChatProvider>
  );
}
