import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Upload, CheckCircle2, Clock } from "lucide-react";

interface DocumentsListProps {
  roomId: string;
}

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  document_url: string;
  verified: boolean;
  created_at: string;
}

export default function DocumentsList({ roomId }: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [roomId]);

  const loadDocuments = async () => {
    const { data, error } = await supabase
      .from('negotiation_documents')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>;

  if (documents.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground mb-3">No documents uploaded yet</p>
        <Button size="sm" variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm">Documents</h4>
        <Button size="sm" variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>

      {documents.map((doc) => (
        <Card key={doc.id} className="p-3">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary shrink-0" />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{doc.file_name}</p>
              <p className="text-xs text-muted-foreground">{doc.document_type}</p>
            </div>

            {doc.verified ? (
              <Badge className="bg-green-500 text-white text-xs shrink-0">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs shrink-0">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>

          <Button
            variant="link"
            size="sm"
            className="mt-2 p-0 h-auto text-xs"
            onClick={() => window.open(doc.document_url, '_blank')}
          >
            View Document
          </Button>
        </Card>
      ))}
    </div>
  );
}
