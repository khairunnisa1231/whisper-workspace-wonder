
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthProvider";
import { 
  Menu, 
  X, 
  MessageSquare, 
  Bell, 
  Check, 
  ChevronDown, 
  User, 
  LogOut,
  Settings,
  HelpCircle,
  Home,
  FileText,
  Folder,
  CircleDollarSign
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [invites, setInvites] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";
  const isLoginPage = location.pathname === "/login";

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

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const NavLink = ({ to, label, icon: Icon }: { to: string; label: string; icon?: React.ElementType }) => (
    <Link 
      to={to} 
      className="flex items-center gap-2 text-gray-700 hover:text-secondary font-medium dark:text-gray-300 transition-colors"
      onClick={() => setIsMenuOpen(false)}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </Link>
  );

  const ListItem = ({ className, title, children, ...props }: React.ComponentPropsWithoutRef<"a"> & { title: string }) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 mr-4">
          <MessageSquare className="h-6 w-6 text-secondary" />
          <span className="font-bold text-xl text-primary">Katagrafy.ai</span>
        </Link>
        
        <nav className="hidden md:flex md:flex-1 md:justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              {isHomePage && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="font-medium">Features</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        <ListItem
                          href="/#features"
                          title="AI Assistant"
                        >
                          Advanced AI to answer questions, generate content, and solve problems.
                        </ListItem>
                        <ListItem
                          href="/#features"
                          title="Workspace Organization"
                        >
                          Organize your conversations in folders and projects.
                        </ListItem>
                        <ListItem
                          href="/#features"
                          title="Instant Responses"
                        >
                          Get immediate answers and assistance for your questions.
                        </ListItem>
                        <ListItem
                          href="/#features"
                          title="Privacy Focused"
                        >
                          Your data is private and secure with advanced encryption.
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/#pricing">
                      <NavigationMenuLink className="font-medium">
                        Pricing
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </>
              )}
              
              {!isHomePage && !isLoginPage && isAuthenticated && (
                <>
                  <NavigationMenuItem>
                    <Link to="/chat">
                      <NavigationMenuLink className={cn(
                        "font-medium",
                        location.pathname === "/chat" && "text-secondary"
                      )}>
                        Chat
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/workspace">
                      <NavigationMenuLink className={cn(
                        "font-medium",
                        location.pathname === "/workspace" && "text-secondary"
                      )}>
                        Workspace
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </>
              )}
              
              <NavigationMenuItem>
                <Link to="/faq">
                  <NavigationMenuLink className={cn(
                    "font-medium",
                    location.pathname === "/faq" && "text-secondary"
                  )}>
                    FAQ
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
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
            <div className="hidden md:flex md:items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center gap-2 h-10 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.email ? user.email.charAt(0) : ""} alt="User avatar" />
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block">
                      {user?.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.email?.split('@')[0] || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || ''}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                    <X className="h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <div className="container py-4 flex flex-col gap-4">
            {isHomePage && (
              <>
                <NavLink to="/#features" label="Features" icon={MessageSquare} />
                <NavLink to="/#pricing" label="Pricing" icon={CircleDollarSign} />
              </>
            )}
            <NavLink to="/faq" label="FAQ" icon={HelpCircle} />
            
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
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </Button>
                </Link>
                <Link to="/workspace" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <Folder className="h-4 w-4" />
                    Workspace
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-center gap-2" 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
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
