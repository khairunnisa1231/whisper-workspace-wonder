
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { FileDown, FileSpreadsheet, FileText, CheckSquare } from "lucide-react";
import { exportChatsToExcel } from "@/utils/exportChats";

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatExportButtonProps {
  sessionId: string;
  sessionTitle: string;
  messages: Array<ChatMessage>;
  selectedMessageIds?: string[];
  onToggleSelectionMode?: () => void;
  selectionMode?: boolean;
}

export function ChatExportButton({ 
  sessionId, 
  sessionTitle, 
  messages, 
  selectedMessageIds = [], 
  onToggleSelectionMode,
  selectionMode = false
}: ChatExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  
  const exportAsTxt = async () => {
    try {
      setIsExporting(true);
      
      // Filter messages if we have selected messages
      const messagesToExport = selectedMessageIds.length > 0
        ? messages.filter(msg => selectedMessageIds.includes(msg.id))
        : messages;
      
      // Convert chat to plain text for export
      const chatText = messagesToExport.map(msg => {
        const role = msg.role === 'user' ? 'You' : 'Assistant';
        const timestamp = msg.timestamp.toLocaleString();
        return `[${timestamp}] ${role}:\n${msg.content}\n`;
      }).join('\n');
      
      // Create a blob with the chat content
      const blob = new Blob([chatText], { type: 'text/plain' });
      
      // Create a download link and trigger it
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sessionTitle.replace(/[/\\?%*:|"<>]/g, '_')}_${new Date().toLocaleDateString()}.txt`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Chat Exported as Text",
        description: selectedMessageIds.length > 0 
          ? `${selectedMessageIds.length} selected messages have been exported.`
          : "Your conversation has been exported successfully."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your chat. Please try again.",
        variant: "destructive"
      });
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const exportAsExcel = async () => {
    try {
      setIsExporting(true);
      
      // Filter messages if we have selected messages
      const messagesToExport = selectedMessageIds.length > 0
        ? messages.filter(msg => selectedMessageIds.includes(msg.id))
        : messages;
      
      // Create a chat session object from the filtered messages
      const chatSession = {
        id: sessionId,
        title: sessionTitle,
        lastMessage: messagesToExport.length > 0 ? messagesToExport[messagesToExport.length - 1].content : "",
        timestamp: new Date(),
        messages: messagesToExport.map(msg => ({
          id: msg.id,
          content: msg.content,
          // Explicitly cast as either "user" or "assistant" to match ChatMessage type
          role: msg.role === "user" ? "user" as const : "assistant" as const,
          timestamp: msg.timestamp
        }))
      };
      
      // Export to Excel using the utility function
      exportChatsToExcel([chatSession], 1);
      
      toast({
        title: "Chat Exported as Excel",
        description: selectedMessageIds.length > 0 
          ? `${selectedMessageIds.length} selected messages have been exported.`
          : "Your conversation has been exported as an Excel file."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your chat as Excel. Please try again.",
        variant: "destructive"
      });
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const toggleSelectionMode = () => {
    if (onToggleSelectionMode) {
      onToggleSelectionMode();
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0 rounded-full", selectionMode && "bg-primary text-primary-foreground")}
          disabled={isExporting}
          title="Export this conversation"
        >
          <FileDown className="h-4 w-4" />
          <span className="sr-only">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={toggleSelectionMode}>
          <CheckSquare className="h-4 w-4 mr-2" />
          <span>{selectionMode ? "Cancel Selection" : "Select Messages"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={exportAsTxt} 
          disabled={isExporting || (selectionMode && selectedMessageIds.length === 0)}
        >
          <FileText className="h-4 w-4 mr-2" />
          <span>Export as Text</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={exportAsExcel} 
          disabled={isExporting || (selectionMode && selectedMessageIds.length === 0)}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          <span>Export as Excel</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Add the import for cn that we're using
import { cn } from "@/lib/utils";
