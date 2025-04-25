
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BotImageSelector } from "@/components/BotImageSelector";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BotSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botImageUrl: string | null;
  onSelectBotImage: (url: string | null) => void;
}

export function BotSettings({ open, onOpenChange, botImageUrl, onSelectBotImage }: BotSettingsProps) {
  const { fontSize, setFontSize } = useSettings();
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bot Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Bot Appearance</h4>
            <BotImageSelector selectedImage={botImageUrl} onSelectImage={onSelectBotImage} />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Font Size</h4>
            <Select value={fontSize} onValueChange={(value) => setFontSize(value as 'small' | 'default' | 'large')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast({
              title: "Settings updated",
              description: "Your preferences have been saved."
            });
            onOpenChange(false);
          }}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
