
import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
const supabaseUrl = 'https://zkjaktntksksquimsuhc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpramFrdG50a3Nrc3F1aW1zdWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMDE4ODUsImV4cCI6MjA2MDc3Nzg4NX0.5ja5PaRKZa1nLoCg36kvB22LUwzuGuLETEeMvH4Bnf0';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});
