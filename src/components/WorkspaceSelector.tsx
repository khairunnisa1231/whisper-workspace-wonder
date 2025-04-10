
import { useState } from "react";
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

interface Workspace {
  id: string;
  name: string;
}

const defaultWorkspaces = [
  { id: "w1", name: "Personal" },
  { id: "w2", name: "Work" },
  { id: "w3", name: "Research" },
];

interface WorkspaceSelectorProps {
  onSelect: (workspaceId: string) => void;
}

export function WorkspaceSelector({ onSelect }: WorkspaceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(defaultWorkspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace>(workspaces[0]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  
  const handleSelect = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    onSelect(workspace.id);
    setOpen(false);
  };
  
  const handleCreateWorkspace = () => {
    if (isCreatingWorkspace) {
      if (newWorkspaceName.trim()) {
        const newWorkspace = {
          id: `w${workspaces.length + 1}`,
          name: newWorkspaceName,
        };
        setWorkspaces([...workspaces, newWorkspace]);
        setSelectedWorkspace(newWorkspace);
        onSelect(newWorkspace.id);
        setNewWorkspaceName("");
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
        >
          {selectedWorkspace.name}
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
                      selectedWorkspace.id === workspace.id
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
