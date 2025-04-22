
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { File, Maximize2, Minimize2, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { WorkspaceFile } from "@/models/workspace";

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
  
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  const renderFilePreview = () => {
    if (!selectedFile) return null;
    
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
                      onDelete(selectedFile.id);
                      setSelectedFile(null);
                    }
                  }}
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
                <p className="text-sm">No files to display</p>
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
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
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
