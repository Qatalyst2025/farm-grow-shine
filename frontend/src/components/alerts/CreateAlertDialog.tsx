import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Megaphone, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export const CreateAlertDialog = () => {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("general");
  const [severity, setSeverity] = useState("warning");
  const [requiresAck, setRequiresAck] = useState(true);
  const [expiresIn, setExpiresIn] = useState<string | null>(null);
  const [targetRegions, setTargetRegions] = useState<string[]>([]);
  const [regionInput, setRegionInput] = useState("");
  const [actionItems, setActionItems] = useState<Array<{ description: string; priority: string }>>([]);
  const [actionInput, setActionInput] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSending(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const alertData: any = {
        title,
        message,
        alert_type: alertType,
        severity,
        acknowledgement_required: requiresAck,
        created_by: user.id,
        target_regions: targetRegions,
        action_items: actionItems,
      };

      if (expiresIn) {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + parseInt(expiresIn));
        alertData.expires_at = expiryDate.toISOString();
      }

      const { error } = await supabase
        .from("emergency_alerts")
        .insert(alertData);

      if (error) throw error;

      toast.success("Emergency alert broadcasted successfully");
      
      // Reset form
      setTitle("");
      setMessage("");
      setAlertType("general");
      setSeverity("warning");
      setRequiresAck(true);
      setExpiresIn(null);
      setTargetRegions([]);
      setActionItems([]);
      setOpen(false);
    } catch (error: any) {
      console.error("Error creating alert:", error);
      toast.error("Failed to broadcast alert");
    } finally {
      setSending(false);
    }
  };

  const addRegion = () => {
    if (regionInput.trim() && !targetRegions.includes(regionInput.trim())) {
      setTargetRegions([...targetRegions, regionInput.trim()]);
      setRegionInput("");
    }
  };

  const removeRegion = (region: string) => {
    setTargetRegions(targetRegions.filter(r => r !== region));
  };

  const addAction = () => {
    if (actionInput.trim()) {
      setActionItems([...actionItems, { description: actionInput.trim(), priority: "high" }]);
      setActionInput("");
    }
  };

  const removeAction = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Megaphone className="w-4 h-4" />
          Broadcast Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Broadcast Emergency Alert</DialogTitle>
          <DialogDescription>
            Send a high-priority alert to all users. This will override normal notifications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Alert Type</Label>
              <Select value={alertType} onValueChange={setAlertType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weather">Weather Emergency</SelectItem>
                  <SelectItem value="pest_disease">Pest/Disease Outbreak</SelectItem>
                  <SelectItem value="market_price">Market Price Collapse</SelectItem>
                  <SelectItem value="government_program">Government Program</SelectItem>
                  <SelectItem value="general">General Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severity Level</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Alert Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Severe Drought Warning"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label>Alert Message *</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide detailed information about the emergency..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label>Target Regions (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={regionInput}
                onChange={(e) => setRegionInput(e.target.value)}
                placeholder="Enter region name"
                onKeyPress={(e) => e.key === "Enter" && addRegion()}
              />
              <Button type="button" onClick={addRegion} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {targetRegions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {targetRegions.map((region) => (
                  <Badge key={region} variant="secondary">
                    {region}
                    <button
                      onClick={() => removeRegion(region)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Required Actions (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder="Enter action item"
                onKeyPress={(e) => e.key === "Enter" && addAction()}
              />
              <Button type="button" onClick={addAction} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {actionItems.length > 0 && (
              <ul className="mt-2 space-y-1">
                {actionItems.map((action, idx) => (
                  <li key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{action.description}</span>
                    <button
                      onClick={() => removeAction(idx)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <Label>Alert Expiration</Label>
            <Select value={expiresIn || "none"} onValueChange={(v) => setExpiresIn(v === "none" ? null : v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No expiration</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="72">3 days</SelectItem>
                <SelectItem value="168">7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded">
            <div className="space-y-0.5">
              <Label>Require Acknowledgement</Label>
              <p className="text-xs text-muted-foreground">
                Users must acknowledge this alert before dismissing
              </p>
            </div>
            <Switch
              checked={requiresAck}
              onCheckedChange={setRequiresAck}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={sending}>
              {sending ? "Broadcasting..." : "Broadcast Alert"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};