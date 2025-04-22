
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatSession, ChatMessage, WorkspaceFile } from '@/models/workspace';
import { 
  fetchChatSessions, 
  createChatSession, 
  deleteChatSession, 
  updateChatSessionPin,
  addChatMessage,
  fetchChatMessages,
  fetchWorkspaceFiles
} from '@/services/workspace-service';
import { askGemini } from '@/integrations/gemini/client';
import { readFileContent } from '@/utils/readFileContent';

interface ChatContextType {
  sessions: ChatSession[];
  activeSessionId: string | null;
  activeWorkspaceId: string | null;
  messages: ChatMessage[];
  files: WorkspaceFile[];
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  
  handleSelectSession: (sessionId: string) => void;
  handleNewSession: (initialMessage?: string) => Promise<void>;
  handleDeleteSession: (sessionId: string) => Promise<void>;
  handlePinSession: (sessionId: string) => Promise<void>;
  handleSendMessage: (content: string) => Promise<void>;
  handleFileUpload: (file: File) => Promise<void>;
  handleDeleteFile: (fileId: string) => Promise<void>;
  setActiveWorkspace: (workspaceId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get workspaceId from URL query params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const workspaceId = params.get('workspace');
    
    if (workspaceId) {
      setActiveWorkspaceId(workspaceId);
    }
  }, [location.search]);
  
  // Load chat sessions when workspaceId changes
  useEffect(() => {
    if (!activeWorkspaceId || !isAuthenticated || !user) return;
    
    async function loadData() {
      try {
        setIsLoading(true);
        
        // Load chat sessions
        const chatSessions = await fetchChatSessions(activeWorkspaceId);
        setSessions(chatSessions);
        
        // Set active session to the first one if available
        if (chatSessions.length > 0) {
          setActiveSessionId(chatSessions[0].id);
          setMessages(chatSessions[0].messages);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
        
        // Load workspace files
        const workspaceFiles = await fetchWorkspaceFiles(activeWorkspaceId);
        setFiles(workspaceFiles);
        
      } catch (err) {
        console.error('Error loading chat data:', err);
        toast({
          title: 'Error',
          description: 'Failed to load chat data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [activeWorkspaceId, isAuthenticated, user, toast]);
  
  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setMessages(session.messages);
    }
  };
  
  const handleNewSession = async (initialMessage?: string) => {
    if (!user || !activeWorkspaceId) return;
    
    try {
      let title = 'New Conversation';
      if (initialMessage) {
        title = initialMessage.slice(0, 30) + (initialMessage.length > 30 ? '...' : '');
      }
      
      const newSession = await createChatSession(activeWorkspaceId, user.id, title);
      
      if (initialMessage) {
        // Add user message
        const userMessage = await addChatMessage(newSession.id, initialMessage, 'user');
        newSession.messages = [userMessage];
        
        // Process with Gemini and add AI response
        await handleSendMessageToSession(newSession.id, initialMessage);
      }
      
      // Refetch all sessions to get latest data
      const updatedSessions = await fetchChatSessions(activeWorkspaceId);
      setSessions(updatedSessions);
      
      // Set the new session as active
      setActiveSessionId(newSession.id);
      setMessages(newSession.messages);
      
    } catch (err) {
      console.error('Error creating session:', err);
      toast({
        title: 'Error',
        description: 'Failed to create new conversation',
        variant: 'destructive'
      });
    }
  };
  
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      
      // Remove from local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // If the active session was deleted, select a new one
      if (activeSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setActiveSessionId(remainingSessions[0].id);
          setMessages(remainingSessions[0].messages);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
      
      toast({
        title: 'Success',
        description: 'Chat deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting session:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete chat',
        variant: 'destructive'
      });
    }
  };
  
  const handlePinSession = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;
      
      const newPinStatus = !session.isPinned;
      await updateChatSessionPin(sessionId, newPinStatus);
      
      // Update local state
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, isPinned: newPinStatus } : s
      ));
      
      toast({
        title: 'Success',
        description: newPinStatus ? 'Chat pinned successfully' : 'Chat unpinned successfully'
      });
    } catch (err) {
      console.error('Error updating pin status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update chat pin status',
        variant: 'destructive'
      });
    }
  };
  
  const handleSendMessageToSession = async (sessionId: string, content: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Prepare file context if we have files
      let fileContext = '';
      if (files.length > 0) {
        const fileContents = await Promise.all(
          files.slice(0, 5).map(async file => {
            try {
              // Extract content from file for context
              // For blob URLs, we need to fetch them first
              const response = await fetch(file.url);
              const blob = await response.blob();
              const fileContent = await readFileContent(new File([blob], file.name, { type: file.type }));
              return `File: ${file.name}\n${fileContent || "Content not available for processing"}\n\n`;
            } catch (error) {
              console.error(`Error reading file ${file.name}:`, error);
              return `File: ${file.name}\nUnable to extract content for processing.\n\n`;
            }
          })
        );
        
        fileContext = fileContents.join('\n');
      }
      
      // Get AI response
      const answer = await askGemini(content, fileContext);
      
      // Add AI message to database
      const aiMessage = await addChatMessage(sessionId, answer, 'assistant');
      
      // Update messages if this is the active session
      if (sessionId === activeSessionId) {
        setMessages(prev => [...prev, aiMessage]);
      }
      
      // Refresh the sessions list to update last message and timestamp
      if (activeWorkspaceId) {
        const updatedSessions = await fetchChatSessions(activeWorkspaceId);
        setSessions(updatedSessions);
      }
      
      return aiMessage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Gemini Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSendMessage = async (content: string) => {
    if (!user || !activeWorkspaceId) return;
    
    // If no active session, create a new one
    if (!activeSessionId) {
      await handleNewSession(content);
      return;
    }
    
    try {
      // Add user message to database
      const userMessage = await addChatMessage(activeSessionId, content, 'user');
      
      // Update local messages
      setMessages(prev => [...prev, userMessage]);
      
      // Get AI response
      await handleSendMessageToSession(activeSessionId, content);
      
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };
  
  const handleFileUpload = async (file: File) => {
    if (!user || !activeWorkspaceId) return;
    
    try {
      // Upload file to storage
      const newFile = await fetch(file.url);
      
      // Add to local state
      setFiles(prev => [...prev, file]);
      
      toast({
        title: 'Success',
        description: 'File uploaded successfully'
      });
      
      return file;
    } catch (err) {
      console.error('Error uploading file:', err);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive'
      });
      throw err;
    }
  };
  
  const handleDeleteFile = async (fileId: string) => {
    // Implementation here
  };
  
  const setActiveWorkspace = (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    
    // Update URL without refreshing the page
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('workspace', workspaceId);
    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    }, { replace: true });
  };
  
  return (
    <ChatContext.Provider value={{
      sessions,
      activeSessionId,
      activeWorkspaceId,
      messages,
      files,
      isLoading,
      isProcessing,
      error,
      handleSelectSession,
      handleNewSession,
      handleDeleteSession,
      handlePinSession,
      handleSendMessage,
      handleFileUpload,
      handleDeleteFile,
      setActiveWorkspace
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
