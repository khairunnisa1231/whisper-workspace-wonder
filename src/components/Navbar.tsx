import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthProvider";
import { Menu, X, MessageSquare, Bell, Check, X as XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [invites, setInvites] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    if (user?.id) {
      // fetch invitations
      supabase
        .from("workspace_invites")
        .select("id, workspace_id, workspace_name")
        .eq("invitee_id", user.id)
        .eq("status", "pending")
        .then(({ data }) => setInvites(data || []));
    }
  }, [user]);

  const handleInviteAction = async (inviteId: string, accept: boolean) => {
    // Accept or reject invite
    await supabase
      .from("workspace_invites")
      .update({ status: accept ? "accepted" : "rejected" })
      .eq("id", inviteId);
    setInvites(invites => invites.filter(inv => inv.id !== inviteId));
    if (accept) {
      // Add workspace access - assume backend handles this with a trigger or policy
    }
  };

  const NavLink = ({ to, label }: { to: string; label: string }) => (
    <Link 
      to={to} 
      className="text-gray-700 hover:text-secondary font-medium dark:text-gray-300 transition-colors"
      onClick={() => setIsMenuOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 mr-4">
          <MessageSquare className="h-6 w-6 text-secondary" />
          <span className="font-bold text-xl text-primary">Katagrafy.ai</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:flex-1 md:justify-center">
          <div className="flex gap-6">
            {isHomePage && (
              <>
                <NavLink to="/#features" label="Features" />
                <NavLink to="/#pricing" label="Pricing" />
              </>
            )}
            <NavLink to="/faq" label="FAQ" />
          </div>
        </nav>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isAuthenticated && (
            <Button
              variant={invites.length > 0 ? "secondary" : "ghost"}
              size="icon"
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {invites.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Button>
          )}

          {!isAuthenticated ? (
            <div className="hidden md:flex md:items-center md:gap-2">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/login?tab=signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex md:items-center md:gap-4">
              <Link to="/chat">
                <Button variant="outline">Chat</Button>
              </Link>
              <Link to="/workspace">
                <Button variant="outline">Workspace</Button>
              </Link>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      
      {/* Invite notification dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitations</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            {invites.length === 0 && (
              <p className="text-muted-foreground text-sm">No new invitations.</p>
            )}
            {invites.map((invite: any) => (
              <div key={invite.id} className="flex justify-between items-center mb-2 border p-2 rounded">
                <div>
                  <div className="font-semibold">{invite.workspace_name}</div>
                  <div className="text-xs text-muted-foreground">You have been invited.</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleInviteAction(invite.id, true)}>
                    <Check className="h-4 w-4" /> Accept
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleInviteAction(invite.id, false)}>
                    <XIcon className="h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <div className="container py-4 flex flex-col gap-4">
            {isHomePage && (
              <>
                <NavLink to="/#features" label="Features" />
                <NavLink to="/#pricing" label="Pricing" />
              </>
            )}
            <NavLink to="/faq" label="FAQ" />
            
            {!isAuthenticated ? (
              <div className="flex flex-col gap-2 mt-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/login?tab=signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Link to="/chat" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Chat</Button>
                </Link>
                <Link to="/workspace" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Workspace</Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
