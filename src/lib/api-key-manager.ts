
// This file manages the Gemini API key when not using Supabase edge functions

// Get the API key from local storage
export function getApiKey(): string {
  return localStorage.getItem("gemini_api_key") || "";
}

// Check if the API key is set
export function hasApiKey(): boolean {
  return !!getApiKey();
}

// Set environment variable for Gemini service
// This is called when the app initializes
export function initializeApiKey(): void {
  const apiKey = getApiKey();
  if (apiKey && typeof window !== "undefined") {
    // Create a virtual environment variable
    // This will be used by the Gemini service
    window.ENV = window.ENV || {};
    window.ENV.VITE_GEMINI_API_KEY = apiKey;
  }
}

// We need to add this to the global Window interface
declare global {
  interface Window {
    ENV?: {
      VITE_GEMINI_API_KEY?: string;
    };
  }
}
