
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { FileDown, FilePdf, FileText } from "lucide-react";
import { jsPDF } from "jspdf";

interface ChatExportButtonProps {
  sessionId: string;
  sessionTitle: string;
  messages: Array<{ id: string; content: string; role: string; timestamp: Date }>;
}

export function ChatExportButton({ sessionId, sessionTitle, messages }: ChatExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  
  const exportAsTxt = async () => {
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
        title: "Chat Exported as Text",
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
  
  const exportAsPdf = async () => {
    try {
      setIsExporting(true);
      
      // Create new PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Set basic formatting parameters
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const textWidth = pageWidth - (margin * 2);
      
      // Add title
      doc.setFontSize(18);
      doc.text(sessionTitle, margin, margin);
      doc.setFontSize(10);
      doc.text(`Exported on ${new Date().toLocaleString()}`, margin, margin + 8);
      
      // Add conversation
      doc.setFontSize(11);
      let yPos = margin + 20;
      
      for (const msg of messages) {
        const role = msg.role === 'user' ? 'You' : 'Assistant';
        const timestamp = msg.timestamp.toLocaleString();
        
        // Add role and timestamp
        doc.setFont("helvetica", "bold");
        doc.text(`${role} - ${timestamp}`, margin, yPos);
        yPos += 5;
        
        // Add message content (with word wrapping)
        doc.setFont("helvetica", "normal");
        const textLines = doc.splitTextToSize(msg.content, textWidth);
        
        // Check if we need a new page
        if (yPos + (textLines.length * 5) + 10 > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.text(textLines, margin, yPos);
        yPos += (textLines.length * 5) + 10;
      }
      
      // Save PDF
      doc.save(`${sessionTitle.replace(/[/\\?%*:|"<>]/g, '_')}_${new Date().toLocaleDateString()}.pdf`);
      
      toast({
        title: "Chat Exported as PDF",
        description: "Your conversation has been exported as a PDF file."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your chat as PDF. Please try again.",
        variant: "destructive"
      });
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full"
          disabled={isExporting}
          title="Export this conversation"
        >
          <FileDown className="h-4 w-4" />
          <span className="sr-only">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsTxt} disabled={isExporting}>
          <FileText className="h-4 w-4 mr-2" />
          <span>Export as Text</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsPdf} disabled={isExporting}>
          <FilePdf className="h-4 w-4 mr-2" />
          <span>Export as PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
