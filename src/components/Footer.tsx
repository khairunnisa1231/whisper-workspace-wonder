
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-secondary" />
              <span className="font-bold text-xl text-primary">Katagrafy.ai</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your AI powered assistant for smarter, faster conversations.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/#features" className="text-sm text-muted-foreground hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="text-sm text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-border/40 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Katagrafy.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
