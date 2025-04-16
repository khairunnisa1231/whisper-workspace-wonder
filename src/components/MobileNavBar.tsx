
import { Link, useLocation } from "react-router-dom";
import { Home, MessageSquare, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNavBar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-around py-3 bg-background border-t border-border/40 shadow-lg z-50">
      <Link to="/" className="flex flex-col items-center justify-center space-y-1 px-3">
        <Home className={cn("h-6 w-6", isActive("/") ? "text-secondary" : "text-muted-foreground")} />
        <span className={cn("text-xs font-medium", isActive("/") ? "text-secondary" : "text-muted-foreground")}>Home</span>
      </Link>
      
      <Link to="/chat" className="flex flex-col items-center justify-center space-y-1 px-3">
        <MessageSquare className={cn("h-6 w-6", isActive("/chat") ? "text-secondary" : "text-muted-foreground")} />
        <span className={cn("text-xs font-medium", isActive("/chat") ? "text-secondary" : "text-muted-foreground")}>Chat</span>
      </Link>
      
      <Link to="/workspace" className="flex flex-col items-center justify-center space-y-1 px-3">
        <Settings className={cn("h-6 w-6", isActive("/workspace") ? "text-secondary" : "text-muted-foreground")} />
        <span className={cn("text-xs font-medium", isActive("/workspace") ? "text-secondary" : "text-muted-foreground")}>Workspace</span>
      </Link>
      
      <Link to="/login" className="flex flex-col items-center justify-center space-y-1 px-3">
        <User className={cn("h-6 w-6", isActive("/login") ? "text-secondary" : "text-muted-foreground")} />
        <span className={cn("text-xs font-medium", isActive("/login") ? "text-secondary" : "text-muted-foreground")}>Profile</span>
      </Link>
    </div>
  );
}
