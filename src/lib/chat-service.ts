
import { supabase, type ChatSession, type ChatMessage, type StoredFile } from './supabase';
import { generateAIResponse } from './gemini';

export async function fetchChatSessions(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching chat sessions:', error);
    return [];
  }
  
  return data || [];
}

export async function fetchChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
  
  return data || [];
}

export async function createChatSession(
  userId: string, 
  title: string = 'New Conversation'
): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      title,
      last_message: '',
      is_pinned: false,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating chat session:', error);
    return null;
  }
  
  return data;
}

export async function updateSessionTitle(
  sessionId: string, 
  title: string
): Promise<boolean> {
  const { error } = await supabase
    .from('chat_sessions')
    .update({ title })
    .eq('id', sessionId);
  
  if (error) {
    console.error('Error updating session title:', error);
    return false;
  }
  
  return true;
}

export async function pinChatSession(
  sessionId: string, 
  isPinned: boolean
): Promise<boolean> {
  const { error } = await supabase
    .from('chat_sessions')
    .update({ is_pinned: isPinned })
    .eq('id', sessionId);
  
  if (error) {
    console.error('Error pinning chat session:', error);
    return false;
  }
  
  return true;
}

export async function deleteChatSession(sessionId: string): Promise<boolean> {
  // First delete all messages in the session
  await supabase
    .from('chat_messages')
    .delete()
    .eq('session_id', sessionId);
    
  // Then delete all files in the session
  await supabase
    .from('files')
    .delete()
    .eq('session_id', sessionId);
  
  // Finally delete the session itself
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);
  
  if (error) {
    console.error('Error deleting chat session:', error);
    return false;
  }
  
  return true;
}

export async function sendMessage(
  sessionId: string, 
  userId: string,
  content: string
): Promise<{ userMessage: ChatMessage | null, aiMessage: ChatMessage | null }> {
  // Insert user message
  const { data: userMessage, error: userError } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      content,
      role: 'user',
    })
    .select()
    .single();
  
  if (userError) {
    console.error('Error sending user message:', userError);
    return { userMessage: null, aiMessage: null };
  }
  
  // Update the session's last message
  await supabase
    .from('chat_sessions')
    .update({ 
      last_message: content,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId);
  
  // Get chat history for context
  const { data: history } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  
  const formattedHistory = (history || []).map(msg => ({
    role: msg.role,
    content: msg.content
  }));
  
  // Generate AI response
  const aiContent = await generateAIResponse(content, formattedHistory);
  
  // Insert AI response
  const { data: aiMessage, error: aiError } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      content: aiContent,
      role: 'assistant',
    })
    .select()
    .single();
  
  if (aiError) {
    console.error('Error sending AI message:', aiError);
    return { userMessage, aiMessage: null };
  }
  
  return { userMessage, aiMessage };
}

export async function uploadFile(
  file: File, 
  userId: string, 
  sessionId: string
): Promise<StoredFile | null> {
  // Create a unique path for the file
  const fileExtension = file.name.split('.').pop();
  const filePath = `${userId}/${sessionId}/${Date.now()}-${file.name}`;
  
  // Upload to Supabase Storage
  const { error: uploadError } = await supabase
    .storage
    .from('chat_files')
    .upload(filePath, file);
  
  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    return null;
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('chat_files')
    .getPublicUrl(filePath);
  
  // Save file metadata to database
  const fileSize = file.size < 1024 
    ? `${file.size} B`
    : file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
  
  const { data, error } = await supabase
    .from('files')
    .insert({
      user_id: userId,
      session_id: sessionId,
      name: file.name,
      size: fileSize,
      type: file.type,
      path: filePath,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving file metadata:', error);
    return null;
  }
  
  return { ...data, url: publicUrl };
}

export async function getSessionFiles(sessionId: string): Promise<StoredFile[]> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching session files:', error);
    return [];
  }
  
  // Add public URLs to each file
  return (data || []).map(file => {
    const { data: { publicUrl } } = supabase
      .storage
      .from('chat_files')
      .getPublicUrl(file.path);
    
    return { ...file, url: publicUrl };
  });
}

export async function deleteFile(fileId: string): Promise<boolean> {
  // First get the file to know its path
  const { data: file, error: fetchError } = await supabase
    .from('files')
    .select('path')
    .eq('id', fileId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching file path:', fetchError);
    return false;
  }
  
  // Delete from storage
  if (file?.path) {
    const { error: storageError } = await supabase
      .storage
      .from('chat_files')
      .remove([file.path]);
    
    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
    }
  }
  
  // Delete metadata from database
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);
  
  if (error) {
    console.error('Error deleting file metadata:', error);
    return false;
  }
  
  return true;
}
