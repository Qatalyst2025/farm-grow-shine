import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Camera, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';

interface DocumentScannerProps {
  onDocumentScanned?: (imageUrl: string) => void;
  documentType?: string;
}

export const DocumentScanner = ({ 
  onDocumentScanned,
  documentType = 'Document'
}: DocumentScannerProps) => {
  const [scannedDoc, setScannedDoc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const scanDocument = async () => {
    try {
      setIsScanning(true);

      const image = await CapCamera.getPhoto({
        quality: 100,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 1920,
        height: 1920,
      });

      const imageUrl = image.dataUrl;
      
      if (imageUrl) {
        setScannedDoc(imageUrl);
        onDocumentScanned?.(imageUrl);
        
        toast({
          title: "Document scanned",
          description: `${documentType} captured successfully`,
        });
      }

    } catch (error: any) {
      if (error.message !== 'User cancelled photos app') {
        console.error('Document scan error:', error);
        toast({
          title: "Scan failed",
          description: "Please try again",
          variant: "destructive"
        });
      }
    } finally {
      setIsScanning(false);
    }
  };

  const clearDocument = () => {
    setScannedDoc(null);
    toast({
      title: "Document removed",
      description: "You can scan a new document",
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Document Scanner</h4>
          </div>
        </div>

        {scannedDoc ? (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border">
              <img 
                src={scannedDoc} 
                alt="Scanned document" 
                className="w-full h-auto"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={scanDocument}
                variant="outline"
                className="flex-1 touch-manipulation"
                disabled={isScanning}
              >
                <Camera className="h-4 w-4 mr-2" />
                Rescan
              </Button>
              <Button
                onClick={clearDocument}
                variant="destructive"
                className="flex-1 touch-manipulation"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-8 bg-muted/50 rounded-lg border-2 border-dashed">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No document scanned yet
              </p>
            </div>
            
            <Button
              onClick={scanDocument}
              className="w-full touch-manipulation"
              size="lg"
              disabled={isScanning}
            >
              <Camera className="h-5 w-5 mr-2" />
              {isScanning ? 'Scanning...' : `Scan ${documentType}`}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              For best results, ensure good lighting and document is flat
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
