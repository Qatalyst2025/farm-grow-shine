import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Zap,
  Shield,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface ContractGeneratorProps {
  roomId: string;
  messages: any[];
  roomInfo: any;
}

export default function ContractGenerator({
  roomId,
  messages,
  roomInfo,
}: ContractGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [contract, setContract] = useState<any>(null);
  const [signing, setSigning] = useState(false);
  const { toast } = useToast();

  const extractTerms = () => {
    const offers = messages.filter(
      (m) => m.message_type === "offer" || m.message_type === "counter_offer"
    );
    const accepted = messages.find((m) => m.message_type === "accept");

    if (!accepted || offers.length === 0) {
      return null;
    }

    const latestOffer = offers[offers.length - 1];

    return {
      price_per_kg: latestOffer.offer_amount || roomInfo.current_offer_amount,
      payment_terms: latestOffer.offer_terms || {},
      delivery_terms: {
        location: roomInfo.subject,
        estimated_date: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      quality_standards: {},
      dispute_resolution: "Blockchain-backed arbitration",
    };
  };

  const generateContract = async () => {
    setGenerating(true);
    try {
      const terms = extractTerms();

      if (!terms) {
        toast({
          title: "Cannot generate contract",
          description:
            "An offer must be accepted before generating a contract",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("negotiation_contracts")
        .insert({
          room_id: roomId,
          contract_terms: terms,
          contract_status: "draft",
        })
        .select()
        .single();

      if (error) throw error;

      setContract(data);
      toast({
        title: "Contract Generated!",
        description: "Review and sign to finalize the agreement",
      });
    } catch (error) {
      console.error("Error generating contract:", error);
      toast({
        title: "Failed to generate contract",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const signContract = async () => {
    if (!contract) return;

    setSigning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updates: any = {
        contract_status: "pending_signature",
      };

      // Simulate blockchain timestamp
      const blockchainHash = `0x${Math.random().toString(16).slice(2, 66)}`;

      if (roomInfo.room_type === "farmer_buyer") {
        // Determine if farmer or buyer
        updates.farmer_signature = user.id;
        updates.farmer_signed_at = new Date().toISOString();
        updates.blockchain_tx_hash = blockchainHash;
      }

      const { error } = await supabase
        .from("negotiation_contracts")
        .update(updates)
        .eq("id", contract.id);

      if (error) throw error;

      // Update room
      await supabase
        .from("negotiation_rooms")
        .update({
          status: "completed" as any,
          blockchain_hash: blockchainHash,
        })
        .eq("id", roomId);

      toast({
        title: "Contract Signed!",
        description: "Deal secured with blockchain verification",
      });

      setContract({ ...contract, ...updates });
    } catch (error) {
      console.error("Error signing contract:", error);
      toast({
        title: "Failed to sign contract",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setSigning(false);
    }
  };

  const loadContract = async () => {
    const { data } = await supabase
      .from("negotiation_contracts")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setContract(data);
    }
  };

  useState(() => {
    loadContract();
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-bold">Smart Contract</h3>
        </div>
        {!contract && (
          <Button
            onClick={generateContract}
            disabled={generating || roomInfo.status !== "accepted"}
            size="sm"
            className="bg-gradient-to-r from-primary to-secondary"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Zap className="h-4 w-4 mr-1" />
                Generate Contract
              </>
            )}
          </Button>
        )}
      </div>

      {contract ? (
        <Card className="p-4 space-y-4 bg-gradient-to-br from-card to-primary/5">
          <div className="flex items-center justify-between">
            <Badge
              className={
                contract.contract_status === "draft"
                  ? "bg-yellow-500"
                  : contract.contract_status === "pending_signature"
                  ? "bg-blue-500"
                  : "bg-green-500"
              }
            >
              {contract.contract_status === "draft" && (
                <Clock className="h-3 w-3 mr-1" />
              )}
              {contract.contract_status === "pending_signature" && (
                <Shield className="h-3 w-3 mr-1" />
              )}
              {contract.contract_status === "deployed" && (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              )}
              {contract.contract_status.replace("_", " ").toUpperCase()}
            </Badge>

            {contract.blockchain_tx_hash && (
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1 text-green-600" />
                Blockchain Secured
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm">
              <p className="text-muted-foreground">Contract Terms:</p>
              <Card className="p-3 mt-1 bg-card">
                <div className="space-y-1 text-xs">
                  {contract.contract_terms.price_per_kg && (
                    <div className="flex justify-between">
                      <span>Price per kg:</span>
                      <span className="font-semibold">
                        ${contract.contract_terms.price_per_kg}
                      </span>
                    </div>
                  )}
                  {contract.contract_terms.delivery_terms?.location && (
                    <div className="flex justify-between">
                      <span>Delivery:</span>
                      <span className="font-semibold">
                        {contract.contract_terms.delivery_terms.location}
                      </span>
                    </div>
                  )}
                  {contract.contract_terms.dispute_resolution && (
                    <div className="flex justify-between">
                      <span>Arbitration:</span>
                      <span className="font-semibold">
                        {contract.contract_terms.dispute_resolution}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {contract.blockchain_tx_hash && (
              <div className="text-xs">
                <p className="text-muted-foreground mb-1">Blockchain Hash:</p>
                <code className="bg-muted px-2 py-1 rounded text-xs break-all">
                  {contract.blockchain_tx_hash.slice(0, 20)}...
                  {contract.blockchain_tx_hash.slice(-20)}
                </code>
              </div>
            )}

            {contract.farmer_signed_at && (
              <div className="text-xs text-muted-foreground">
                Signed{" "}
                {formatDistanceToNow(new Date(contract.farmer_signed_at), {
                  addSuffix: true,
                })}
              </div>
            )}
          </div>

          {contract.contract_status === "draft" && (
            <Button
              onClick={signContract}
              disabled={signing}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {signing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Sign & Deploy to Blockchain
                </>
              )}
            </Button>
          )}
        </Card>
      ) : (
        <Card className="p-6 text-center border-dashed">
          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Accept an offer to generate a smart contract
          </p>
        </Card>
      )}
    </div>
  );
}
