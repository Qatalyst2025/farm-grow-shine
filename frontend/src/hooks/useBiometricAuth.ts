import { useState } from 'react';
import { BiometricAuth, CheckBiometryResult } from '@aparajita/capacitor-biometric-auth';
import { useToast } from '@/hooks/use-toast';

export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<string>('');
  const { toast } = useToast();

  const checkAvailability = async () => {
    try {
      const result = await BiometricAuth.checkBiometry();
      setIsAvailable(result.isAvailable);
      setBiometryType(String(result.biometryType || ''));
      return result;
    } catch (error) {
      console.error('Biometry check error:', error);
      return {
        isAvailable: false,
        strongBiometryIsAvailable: false,
        biometryType: '' as any,
        biometryTypes: [],
        deviceIsSecure: false
      };
    }
  };

  const authenticate = async (reason: string = 'Authenticate to continue'): Promise<boolean> => {
    try {
      const available = await checkAvailability();
      
      if (!available.isAvailable) {
        toast({
          title: "Biometric authentication unavailable",
          description: "Please use password authentication",
          variant: "destructive"
        });
        return false;
      }

      await BiometricAuth.authenticate({
        reason,
        cancelTitle: 'Cancel',
        allowDeviceCredential: true,
        iosFallbackTitle: 'Use Passcode',
        androidTitle: 'Biometric Authentication',
        androidSubtitle: reason,
        androidConfirmationRequired: false,
      });

      toast({
        title: "Authentication successful",
        description: `Verified via ${biometryType}`,
      });

      return true;
    } catch (error: any) {
      if (error.code !== 10) { // Code 10 is user cancellation
        toast({
          title: "Authentication failed",
          description: "Please try again",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  return {
    isAvailable,
    biometryType,
    checkAvailability,
    authenticate,
  };
};
