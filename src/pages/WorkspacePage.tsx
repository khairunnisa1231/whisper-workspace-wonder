
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FolderPlus,
  MessageSquare,
  Folder,
  PlusCircle,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  FileUp,
  FileText,
  File,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Workspace {
  id: string;
  name: string;
  description: string;
  chatCount: number;
  createdAt: Date;
  files?: WorkspaceFile[];
}

interface WorkspaceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

export default function WorkspacePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileUploadDialogOpen, setFileUploadDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    // Initialize with sample data
    const sampleWorkspaces = [
      {
        id: "w1",
        name: "Personal",
        description: "My personal chat conversations and ideas",
        chatCount: 5,
        createdAt: new Date(Date.now() - 14 * 86400000), // 14 days ago
        files: [
          {
            id: "f1",
            name: "project-brief.pdf",
            size: 1258000,
            type: "application/pdf",
            url: "#",
            uploadedAt: new Date(Date.now() - 3 * 86400000),
          },
        ],
      },
      {
        id: "w2",
        name: "Work",
        description: "Work-related projects and discussions",
        chatCount: 8,
        createdAt: new Date(Date.now() - 7 * 86400000), // 7 days ago
        files: [],
      },
      {
        id: "w3",
        name: "Research",
        description: "Research topics and information gathering",
        chatCount: 3,
        createdAt: new Date(Date.now() - 3 * 86400000), // 3 days ago
        files: [
          {
            id: "f2",
            name: "research-notes.docx",
            size: 458000,
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            url: "#",
            uploadedAt: new Date(Date.now() - 1 * 86400000),
          },
          {
            id: "f3",
            name: "data.xlsx",
            size: 825000,
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            url: "#",
            uploadedAt: new Date(Date.now()),
          },
        ],
      },
    ];
    
    setWorkspaces(sampleWorkspaces);
  }, [isAuthenticated, navigate]);
  
  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for your workspace.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newWorkspace: Workspace = {
        id: `w${workspaces.length + 1}-${Date.now()}`,
        name: newWorkspaceName,
        description: newWorkspaceDescription || "No description",
        chatCount: 0,
        createdAt: new Date(),
        files: [],
      };
      
      setWorkspaces((prev) => [...prev, newWorkspace]);
      setNewWorkspaceName("");
      setNewWorkspaceDescription("");
      setIsCreating(false);
      setIsDialogOpen(false);
      
      toast({
        title: "Workspace Created",
        description: `'${newWorkspace.name}' has been successfully created.`,
      });
    }, 1000);
  };
  
  const handleDeleteWorkspace = (id: string) => {
    const workspaceToDelete = workspaces.find((w) => w.id === id);
    
    setWorkspaces((prev) => prev.filter((workspace) => workspace.id !== id));
    
    toast({
      title: "Workspace Deleted",
      description: `'${workspaceToDelete?.name}' has been removed.`,
    });
  };
  
  const handleOpenChat = (workspaceId: string) => {
    // In a real app, we would set the active workspace and navigate to chat
    navigate("/chat");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, workspaceId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    // Simulate file upload with delay
    setTimeout(() => {
      const uploadedFiles: WorkspaceFile[] = Array.from(files).map((file) => ({
        id: `f${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file), // In a real app, this would be a server URL
        uploadedAt: new Date(),
      }));
      
      setWorkspaces((prev) => prev.map((workspace) => {
        if (workspace.id === workspaceId) {
          return {
            ...workspace,
            files: [...(workspace.files || []), ...uploadedFiles]
          };
        }
        return workspace;
      }));
      
      setIsUploading(false);
      setFileUploadDialogOpen(false);
      setSelectedWorkspace(null);
      
      toast({
        title: "Files Uploaded",
        description: `${uploadedFiles.length} file(s) have been uploaded successfully.`,
      });
    }, 1500);
  };
  
  const handleDeleteFile = (workspaceId: string, fileId: string) => {
    setWorkspaces((prev) => prev.map((workspace) => {
      if (workspace.id === workspaceId) {
        return {
          ...workspace,
          files: (workspace.files || []).filter((file) => file.id !== fileId),
        };
      }
      return workspace;
    }));
    
    toast({
      title: "File Deleted",
      description: "The file has been removed from your workspace.",
    });
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <File className="h-5 w-5 text-blue-500" />;
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-5 w-5 text-blue-600" />;
    if (fileType.includes('sheet') || fileType.includes('excel')) return <FileText className="h-5 w-5 text-green-600" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };
  
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 container py-10">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
            <p className="text-muted-foreground mt-1">
              Organize and manage your chat conversations and files
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0" size="sm">
                <FolderPlus className="mr-2 h-4 w-4" />
                New Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Workspace</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    placeholder="Enter workspace name"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description (optional)
                  </label>
                  <Input
                    id="description"
                    placeholder="Enter workspace description"
                    value={newWorkspaceDescription}
                    onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleCreateWorkspace}
                  disabled={isCreating || !newWorkspaceName.trim()}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Workspace"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={fileUploadDialogOpen} onOpenChange={setFileUploadDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileUp className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <Input
                    type="file"
                    multiple
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => selectedWorkspace && handleFileUpload(e, selectedWorkspace)}
                  />
                  <Button 
                    onClick={() => document.getElementById('file-upload')?.click()}
                    variant="outline"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Select Files"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </header>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Card key={workspace.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    <CardTitle>{workspace.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-2"
                        onClick={() => {
                          setSelectedWorkspace(workspace.id);
                          setFileUploadDialogOpen(true);
                        }}
                      >
                        <FileUp className="h-4 w-4" />
                        Upload Files
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-2 text-destructive"
                        onClick={() => handleDeleteWorkspace(workspace.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{workspace.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    {workspace.chatCount} chat{workspace.chatCount !== 1 && "s"}
                  </div>
                  
                  {workspace.files && workspace.files.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-2">Files ({workspace.files.length})</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {workspace.files.map((file) => (
                          <div 
                            key={file.id} 
                            className="flex items-center justify-between border p-2 rounded-md text-sm"
                          >
                            <div className="flex items-center space-x-2 overflow-hidden">
                              {getFileIcon(file.type)}
                              <span className="truncate">{file.name}</span>
                              <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleDeleteFile(workspace.id, file.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground">
                    Created on{" "}
                    {workspace.createdAt.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOpenChat(workspace.id)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Open Chats
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedWorkspace(workspace.id);
                    setFileUploadDialogOpen(true);
                  }}
                >
                  <FileUp className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {workspaces.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <Folder className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Workspaces Yet</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Create your first workspace to organize your chat conversations.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Create Workspace
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
