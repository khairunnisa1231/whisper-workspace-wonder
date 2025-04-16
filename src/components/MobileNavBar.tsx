
import { Link, useLocation } from "react-router-dom";
import { Home, MessageSquare, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNavBar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="mobile-only mobile-nav-bar">
      <Link to="/" className="mobile-tab">
        <Home className={cn("h-6 w-6", isActive("/") ? "text-secondary" : "text-muted-foreground")} />
        <span className={cn(isActive("/") ? "text-secondary" : "text-muted-foreground")}>Home</span>
      </Link>
      
      <Link to="/chat" className="mobile-tab">
        <MessageSquare className={cn("h-6 w-6", isActive("/chat") ? "text-secondary" : "text-muted-foreground")} />
        <span className={cn(isActive("/chat") ? "text-secondary" : "text-muted-foreground")}>Chat</span>
      </Link>
      
      <Link to="/workspace" className="mobile-tab">
        <Settings className={cn("h-6 w-6", isActive("/workspace") ? "text-secondary" : "text-muted-foreground")} />
        <span className={cn(isActive("/workspace") ? "text-secondary" : "text-muted-foreground")}>Workspace</span>
      </Link>
      
      <Link to="/login" className="mobile-tab">
        <User className={cn("h-6 w-6", isActive("/login") ? "text-secondary" : "text-muted-foreground")} />
        <span className={cn(isActive("/login") ? "text-secondary" : "text-muted-foreground")}>Profile</span>
      </Link>
    </div>
  );
}
