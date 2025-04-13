
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileDown } from "lucide-react";

interface ChatExportButtonProps {
  sessionId: string;
  sessionTitle: string;
  messages: Array<{ id: string; content: string; role: string; timestamp: Date }>;
}

export function ChatExportButton({ sessionId, sessionTitle, messages }: ChatExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Convert chat to plain text for export
      const chatText = messages.map(msg => {
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
        title: "Chat Exported",
        description: "Your conversation has been exported successfully."
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
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 rounded-full"
      onClick={handleExport}
      disabled={isExporting}
      title="Export this conversation"
    >
      <FileDown className="h-4 w-4" />
      <span className="sr-only">Export</span>
    </Button>
  );
}
