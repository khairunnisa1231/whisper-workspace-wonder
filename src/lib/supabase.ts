
import { createClient } from '@supabase/supabase-js';

// These values should be populated when connected to Supabase via Lovable's integration
// The Lovable Supabase integration automatically injects these values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema types
export type Profile = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export type ChatSession = {
  id: string;
  user_id: string;
  title: string;
  last_message: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export type ChatMessage = {
  id: string;
  session_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export type StoredFile = {
  id: string;
  user_id: string;
  session_id: string;
  name: string;
  size: string;
  type: string;
  path: string;
  created_at: string;
}
