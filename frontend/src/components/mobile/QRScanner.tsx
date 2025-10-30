import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QrCode, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

interface QRScannerProps {
  onScan?: (result: string) => void;
}

export const QRScanner = ({ onScan }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const { toast } = useToast();

  const startScan = async () => {
    try {
      // Check permission
      const status = await BarcodeScanner.checkPermission({ force: true });

      if (!status.granted) {
        toast({
          title: "Camera permission required",
          description: "Please enable camera access to scan QR codes",
          variant: "destructive"
        });
        return;
      }

      // Make background transparent for camera view
      document.body.style.opacity = '0';
      document.body.style.background = 'transparent';
      
      setIsScanning(true);

      const result = await BarcodeScanner.startScan();

      if (result.hasContent) {
        setScannedData(result.content || '');
        onScan?.(result.content || '');
        
        toast({
          title: "QR Code scanned",
          description: "Processing scanned data...",
        });
      }

    } catch (error) {
      console.error('QR scan error:', error);
      toast({
        title: "Scan failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      stopScan();
    }
  };

  const stopScan = () => {
    BarcodeScanner.stopScan();
    document.body.style.opacity = '1';
    document.body.style.background = '';
    setIsScanning(false);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">QR Code Scanner</h4>
          {isScanning && (
            <Button
              size="sm"
              variant="destructive"
              onClick={stopScan}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>

        {scannedData && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Scanned Data:</p>
            <p className="text-xs text-muted-foreground break-all">{scannedData}</p>
          </div>
        )}

        {!isScanning && (
          <Button
            onClick={startScan}
            className="w-full touch-manipulation"
            size="lg"
          >
            <QrCode className="h-5 w-5 mr-2" />
            Scan QR Code
          </Button>
        )}

        {isScanning && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Point your camera at a QR code
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
