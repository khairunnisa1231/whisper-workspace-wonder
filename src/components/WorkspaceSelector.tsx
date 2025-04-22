
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus, FolderPlus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { fetchUserWorkspaces, createWorkspace } from "@/services/workspace-service";
import { Workspace } from "@/models/workspace";
import { useToast } from "@/hooks/use-toast";

interface WorkspaceSelectorProps {
  onSelect: (workspaceId: string) => void;
}

export function WorkspaceSelector({ onSelect }: WorkspaceSelectorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadWorkspaces() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const userWorkspaces = await fetchUserWorkspaces(user.id);
        setWorkspaces(userWorkspaces);
        
        // Select the first workspace by default
        if (userWorkspaces.length > 0 && !selectedWorkspace) {
          setSelectedWorkspace(userWorkspaces[0]);
          onSelect(userWorkspaces[0].id);
        }
      } catch (error) {
        console.error('Error loading workspaces:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadWorkspaces();
  }, [user, onSelect]);
  
  const handleSelect = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    onSelect(workspace.id);
    setOpen(false);
  };
  
  const handleCreateWorkspace = async () => {
    if (!user) return;
    
    if (isCreatingWorkspace) {
      if (newWorkspaceName.trim()) {
        try {
          const newWorkspace = await createWorkspace(user.id, newWorkspaceName);
          setWorkspaces(prev => [...prev, newWorkspace]);
          setSelectedWorkspace(newWorkspace);
          onSelect(newWorkspace.id);
          setNewWorkspaceName("");
          
          toast({
            title: "Workspace Created",
            description: `Workspace "${newWorkspace.name}" created successfully.`
          });
        } catch (error) {
          console.error('Error creating workspace:', error);
          toast({
            title: "Error",
            description: "Failed to create workspace",
            variant: "destructive"
          });
        }
      }
      setIsCreatingWorkspace(false);
    } else {
      setIsCreatingWorkspace(true);
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isLoading}
        >
          {isLoading ? (
            "Loading workspaces..."
          ) : selectedWorkspace ? (
            selectedWorkspace.name
          ) : (
            "Select workspace"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search workspace..." />
          <CommandList>
            <CommandEmpty>No workspace found.</CommandEmpty>
            <CommandGroup heading="Workspaces">
              {workspaces.map((workspace) => (
                <CommandItem
                  key={workspace.id}
                  value={workspace.name}
                  onSelect={() => handleSelect(workspace)}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selectedWorkspace?.id === workspace.id
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                  {workspace.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            {isCreatingWorkspace ? (
              <div className="flex items-center p-2">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="New workspace name"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateWorkspace();
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="ml-2"
                  onClick={handleCreateWorkspace}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <CommandItem
                onSelect={handleCreateWorkspace}
                className="cursor-pointer"
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                Create Workspace
              </CommandItem>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
