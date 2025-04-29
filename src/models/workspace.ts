
export interface Workspace {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  workspace_id: string;
  user_id: string;
  uploaded_at: Date;
  content?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  last_message: string;
  is_pinned: boolean;
  workspace_id: string;
  user_id: string;
  timestamp: Date;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  session_id: string;
  timestamp: Date;
}
