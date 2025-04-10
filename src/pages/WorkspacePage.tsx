
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
      },
      {
        id: "w2",
        name: "Work",
        description: "Work-related projects and discussions",
        chatCount: 8,
        createdAt: new Date(Date.now() - 7 * 86400000), // 7 days ago
      },
      {
        id: "w3",
        name: "Research",
        description: "Research topics and information gathering",
        chatCount: 3,
        createdAt: new Date(Date.now() - 3 * 86400000), // 3 days ago
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
              Organize and manage your chat conversations
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
                <div className="flex items-center text-sm text-muted-foreground">
                  <MessageSquare className="mr-1 h-4 w-4" />
                  {workspace.chatCount} chat{workspace.chatCount !== 1 && "s"}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Created on{" "}
                  {workspace.createdAt.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
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
                >
                  <PlusCircle className="h-4 w-4" />
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
