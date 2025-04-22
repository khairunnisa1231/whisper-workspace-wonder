
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

/**
 * Redirects user to workspace page if no workspace is active
 */
export function useWorkspaceRedirect() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const checkAndRedirect = (workspaceId: string | null) => {
    if (!workspaceId) {
      toast({
        title: "No workspace selected",
        description: "Please create or select a workspace first",
        variant: "destructive"
      });
      
      navigate("/workspaces");
      return false;
    }
    
    return true;
  };
  
  return { checkAndRedirect };
}
