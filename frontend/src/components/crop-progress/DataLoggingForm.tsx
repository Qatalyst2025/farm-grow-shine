import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Save, WifiOff, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Crop {
  name: string;
  stage: string;
}

interface DataLoggingFormProps {
  crop: Crop;
}

export const DataLoggingForm = ({ crop }: DataLoggingFormProps) => {
  const { toast } = useToast();
  const [isOffline] = useState(false);
  const [formData, setFormData] = useState({
    updateType: "weekly",
    height: "",
    observations: "",
    wateringSchedule: "",
    fertilizer: "",
    pestControl: ""
  });

  const handleVoiceInput = () => {
    toast({
      title: "Voice Input",
      description: "Listening... Speak your crop update.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Update Saved",
      description: isOffline ? "Your update will sync when you're back online." : "Crop progress updated successfully!",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-card-foreground">Log Crop Update</h3>
              <p className="text-sm text-muted-foreground">
                Record your observations and measurements
              </p>
            </div>
            {isOffline && (
              <div className="flex items-center gap-2 text-sm text-warning">
                <WifiOff className="h-4 w-4" />
                Offline Mode
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Update Type */}
            <div>
              <Label>Update Type</Label>
              <Select value={formData.updateType} onValueChange={(value) => setFormData({...formData, updateType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Update</SelectItem>
                  <SelectItem value="weekly">Weekly Update</SelectItem>
                  <SelectItem value="milestone">Milestone Update</SelectItem>
                  <SelectItem value="emergency">Emergency Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Measurements */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Plant Height (cm)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 45"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                />
              </div>
              <div>
                <Label>Watering Schedule</Label>
                <Select value={formData.wateringSchedule} onValueChange={(value) => setFormData({...formData, wateringSchedule: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="alternate">Every other day</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="rainfed">Rainfed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Observations */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Observations & Notes</Label>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={handleVoiceInput}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Voice Input
                </Button>
              </div>
              <Textarea 
                placeholder="Describe what you observe in your crop... (e.g., leaves are healthy green color, some yellowing on lower leaves, flowering has begun)"
                rows={4}
                value={formData.observations}
                onChange={(e) => setFormData({...formData, observations: e.target.value})}
              />
            </div>

            {/* Inputs Applied */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fertilizer Applied</Label>
                <Input 
                  placeholder="Type and amount"
                  value={formData.fertilizer}
                  onChange={(e) => setFormData({...formData, fertilizer: e.target.value})}
                />
              </div>
              <div>
                <Label>Pest Control</Label>
                <Input 
                  placeholder="Treatment used (if any)"
                  value={formData.pestControl}
                  onChange={(e) => setFormData({...formData, pestControl: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Update
              </Button>
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Templates & Recent Updates */}
      <div className="space-y-6">
        {/* Quick Templates */}
        <Card className="p-6">
          <h4 className="font-semibold mb-4 text-card-foreground">Quick Templates</h4>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setFormData({
                  ...formData,
                  observations: "Regular growth observed. Plants showing healthy development with good color and vigor."
                });
              }}
            >
              Normal Growth Update
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setFormData({
                  ...formData,
                  observations: "Flowering stage initiated. Tassels emerging with good pollination conditions expected."
                });
              }}
            >
              Flowering Update
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setFormData({
                  ...formData,
                  observations: "Applied fertilizer treatment to boost growth. Will monitor response over next few days."
                });
              }}
            >
              Fertilizer Application
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-warning border-warning"
              onClick={() => {
                setFormData({
                  ...formData,
                  updateType: "emergency",
                  observations: "Potential pest/disease issue detected. Immediate attention required."
                });
              }}
            >
              Report Issue
            </Button>
          </div>
        </Card>

        {/* Recent Updates */}
        <Card className="p-6">
          <h4 className="font-semibold mb-4 text-card-foreground">Recent Updates</h4>
          <div className="space-y-4">
            {[
              { date: "2025-10-15", type: "Weekly Update", verified: true },
              { date: "2025-10-08", type: "Photo Upload", verified: true },
              { date: "2025-10-01", type: "Milestone", verified: true }
            ].map((update, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{update.type}</p>
                  <p className="text-xs text-muted-foreground">{update.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Offline Capability Info */}
        <Card className="p-6 bg-info/5 border-info/20">
          <h4 className="font-semibold mb-2 text-card-foreground">Offline Updates</h4>
          <p className="text-sm text-muted-foreground">
            Your updates are saved locally when offline and will automatically sync when you reconnect.
          </p>
        </Card>
      </div>
    </div>
  );
};
