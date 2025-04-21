
import { useState, useEffect } from "react";

/**
 * Hook to detect if the current device is a mobile device based on screen width
 * @returns boolean indicating if the device is mobile
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (for SSR)
    if (typeof window === "undefined") {
      return;
    }

    // Function to check if window width is mobile size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return isMobile;
}
