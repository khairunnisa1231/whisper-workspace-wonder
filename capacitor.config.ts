
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.af70ddcf0366438b898bc5e2ffde3fb6',
  appName: 'whisper-workspace-wonder',
  webDir: 'dist',
  server: {
    url: 'https://af70ddcf-0366-438b-898b-c5e2ffde3fb6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1A1F2C",
      showSpinner: true,
      spinnerColor: "#9b87f5",
    },
  },
};

export default config;
