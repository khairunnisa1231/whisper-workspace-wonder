
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  sessionTitle: string;
}

export function ChatShareDialog({
  open,
  onOpenChange,
  sessionId,
  sessionTitle,
}: ChatShareDialogProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [permission, setPermission] = useState("view"); // "view" or "edit"
  const [isLoading, setIsLoading] = useState(false);

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // First check if the user exists
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", inviteEmail.toLowerCase())
        .maybeSingle();
        
      if (userError) {
        throw new Error("Error checking user");
      }
      
      if (!userData) {
        toast.error("User not found. Please ask them to sign up first.");
        setIsLoading(false);
        return;
      }
      
      // Create a chat sharing record
      const { error: shareError } = await supabase
        .from("chat_shares")
        .insert({
          chat_id: sessionId,
          shared_with: userData.id,
          permission_level: permission,
          created_at: new Date()
        });
        
      if (shareError) {
        if (shareError.code === '23505') { // Unique constraint violation
          toast.error("This chat has already been shared with this user");
        } else {
          throw new Error("Error sharing chat");
        }
      } else {
        toast.success(`Chat "${sessionTitle}" shared with ${inviteEmail}`);
        setInviteEmail("");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error sharing chat:", error);
      toast.error("Failed to share chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Chat</DialogTitle>
          <DialogDescription>
            Invite others to view or collaborate on this chat.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Permission level</Label>
            <RadioGroup value={permission} onValueChange={setPermission}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="view" id="view" />
                <Label htmlFor="view">View only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="edit" id="edit" />
                <Label htmlFor="edit">Can edit</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleInviteUser}
            disabled={isLoading || !inviteEmail}
            className="gap-2"
          >
            {isLoading ? "Sharing..." : "Share"}
            <Users className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
