
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BotImageSelector } from "@/components/BotImageSelector";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/context/SettingsContext";
import { ChatStyleSelector, ChatLayoutStyle } from "@/components/ChatStyleSelector";

interface BotSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botImageUrl: string | null;
  onSelectBotImage: (url: string | null) => void;
}

export function BotSettings({
  open,
  onOpenChange,
}: BotSettingsProps) {
  const { chatStyle, setChatStyle, botImageUrl, setBotImageUrl } = useSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bot Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="appearance">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="personality">Personality</TabsTrigger>
          </TabsList>
          <TabsContent value="appearance" className="space-y-4 pt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Bot Image</h3>
              <BotImageSelector 
                selectedImage={botImageUrl} 
                onSelectImage={setBotImageUrl}
              />
            </div>
            
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-medium">Chat Layout Style</h3>
              <RadioGroup 
                value={chatStyle} 
                onValueChange={(value) => setChatStyle(value as ChatLayoutStyle)}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard">Standard (Left & Right)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compact" id="compact" />
                  <Label htmlFor="compact">Compact (All Right)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bubble" id="bubble" />
                  <Label htmlFor="bubble">Bubble (All Right with Bubbles)</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
          <TabsContent value="personality" className="space-y-4 pt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI personality settings will be available in a future update.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
