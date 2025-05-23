
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { ChatProvider } from "@/context/ChatContext";
import { SettingsProvider } from "@/context/SettingsContext";
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
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/chat" 
                  element={
                    <SettingsProvider>
                      <ChatProvider>
                        <ChatPage />
                      </ChatProvider>
                    </SettingsProvider>
                  } 
                />
                <Route path="/workspace" element={<WorkspacePage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
