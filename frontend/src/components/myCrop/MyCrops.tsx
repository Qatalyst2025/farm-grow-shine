import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sprout, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const MyCrops = ({ farmerId }: { farmerId: string }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [crops, setCrops] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", type: "", expectedHarvestDate: "" });

  // helper: read token
  const readToken = () =>
    localStorage.getItem("access_token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("authToken");

  // authed fetch wrapper
  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = readToken();
    if (!token) throw new Error("No token found");
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, []);

  // fetch crops
  const fetchCrops = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authFetch("/crops");
      const arr = Array.isArray(data) ? data : data.crops || [];
      setCrops(arr.filter((c: any) => c.farmerId === farmerId || c.farmer_id === farmerId));
    } catch (err) {
      console.error("Failed to fetch crops:", err);
      toast({ title: "Error", description: "Failed to load crops", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [authFetch, farmerId, toast]);

  useEffect(() => {
    if (farmerId) fetchCrops();
  }, [farmerId, fetchCrops]);

  // handle crop creation
  const handleCreate = async () => {
    if (!form.name || !form.type) {
      toast({ title: "Missing Info", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      setCreating(true);
      const payload = { ...form, farmerId };
      const data = await authFetch("/crops", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast({ title: "Crop Created", description: "Your crop was successfully created!" });
      setForm({ name: "", type: "", expectedHarvestDate: "" });
      setCrops((prev) => [...prev, data.crop]);
    } catch (err) {
      console.error("Create crop failed:", err);
      toast({ title: "Error", description: "Failed to create crop", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading your crops...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Crop Form */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Create New Crop
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="Crop Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            placeholder="Type (e.g. Maize)"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          />
          <Input
            type="date"
            value={form.expectedHarvestDate}
            onChange={(e) => setForm((f) => ({ ...f, expectedHarvestDate: e.target.value }))}
          />
        </div>
        <Button onClick={handleCreate} disabled={creating}>
          {creating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...
            </>
          ) : (
            <>
              <Sprout className="h-4 w-4 mr-2" /> Create Crop
            </>
          )}
        </Button>
      </Card>

      {/* Crop List */}
      {crops.length > 0 ? (
        <div className="grid gap-4">
          {crops.map((crop) => (
            <Card key={crop.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold">{crop.name}</h4>
                  <p className="text-sm text-muted-foreground">{crop.type}</p>
                  {crop.expectedHarvestDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Harvest: {new Date(crop.expectedHarvestDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-sm text-primary font-semibold">
                  {crop.onChainVerified ? "✅ Verified" : "⏳ Pending"}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Sprout className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No crops yet</h3>
          <p className="text-muted-foreground mb-4">Create your first crop to begin your portfolio!</p>
        </Card>
      )}
    </div>
  );
};
