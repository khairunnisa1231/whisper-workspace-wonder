
import { supabase } from "@/integrations/supabase/client";
import { Workspace, WorkspaceFile, ChatSession, ChatMessage } from "@/models/workspace";

// Workspaces
export async function fetchUserWorkspaces(userId: string): Promise<Workspace[]> {
  console.log('Fetching workspaces for user ID:', userId);
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workspaces:', error);
      throw new Error('Failed to fetch workspaces');
    }

    if (!data) {
      console.log('No workspaces found');
      return [];
    }

    console.log('Workspaces fetched:', data);
    return data.map(workspace => ({
      id: workspace.id,
      name: workspace.name,
      description: workspace.description || '',
      userId: workspace.user_id,
      createdAt: new Date(workspace.created_at),
      updatedAt: new Date(workspace.updated_at)
    }));
  } catch (err) {
    console.error('Error in fetchUserWorkspaces:', err);
    throw err;
  }
}

export async function createWorkspace(userId: string, name: string, description?: string): Promise<Workspace> {
  console.log('Creating workspace:', { userId, name, description });
  try {
    // Make the insert more resilient with explicit column names and values
    const { data, error } = await supabase
      .from('workspaces')
      .insert([{
        name: name,
        description: description || '',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating workspace:', error);
      throw new Error('Failed to create workspace');
    }

    if (!data) {
      throw new Error('No data returned after creating workspace');
    }

    console.log('Workspace created:', data);
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (err) {
    console.error('Error in createWorkspace:', err);
    throw err;
  }
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', workspaceId);

  if (error) {
    console.error('Error deleting workspace:', error);
    throw new Error('Failed to delete workspace');
  }
}

// Workspace Files
export async function uploadWorkspaceFile(
  workspaceId: string, 
  userId: string,
  file: File
): Promise<WorkspaceFile> {
  // First, upload to storage
  const filePath = `${userId}/${workspaceId}/${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('workspace-files')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    throw new Error('Failed to upload file');
  }

  // Get public URL for the file
  const { data: { publicUrl } } = supabase.storage
    .from('workspace-files')
    .getPublicUrl(filePath);

  // Add file reference to database
  const { data, error } = await supabase
    .from('files')
    .insert([{
      name: file.name,
      path: filePath,
      type: file.type,
      size: file.size.toString(),
      user_id: userId,
      workspace_id: workspaceId
    }])
    .select()
    .single();

  if (error) {
    console.error('Error saving file reference:', error);
    throw new Error('Failed to save file reference');
  }

  return {
    id: data.id,
    name: data.name,
    size: parseInt(data.size),
    type: data.type,
    url: publicUrl,
    workspaceId: data.workspace_id,
    userId: data.user_id,
    uploadedAt: new Date(data.created_at)
  };
}

export async function fetchWorkspaceFiles(workspaceId: string): Promise<WorkspaceFile[]> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching files:', error);
    throw new Error('Failed to fetch files');
  }

  if (!data) return [];

  return data.map(file => {
    const { data: { publicUrl } } = supabase.storage
      .from('workspace-files')
      .getPublicUrl(file.path);

    return {
      id: file.id,
      name: file.name,
      size: parseInt(file.size),
      type: file.type,
      url: publicUrl,
      workspaceId: file.workspace_id,
      userId: file.user_id,
      uploadedAt: new Date(file.created_at)
    };
  });
}

export async function deleteWorkspaceFile(fileId: string): Promise<void> {
  // First get the file to get the path
  const { data: fileData, error: fileError } = await supabase
    .from('files')
    .select('path')
    .eq('id', fileId)
    .single();

  if (fileError) {
    console.error('Error getting file information:', fileError);
    throw new Error('Failed to get file information');
  }

  // Delete from storage if path is found
  if (fileData && fileData.path) {
    const { error: storageError } = await supabase.storage
      .from('workspace-files')
      .remove([fileData.path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue to delete database reference even if storage deletion fails
    }
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);

  if (dbError) {
    console.error('Error deleting file reference:', dbError);
    throw new Error('Failed to delete file reference');
  }
}

// Chat Sessions
export async function fetchChatSessions(workspaceId: string): Promise<ChatSession[]> {
  // First fetch all sessions for the workspace
  const { data: sessionsData, error: sessionsError } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false });

  if (sessionsError) {
    console.error('Error fetching chat sessions:', sessionsError);
    throw new Error('Failed to fetch chat sessions');
  }

  if (!sessionsData) return [];

  // For each session, fetch its messages
  const sessionsWithMessages = await Promise.all(
    sessionsData.map(async (session) => {
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching chat messages:', messagesError);
        throw new Error('Failed to fetch chat messages');
      }

      const messages: ChatMessage[] = messagesData ? messagesData.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as "user" | "assistant",
        sessionId: msg.session_id,
        timestamp: new Date(msg.created_at)
      })) : [];

      return {
        id: session.id,
        title: session.title,
        lastMessage: session.last_message || '',
        isPinned: session.is_pinned || false,
        workspaceId: session.workspace_id,
        userId: session.user_id,
        timestamp: new Date(session.updated_at),
        messages
      };
    })
  );

  return sessionsWithMessages;
}

export async function createChatSession(
  workspaceId: string, 
  userId: string, 
  title: string = 'New Conversation'
): Promise<ChatSession> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([{
      title,
      workspace_id: workspaceId,
      user_id: userId
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating chat session:', error);
    throw new Error('Failed to create chat session');
  }

  return {
    id: data.id,
    title: data.title,
    lastMessage: data.last_message || '',
    isPinned: data.is_pinned || false,
    workspaceId: data.workspace_id,
    userId: data.user_id,
    timestamp: new Date(data.updated_at),
    messages: []
  };
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting chat session:', error);
    throw new Error('Failed to delete chat session');
  }
}

export async function updateChatSessionPin(sessionId: string, isPinned: boolean): Promise<void> {
  const { error } = await supabase
    .from('chat_sessions')
    .update({ is_pinned: isPinned })
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating chat session pin status:', error);
    throw new Error('Failed to update chat session pin status');
  }
}

// Chat Messages
export async function addChatMessage(
  sessionId: string,
  content: string,
  role: "user" | "assistant"
): Promise<ChatMessage> {
  // Add the message
  const { data: messageData, error: messageError } = await supabase
    .from('chat_messages')
    .insert([{
      session_id: sessionId,
      content,
      role
    }])
    .select()
    .single();

  if (messageError) {
    console.error('Error adding chat message:', messageError);
    throw new Error('Failed to add chat message');
  }

  // Update the chat session's last message and timestamp
  const { error: sessionError } = await supabase
    .from('chat_sessions')
    .update({
      last_message: content,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId);

  if (sessionError) {
    console.error('Error updating chat session:', sessionError);
    throw new Error('Failed to update chat session');
  }

  return {
    id: messageData.id,
    content: messageData.content,
    role: messageData.role as "user" | "assistant",
    sessionId: messageData.session_id,
    timestamp: new Date(messageData.created_at)
  };
}

export async function fetchChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chat messages:', error);
    throw new Error('Failed to fetch chat messages');
  }

  if (!data) return [];

  return data.map(msg => ({
    id: msg.id,
    content: msg.content,
    role: msg.role as "user" | "assistant",
    sessionId: msg.session_id,
    timestamp: new Date(msg.created_at)
  }));
}
