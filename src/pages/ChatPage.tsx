import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatExportButton } from "@/components/ChatExportButton";
import { FileViewer } from "@/components/FileViewer";
import { BotImageSelector } from "@/components/BotImageSelector";
import { useAuth } from "@/components/AuthProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Settings, Menu, File, ArrowLeftFromLine, ArrowRightFromLine } from "lucide-react";
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
import { askGemini } from "@/integrations/gemini/client";
import { readFileContent } from "@/utils/readFileContent";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
  isPinned?: boolean;
}

interface FileItem {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

export default function ChatPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [botImageUrl, setBotImageUrl] = useState<string | null>(null);
  const [isBotSettingsOpen, setIsBotSettingsOpen] = useState(false);
  
  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [isFileViewerMinimized, setIsFileViewerMinimized] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "f1",
      name: "project-report.pdf",
      size: "2.4 MB",
      type: "application/pdf",
      url: "https://example.com/files/project-report.pdf"
    },
    {
      id: "f2",
      name: "screenshot.png",
      size: "1.2 MB",
      type: "image/png",
      url: "https://via.placeholder.com/800x600"
    }
  ]);
  
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
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    const sampleSessions: ChatSession[] = [
      {
        id: "s1",
        title: "Introduction to ChatWiz",
        lastMessage: "Let me show you how I can help.",
        timestamp: new Date(),
        isPinned: true,
        messages: [
          {
            id: "m1",
            content: "Hello! Welcome to Katagrafy.ai. How can I help you today?",
            role: "assistant",
            timestamp: new Date(),
          },
        ],
      },
      {
        id: "s2",
        title: "Project Planning",
        lastMessage: "I'll help you outline your project.",
        timestamp: new Date(Date.now() - 86400000),
        messages: [
          {
            id: "m2",
            content: "I need help planning my new project.",
            role: "user",
            timestamp: new Date(Date.now() - 86400000),
          },
          {
            id: "m3",
            content: "I'd be happy to help with your project planning. What kind of project are you working on?",
            role: "assistant",
            timestamp: new Date(Date.now() - 86400000 + 30000),
          },
        ],
      },
      {
        id: "s3",
        title: "Data Analysis Tips",
        lastMessage: "These techniques will help analyze your data better.",
        timestamp: new Date(Date.now() - 172800000),
        messages: [
          {
            id: "m4",
            content: "What's the best way to analyze this dataset?",
            role: "user",
            timestamp: new Date(Date.now() - 172800000),
          },
          {
            id: "m5",
            content: "For your dataset, I recommend starting with exploratory data analysis. This involves summarizing the main characteristics using statistical methods and visualization techniques.",
            role: "assistant",
            timestamp: new Date(Date.now() - 172800000 + 30000),
          },
        ],
      },
    ];
    
    const sortedSessions = [...sampleSessions].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
    
    setSessions(sortedSessions);
    setActiveSessionId("s1");
    setMessages(sampleSessions[0].messages);
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  useEffect(() => {
    if (activeSessionId) {
      const activeSession = sessions.find((s) => s.id === activeSessionId);
      if (activeSession) {
        setMessages(activeSession.messages);
      }
    }
    
    setSelectedMessageIds([]);
    setSelectionMode(false);
  }, [activeSessionId, sessions]);
  
  const handleSendMessage = async (content: string) => {
    if (!activeSessionId) {
      handleNewSession(content);
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setSessions((prev) =>
      prev.map((session) => session.id === activeSessionId
        ? { ...session, lastMessage: content, timestamp: new Date(), messages: [...session.messages, userMessage] }
        : session
      )
    );

    setIsProcessing(true);

    try {
      let prompt = content;
      if (files.length > 0) {
        const fileTexts = [];
        for (let file of files.slice(0, 2)) {
          fileTexts.push(`User uploaded file: ${file.name} (${file.type}), URL: ${file.url}`);
        }
        prompt += "\n\n[Context: The following files are uploaded by the user:]\n" + fileTexts.join("\n");
      }

      const answer = await askGemini(prompt);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: answer,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeSessionId
            ? { ...session, messages: [...session.messages, userMessage, aiMessage] }
            : session
        )
      );
    } catch (error: any) {
      toast({
        title: "Gemini Error",
        description: error?.message || "Failed to get a response from Gemini AI.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewSession = (initialMessage?: string) => {
    const newSessionId = `s${Date.now()}`;
    
    let newMessages: Message[] = [];
    let sessionTitle = "New Conversation";
    
    if (initialMessage) {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: initialMessage,
        role: "user",
        timestamp: new Date(),
      };
      
      newMessages = [userMessage];
      
      sessionTitle = initialMessage.split(" ").slice(0, 3).join(" ") + "...";
    }
    
    const newSession: ChatSession = {
      id: newSessionId,
      title: sessionTitle,
      lastMessage: initialMessage || "Start a new conversation",
      timestamp: new Date(),
      messages: newMessages,
    };
    
    setSessions((prev) => {
      const updatedSessions = [newSession, ...prev];
      return updatedSessions.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
    });
    
    setActiveSessionId(newSessionId);
    setMessages(newMessages);
    
    if (initialMessage) {
      handleSendMessage(initialMessage);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    
    if (activeSessionId === sessionId) {
      const remainingSessions = sessions.filter((s) => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        setActiveSessionId(remainingSessions[0].id);
        setMessages(remainingSessions[0].messages);
      } else {
        setActiveSessionId(null);
        setMessages([]);
      }
    }
    
    toast({
      title: "Chat deleted",
      description: "The chat has been removed from your history.",
    });
  };

  const handlePinSession = (sessionId: string) => {
    setSessions((prev) => {
      const updatedSessions = prev.map((session) => {
        if (session.id === sessionId) {
          return {
            ...session,
            isPinned: !session.isPinned,
          };
        }
        return session;
      });
      
      return updatedSessions.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
    });
    
    toast({
      title: sessions.find(s => s.id === sessionId)?.isPinned 
        ? "Chat unpinned" 
        : "Chat pinned",
      description: sessions.find(s => s.id === sessionId)?.isPinned 
        ? "Chat removed from favorites" 
        : "Chat added to favorites",
    });
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

  const handleFileUpload = async (file: File) => {
    const fileId = `f${Date.now()}`;
    const fileSize = file.size < 1024 
      ? `${file.size} B`
      : file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    let previewContent = "";
    try {
      const content = await readFileContent(file);
      if (content && content.length < 1800) {
        previewContent = content;
      } else if (content) {
        previewContent = content.slice(0, 1800) + '...';
      } else {
        previewContent = "(File uploaded, but no text preview available)";
      }
    } catch {
      previewContent = "(Could not read file content)";
    }

    const newFile: FileItem = {
      id: fileId,
      name: file.name,
      size: fileSize,
      type: file.type,
      url: URL.createObjectURL(file),
    };

    setFiles((prev) => [...prev, newFile]);
    if (!isFileViewerOpen) {
      setIsFileViewerOpen(true);
      setIsFileViewerMinimized(false);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    
    toast({
      title: "File deleted",
      description: "The file has been removed from this workspace.",
    });
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
          {isSidebarExpanded ? (
            <ChatSidebar
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={handleSelectSession}
              onNewSession={() => handleNewSession()}
              onDeleteSession={handleDeleteSession}
              onPinSession={handlePinSession}
              onExportChats={handleExportChats}
              userPlan={userPlan}
              onToggleSidebar={toggleSidebarExpand}
              promptsRemaining={promptsRemaining}
            />
          ) : (
            <div className="flex flex-col h-full py-4 items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mb-4"
                onClick={() => handleNewSession()}
                title="New Chat"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
              
              <ScrollArea className="flex-1 w-full">
                <div className="flex flex-col items-center gap-4 px-2">
                  {sessions.map((session) => (
                    <Button
                      key={session.id}
                      variant={activeSessionId === session.id ? "secondary" : "ghost"}
                      size="icon"
                      className="relative"
                      onClick={() => handleSelectSession(session.id)}
                      title={session.title}
                    >
                      <MessageSquare className="h-5 w-5" />
                      {session.isPinned && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400" />
                      )}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
              
              <Button
                variant="ghost"
                size="icon"
                className="mt-auto mb-2"
                onClick={toggleSidebarExpand}
                title="Expand sidebar"
              >
                <ArrowRightFromLine className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="mt-2"
                onClick={() => setIsBotSettingsOpen(true)}
                title="Bot settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          )}
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
                  ? sessions.find((s) => s.id === activeSessionId)?.title
                  : "New Conversation"}
              </h1>
              
              {activeSession && (
                <ChatExportButton 
                  sessionId={activeSession.id}
                  sessionTitle={activeSession.title}
                  messages={activeSession.messages}
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
                  {messages.length === 0 ? (
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
                  onSendMessage={handleSendMessage}
                  onFileUpload={handleFileUpload}
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
