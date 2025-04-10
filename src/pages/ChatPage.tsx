
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { WorkspaceSelector } from "@/components/WorkspaceSelector";
import { ChatHistory } from "@/components/ChatHistory";
import { FileViewer } from "@/components/FileViewer";
import { useAuth } from "@/components/AuthProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Menu, MessageSquare, File } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

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
  
  const [currentWorkspace, setCurrentWorkspace] = useState("w1");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [isFileViewerMinimized, setIsFileViewerMinimized] = useState(false);
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
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    // Initialize with some sample data
    const sampleSessions: ChatSession[] = [
      {
        id: "s1",
        title: "Introduction to ChatWiz",
        lastMessage: "Let me show you how I can help.",
        timestamp: new Date(),
        messages: [
          {
            id: "m1",
            content: "Hello! Welcome to ChatWiz. How can I help you today?",
            role: "assistant",
            timestamp: new Date(),
          },
        ],
      },
      {
        id: "s2",
        title: "Project Planning",
        lastMessage: "I'll help you outline your project.",
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
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
    ];
    
    setSessions(sampleSessions);
    setActiveSessionId("s1");
    setMessages(sampleSessions[0].messages);
  }, []);
  
  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  useEffect(() => {
    // Update messages when active session changes
    if (activeSessionId) {
      const activeSession = sessions.find((s) => s.id === activeSessionId);
      if (activeSession) {
        setMessages(activeSession.messages);
      }
    }
  }, [activeSessionId, sessions]);
  
  const handleSendMessage = async (content: string) => {
    if (!activeSessionId) {
      // Create a new session if none is active
      handleNewSession(content);
      return;
    }
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date(),
    };
    
    // Update messages state
    setMessages((prev) => [...prev, userMessage]);
    
    // Update sessions with the new message
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            lastMessage: content,
            timestamp: new Date(),
            messages: [...session.messages, userMessage],
          };
        }
        return session;
      })
    );
    
    // Simulate AI response
    setIsProcessing(true);
    
    // Simulate API delay
    setTimeout(() => {
      const botResponses = [
        "I understand what you're looking for. Let me help you with that.",
        "That's an interesting question. Here's what I think about it.",
        "I can definitely assist with that request.",
        "Let me process that and provide you with a helpful response.",
        "I've analyzed your question and here's what I found.",
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: randomResponse,
        role: "assistant",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              messages: [...session.messages, userMessage, aiMessage],
            };
          }
          return session;
        })
      );
      
      setIsProcessing(false);
    }, 1500);
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
      
      // Use first few words of user message as session title
      sessionTitle = initialMessage.split(" ").slice(0, 3).join(" ") + "...";
    }
    
    const newSession: ChatSession = {
      id: newSessionId,
      title: sessionTitle,
      lastMessage: initialMessage || "Start a new conversation",
      timestamp: new Date(),
      messages: newMessages,
    };
    
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setMessages(newMessages);
    
    if (initialMessage) {
      // If there was an initial message, simulate a response
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
      // If we deleted the active session, set to the first available or null
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
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
  
  const handleDeleteFile = (fileId: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    
    toast({
      title: "File deleted",
      description: "The file has been removed from this workspace.",
    });
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
        {/* Sidebar */}
        <aside
          className={`w-72 border-r bg-card transition-all duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } ${isMobile ? "absolute z-20 h-[calc(100%-64px)]" : "relative"}`}
        >
          <div className="flex h-full flex-col">
            <div className="p-4">
              <WorkspaceSelector onSelect={setCurrentWorkspace} />
            </div>
            <div className="flex-1 overflow-auto">
              <ChatHistory
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={handleSelectSession}
                onNewSession={() => handleNewSession()}
                onDeleteSession={handleDeleteSession}
              />
            </div>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              {activeSessionId 
                ? sessions.find((s) => s.id === activeSessionId)?.title
                : "New Conversation"}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFileViewer}
              className="md:flex items-center justify-center"
              title="Toggle file viewer"
            >
              <File className="h-5 w-5" />
            </Button>
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
                        Type a message below to start chatting with ChatWiz, your AI-powered
                        conversation assistant.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isProcessing={isProcessing}
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
    </div>
  );
}
