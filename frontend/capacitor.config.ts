import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e17c61206b7f4bbe851b1f47413fe101',
  appName: 'AgriLinka',
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
      backgroundColor: '#1D5C3A',
      showSpinner: true,
      spinnerColor: '#E3B23C',
      launchAutoHide: true,
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'splash'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
