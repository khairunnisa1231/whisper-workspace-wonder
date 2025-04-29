
import { supabase } from '@/integrations/supabase/client';

export async function ensureWorkspaceFilesBucketExists() {
  // Check if the bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }
  
  const bucketExists = buckets?.some(bucket => bucket.name === 'workspace-files');
  
  if (!bucketExists) {
    // Create the bucket if it doesn't exist
    const { data, error } = await supabase.storage.createBucket('workspace-files', {
      public: true
    });
    
    if (error) {
      console.error('Error creating workspace-files bucket:', error);
    } else {
      console.log('Created workspace-files bucket:', data);
    }
  } else {
    console.log('workspace-files bucket already exists');
  }
}
