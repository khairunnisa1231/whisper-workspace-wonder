
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-gradient-to-b from-background to-secondary/5 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/katagrafy_primary_logo.png" width={"40%"} />
            </Link>
            <p className="text-sm text-muted-foreground">
              Your AI powered assistant for smarter, faster conversations.
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Katagrafy.ai. All rights reserved.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/#features" className="text-sm text-muted-foreground hover:text-secondary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="text-sm text-muted-foreground hover:text-secondary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-secondary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-secondary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-secondary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
