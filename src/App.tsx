
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { ChatProvider } from "@/context/ChatContext";
import { useEffect } from "react";
import { ensureWorkspaceFilesBucketExists } from "@/utils/createStorageBucket";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ChatPage from "./pages/ChatPage";
import WorkspacePage from "./pages/WorkspacePage";
import FAQPage from "./pages/FAQPage";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Wrap the App component in a function declaration
function App() {
  useEffect(() => {
    // Ensure the storage bucket exists when the app starts
    ensureWorkspaceFilesBucketExists().catch(err => {
      console.error('Failed to ensure storage bucket exists:', err);
    });
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <ChatProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/workspace" element={<WorkspacePage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </ChatProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
