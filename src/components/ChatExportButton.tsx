
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/context/ChatContext';
import { exportChatsToExcel } from '@/utils/exportChats';

interface ChatExportButtonProps {
  className?: string;
}

export function ChatExportButton({ className }: ChatExportButtonProps) {
  const { toast } = useToast();
  const { sessions } = useChat();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (sessions.length === 0) {
      toast({
        title: "No chats to export",
        description: "You need to have at least one conversation to export.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsExporting(true);
      
      // Use the utility function to export chats
      const exportedCount = exportChatsToExcel(sessions);
      
      toast({
        title: "Export successful",
        description: `Successfully exported ${exportedCount} conversations.`
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was a problem exporting your chats. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      className={className}
      onClick={handleExport}
      disabled={isExporting}
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "Exporting..." : "Export Chats"}
    </Button>
  );
}
