import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, FileCheck, Upload, X, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DocumentScanner } from "@/components/mobile/DocumentScanner";

interface DocumentUploadProps {
  batchId: string;
}

export const DocumentUpload = ({ batchId }: DocumentUploadProps) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scannedDoc, setScannedDoc] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    documentType: '',
    documentNumber: '',
    issuer: '',
    issueDate: '',
    expiryDate: ''
  });

  useEffect(() => {
    loadDocuments();
  }, [batchId]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('supply_chain_documents')
        .select('*')
        .eq('batch_id', batchId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!scannedDoc) {
      toast.error('Please scan a document first');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call document processing edge function
      const { data, error } = await supabase.functions.invoke('process-supply-chain-document', {
        body: {
          batchId,
          documentType: formData.documentType,
          documentUrl: scannedDoc,
          documentNumber: formData.documentNumber,
          issuer: formData.issuer,
          issueDate: formData.issueDate,
          expiryDate: formData.expiryDate,
          metadata: {
            uploadedAt: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      if (data.analysis.complianceStatus === 'non_compliant') {
        toast.warning('Document uploaded with compliance issues');
      } else {
        toast.success('Document verified successfully');
      }

      setIsAdding(false);
      setFormData({ documentType: '', documentNumber: '', issuer: '', issueDate: '', expiryDate: '' });
      setScannedDoc(null);
      loadDocuments();
    } catch (error: any) {
      console.error('Error processing document:', error);
      toast.error('Failed to process document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      verified: 'bg-green-500',
      pending: 'bg-yellow-500',
      rejected: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getComplianceColor = (status: string) => {
    const colors: Record<string, string> = {
      compliant: 'bg-green-500',
      needs_review: 'bg-yellow-500',
      non_compliant: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add Document Form */}
      {!isAdding ? (
        <Button onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">New Document</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAdding(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Document Type *</Label>
              <Select
                value={formData.documentType}
                onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phytosanitary">Phytosanitary Certificate</SelectItem>
                  <SelectItem value="quality">Quality Certificate</SelectItem>
                  <SelectItem value="origin">Certificate of Origin</SelectItem>
                  <SelectItem value="export">Export License</SelectItem>
                  <SelectItem value="invoice">Commercial Invoice</SelectItem>
                  <SelectItem value="packing">Packing List</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Scan Document *</Label>
              <DocumentScanner
                onDocumentScanned={setScannedDoc}
                documentType={formData.documentType}
              />
            </div>

            <div className="space-y-2">
              <Label>Document Number</Label>
              <Input
                value={formData.documentNumber}
                onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                placeholder="Certificate/License number"
              />
            </div>

            <div className="space-y-2">
              <Label>Issuer</Label>
              <Input
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                placeholder="Issuing authority"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdding(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !scannedDoc} className="flex-1">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Process Document
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Documents List */}
      <div className="space-y-4">
        {documents.length === 0 ? (
          <Card className="p-8 text-center">
            <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No documents uploaded yet</p>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold capitalize mb-1">
                    {doc.document_type.replace('_', ' ')}
                  </h4>
                  {doc.document_number && (
                    <p className="text-sm text-muted-foreground">
                      #{doc.document_number}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {new Date(doc.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge className={getStatusColor(doc.verification_status)}>
                    {doc.verification_status}
                  </Badge>
                  {doc.compliance_status && (
                    <Badge className={getComplianceColor(doc.compliance_status)}>
                      {doc.compliance_status.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                {doc.issuer && (
                  <div>
                    <p className="text-muted-foreground">Issuer</p>
                    <p className="font-medium">{doc.issuer}</p>
                  </div>
                )}
                {doc.issue_date && (
                  <div>
                    <p className="text-muted-foreground">Issue Date</p>
                    <p className="font-medium">
                      {new Date(doc.issue_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {doc.expiry_date && (
                  <div>
                    <p className="text-muted-foreground">Expiry Date</p>
                    <p className="font-medium">
                      {new Date(doc.expiry_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {doc.compliance_issues && doc.compliance_issues.length > 0 && (
                <div className="p-3 bg-destructive/10 rounded-md mb-4">
                  <p className="font-medium text-destructive flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Compliance Issues
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {doc.compliance_issues.map((issue: string, i: number) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(doc.document_url, '_blank')}
                className="w-full"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Document
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
