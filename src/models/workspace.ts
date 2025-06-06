
export interface Workspace {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  workspaceId: string;
  userId: string;
  uploadedAt: Date;
  created_at?: string; // Add this property to match what's used in the components
  content?: string; // Keep the optional content property
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  isPinned: boolean;
  workspaceId: string;
  userId: string;
  timestamp: Date;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  sessionId: string;
  timestamp: Date;
}
