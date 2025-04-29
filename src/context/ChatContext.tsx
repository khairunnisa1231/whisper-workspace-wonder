
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
  fetchWorkspaceFiles,
  uploadWorkspaceFile,
  deleteWorkspaceFile
} from '@/services/workspace-service';
import { askGemini } from '@/integrations/gemini/client';
import { readFileContent, getFileContent } from '@/utils/readFileContent';

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
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const workspaceId = params.get('workspace');
    
    if (workspaceId) {
      setActiveWorkspaceId(workspaceId);
    }
  }, [location.search]);
  
  useEffect(() => {
    if (!activeWorkspaceId || !isAuthenticated || !user) return;
    
    async function loadData() {
      try {
        setIsLoading(true);
        console.log('Loading data for workspace:', activeWorkspaceId);
        
        // Fetch chat sessions
        const chatSessions = await fetchChatSessions(activeWorkspaceId);
        console.log('Fetched chat sessions:', chatSessions);
        setSessions(chatSessions);
        
        if (chatSessions.length > 0) {
          setActiveSessionId(chatSessions[0].id);
          const sessionMessages = await fetchChatMessages(chatSessions[0].id);
          console.log('Fetched messages for first session:', sessionMessages);
          setMessages(sessionMessages);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
        
        // Fetch workspace files
        const workspaceFiles = await fetchWorkspaceFiles(activeWorkspaceId);
        console.log('Fetched workspace files:', workspaceFiles);
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
  
  const handleSelectSession = async (sessionId: string) => {
    try {
      setActiveSessionId(sessionId);
      const sessionMessages = await fetchChatMessages(sessionId);
      setMessages(sessionMessages);
    } catch (err) {
      console.error('Error fetching session messages:', err);
      toast({
        title: 'Error',
        description: 'Failed to load conversation messages',
        variant: 'destructive'
      });
    }
  };
  
  const handleNewSession = async (initialMessage?: string) => {
    if (!user || !activeWorkspaceId) return;
    
    try {
      let title = 'New Conversation';
      if (initialMessage) {
        title = initialMessage.slice(0, 30) + (initialMessage.length > 30 ? '...' : '');
      }
      
      console.log('Creating new session with title:', title);
      const newSession = await createChatSession(activeWorkspaceId, user.id, title);
      console.log('New session created:', newSession);
      
      if (initialMessage) {
        const userMessage = await addChatMessage(newSession.id, initialMessage, 'user');
        setMessages([userMessage]);
        
        await handleSendMessageToSession(newSession.id, initialMessage);
      } else {
        setMessages([]);
      }
      
      const updatedSessions = await fetchChatSessions(activeWorkspaceId);
      setSessions(updatedSessions);
      
      setActiveSessionId(newSession.id);
      
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
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (activeSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setActiveSessionId(remainingSessions[0].id);
          const sessionMessages = await fetchChatMessages(remainingSessions[0].id);
          setMessages(sessionMessages);
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
      
      const newPinStatus = !session.is_pinned;
      await updateChatSessionPin(sessionId, newPinStatus);
      
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, is_pinned: newPinStatus } : s
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
      
      let fileContext = '';
      if (files.length > 0) {
        console.log('Processing files for context:', files.length);
        const fileContents = await Promise.all(
          files.slice(0, 5).map(async file => {
            try {
              console.log('Reading content for file:', file.name);
              const fileContent = await getFileContent(file);
              return `File: ${file.name}\n${fileContent || "Content not available for processing"}\n\n`;
            } catch (error) {
              console.error(`Error reading file ${file.name}:`, error);
              return `File: ${file.name}\nUnable to extract content for processing.\n\n`;
            }
          })
        );
        
        fileContext = fileContents.join('\n');
        console.log('Assembled file context:', fileContext.substring(0, 200) + '...');
      }
      
      console.log('Sending to Gemini with file context:', fileContext ? 'Yes' : 'No');
      const answer = await askGemini(content, fileContext);
      console.log('Received answer from Gemini');
      
      const aiMessage = await addChatMessage(sessionId, answer, 'assistant');
      console.log('Added AI message to database');
      
      if (sessionId === activeSessionId) {
        setMessages(prev => [...prev, aiMessage]);
      }
      
      if (activeWorkspaceId) {
        const updatedSessions = await fetchChatSessions(activeWorkspaceId);
        setSessions(updatedSessions);
      }
      
      return aiMessage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error in handleSendMessageToSession:', errorMessage);
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
    if (!user || !activeWorkspaceId) {
      console.error('No user or active workspace');
      return;
    }
    
    if (!activeSessionId) {
      console.log('No active session, creating new one');
      await handleNewSession(content);
      return;
    }
    
    try {
      console.log('Adding user message to session:', activeSessionId);
      const userMessage = await addChatMessage(activeSessionId, content, 'user');
      
      setMessages(prev => [...prev, userMessage]);
      
      await handleSendMessageToSession(activeSessionId, content);
      
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };
  
  const handleFileUpload = async (file: File): Promise<void> => {
    if (!user || !activeWorkspaceId) {
      console.error('No user or active workspace');
      return;
    }
    
    try {
      console.log('Uploading file:', file.name);
      const uploadedFile = await uploadWorkspaceFile(activeWorkspaceId, user.id, file);
      console.log('File uploaded successfully:', uploadedFile);
      
      setFiles(prev => [...prev, uploadedFile]);
      
      toast({
        title: 'Success',
        description: 'File uploaded successfully'
      });
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
  
  const handleDeleteFile = async (fileId: string): Promise<void> => {
    try {
      console.log('Deleting file with ID:', fileId);
      await deleteWorkspaceFile(fileId);
      
      setFiles(prev => prev.filter(f => f.id !== fileId));
      
      toast({
        title: 'Success',
        description: 'File deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting file:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive'
      });
    }
  };
  
  const setActiveWorkspace = (workspaceId: string) => {
    console.log('Setting active workspace:', workspaceId);
    setActiveWorkspaceId(workspaceId);
    
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
