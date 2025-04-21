
import { supabase as integratedSupabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Re-export the typed Supabase client
export const supabase = integratedSupabase;

// Database schema types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];
export type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];
export type StoredFile = Database["public"]["Tables"]["files"]["Row"];
