
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Key } from "lucide-react";

export function ApiKeyConfig() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const { toast } = useToast();

  // Check if API key exists in local storage
  useEffect(() => {
    const storedKey = localStorage.getItem("gemini_api_key");
    setHasKey(!!storedKey);
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      // If no key is found, open the dialog automatically
      setIsOpen(true);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Missing API Key",
        description: "Please enter your Gemini API key.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("gemini_api_key", apiKey);
    setHasKey(true);
    setIsOpen(false);
    
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been saved successfully.",
    });
    
    // Force page reload to apply the new key
    window.location.reload();
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2" 
        onClick={() => setIsOpen(true)}
      >
        <Key className="h-4 w-4" />
        {hasKey ? "Update API Key" : "Set API Key"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gemini API Key Configuration</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Google Gemini API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Gemini API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Get your API key from{" "}
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
