
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthProvider";
import { Menu, X, MessageSquare } from "lucide-react";
import { PlatformToggle } from "@/components/PlatformToggle";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

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
        
        {/* Platform Toggle */}
        <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
          <PlatformToggle />
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:flex-1 md:justify-center">
          {isHomePage && (
            <div className="flex gap-6">
              <NavLink to="/#features" label="Features" />
              <NavLink to="/#pricing" label="Pricing" />
            </div>
          )}
        </nav>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
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
