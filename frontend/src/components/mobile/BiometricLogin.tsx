import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Fingerprint, Lock } from 'lucide-react';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';

interface BiometricLoginProps {
  onAuthenticated?: () => void;
  onFallbackToPassword?: () => void;
}

export const BiometricLogin = ({ 
  onAuthenticated,
  onFallbackToPassword 
}: BiometricLoginProps) => {
  const { isAvailable, biometryType, checkAvailability, authenticate } = useBiometricAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      await checkAvailability();
      setIsChecking(false);
    };
    init();
  }, []);

  const handleBiometricAuth = async () => {
    const success = await authenticate('Verify your identity to access your farm account');
    if (success) {
      onAuthenticated?.();
    }
  };

  if (isChecking) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Checking biometric support...</p>
        </div>
      </Card>
    );
  }

  if (!isAvailable) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Fingerprint className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Quick Login</h3>
          <p className="text-sm text-muted-foreground">
            Use {biometryType || 'biometric'} authentication for faster access
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleBiometricAuth}
            className="w-full touch-manipulation"
            size="lg"
          >
            <Fingerprint className="h-5 w-5 mr-2" />
            Authenticate
          </Button>

          <Button
            onClick={onFallbackToPassword}
            variant="ghost"
            className="w-full touch-manipulation"
            size="sm"
          >
            <Lock className="h-4 w-4 mr-2" />
            Use password instead
          </Button>
        </div>
      </div>
    </Card>
  );
};
