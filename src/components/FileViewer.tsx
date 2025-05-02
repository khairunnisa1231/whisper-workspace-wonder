
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { File, Maximize2, Minimize2, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { WorkspaceFile } from "@/models/workspace";
import { useToast } from "@/hooks/use-toast";
import { getFileContent } from "@/utils/readFileContent";

interface FileViewerProps {
  files: WorkspaceFile[];
  onClose: () => void;
  onDelete?: (fileId: string) => Promise<void>;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export function FileViewer({ 
  files, 
  onClose, 
  onDelete, 
  isMinimized, 
  onToggleMinimize 
}: FileViewerProps) {
  
  const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Load file content when a file is selected
  useEffect(() => {
    async function loadFileContent() {
      if (!selectedFile) {
        setFileContent(null);
        return;
      }
      
      setIsLoading(true);
      try {
        // Only attempt to load content for text-based files
        if (selectedFile.type.startsWith('text/') || 
            selectedFile.type === 'application/json' || 
            selectedFile.name.endsWith('.md') || 
            selectedFile.name.endsWith('.js') || 
            selectedFile.name.endsWith('.ts') || 
            selectedFile.name.endsWith('.css')) {
          
          const content = await getFileContent(selectedFile);
          setFileContent(content);
        } else {
          setFileContent(null);
        }
      } catch (error) {
        console.error('Error loading file content:', error);
        toast({
          title: 'Error',
          description: 'Could not load file content',
          variant: 'destructive'
        });
        setFileContent(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadFileContent();
  }, [selectedFile, toast]);
  
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  const handleDeleteFile = async (fileId: string) => {
    if (!onDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(fileId);
      setSelectedFile(null);
      setFileContent(null);
      toast({
        title: "Success",
        description: "File deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const renderFilePreview = () => {
    if (!selectedFile) return null;
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (selectedFile.type.startsWith("image/")) {
      return (
        <div className="p-4 flex justify-center">
          <img 
            src={selectedFile.url} 
            alt={selectedFile.name} 
            className="max-w-full max-h-[400px] object-contain"
          />
        </div>
      );
    }
    
    if (selectedFile.type === "application/pdf") {
      return (
        <div className="p-4 h-[400px]">
          <iframe
            src={selectedFile.url}
            className="w-full h-full border-0"
            title={selectedFile.name}
          />
        </div>
      );
    }
    
    if (fileContent) {
      return (
        <div className="p-4">
          <pre className="whitespace-pre-wrap break-words bg-muted p-4 rounded-lg overflow-auto max-h-[400px] text-sm">
            {fileContent}
          </pre>
          <div className="mt-4 text-xs text-muted-foreground">
            This content is visible to Gemini AI and will be used to answer your questions about the file.
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-4 flex flex-col items-center justify-center text-center">
        <File size={64} className="text-muted-foreground mb-2" />
        <p className="text-sm font-medium">{selectedFile.name}</p>
        <p className="text-xs text-muted-foreground">{selectedFile.type}</p>
        <a 
          href={selectedFile.url} 
          download={selectedFile.name}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Download file
        </a>
      </div>
    );
  };
  
  if (isMinimized) {
    return (
      <Button 
        variant="outline" 
        className="absolute bottom-4 right-4 z-10 flex items-center gap-2"
        onClick={onToggleMinimize}
      >
        <File size={16} />
        <span>View Files ({files.length})</span>
        <Maximize2 size={16} />
      </Button>
    );
  }
  
  return (
    <Card className="flex flex-col h-full border-l">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium">Files ({files.length})</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onToggleMinimize}>
            <Minimize2 size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {selectedFile ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-2 bg-muted/50">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedFile(null)}
              >
                Back to list
              </Button>
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    if (selectedFile) {
                      handleDeleteFile(selectedFile.id);
                    }
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              )}
            </div>
            {renderFilePreview()}
          </div>
        ) : (
          <ScrollArea className="flex-1 p-2">
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
                <File size={32} className="mb-2" />
                <p className="text-sm">No files uploaded</p>
                <p className="text-xs mt-2">Upload files for Gemini to analyze and answer questions about.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div 
                    key={file.id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => setSelectedFile(file)}
                  >
                    <File size={20} className="text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(Number(file.size))} • {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </div>
    </Card>
  );
}
