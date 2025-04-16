import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MessageSquare, Database, Upload, Shield } from "lucide-react";

export default function Index() {
  const { isAuthenticated, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chat");
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        {!isSupabaseConfigured ? (
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-3xl mx-auto">
              <Database className="h-16 w-16 text-primary mx-auto mb-6" />
              <h1 className="text-4xl font-bold mb-4">Connect to Supabase</h1>
              <p className="text-xl text-muted-foreground mb-8">
                This application requires a Supabase connection to function properly. Please connect to Supabase using the green button in the top right corner of the editor.
              </p>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-8">
                <p className="text-yellow-800 dark:text-yellow-300">
                  Once connected, you'll need to run the SQL schema file to set up the database tables.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <section className="bg-muted py-20">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h1 className="text-4xl font-bold mb-4">
                    Your AI-Powered Assistant
                  </h1>
                  <p className="text-lg text-muted-foreground mb-6">
                    Unlock the power of AI with our intelligent chat application.
                    Get instant answers, generate creative content, and streamline
                    your workflow.
                  </p>
                  <Button size="lg" onClick={() => navigate("/chat")}>
                    Get Started <MessageSquare className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                <div className="flex justify-center">
                  <MessageSquare className="h-64 w-64 text-primary" />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
