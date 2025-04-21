
import { createClient } from '@supabase/supabase-js';
import { supabase as integratedSupabase } from "@/integrations/supabase/client";

// We're now using the integrated Supabase client directly
export const supabase = integratedSupabase;

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
