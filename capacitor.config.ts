import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e17c61206b7f4bbe851b1f47413fe101',
  appName: 'farm-grow-shine',
  webDir: 'dist',
  server: {
    url: 'https://e17c6120-6b7f-4bbe-851b-1f47413fe101.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2E8B57',
      showSpinner: true,
      spinnerColor: '#FFD700'
    }
  }
};

export default config;
