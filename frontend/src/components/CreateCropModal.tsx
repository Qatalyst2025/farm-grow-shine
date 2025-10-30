import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, PlusCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export function CreateCropModal({ onCropCreated }: { onCropCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "",
    expectedHarvestDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Function to get the current farmer's ID
  const getCurrentFarmerId = async (): Promise<string> => {
    try {
      const token = localStorage.getItem("access_token") || 
                   localStorage.getItem("auth_token") || 
                   localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Fetching farmer profile from:", `${API_BASE}/farmer/me`);

      // Get farmer profile from the /api/farmer/me endpoint
      const response = await fetch(`${API_BASE}/farmer/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const farmerData = await response.json();
        console.log("Farmer profile data:", farmerData);
        
        if (farmerData && farmerData.id) {
          return farmerData.id;
        } else {
          throw new Error("Farmer profile does not contain an ID");
        }
      } else if (response.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch farmer profile: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Error fetching farmer profile:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!form.name.trim() || !form.type.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Get authentication token
      const token = localStorage.getItem("access_token") || 
                   localStorage.getItem("auth_token") || 
                   localStorage.getItem("token");

      if (!token) {
        throw new Error("Please sign in to create a crop");
      }

      // Get farmer ID
      const farmerId = await getCurrentFarmerId();
      console.log("Using farmer ID:", farmerId);

      // Prepare the request body - try without the date field first
      const requestBody: any = {
        farmerId: farmerId,
        name: form.name.trim(),
        type: form.type.trim(),
      };

      // For now, let's NOT send the expectedHarvestDate at all
      // The backend validation is too strict and we need to fix it there first
      // if (form.expectedHarvestDate) {
      //   // The backend wants a Date instance but JSON can't serialize Date objects
      //   // This needs to be fixed in the backend validation
      //   requestBody.expectedHarvestDate = new Date(form.expectedHarvestDate);
      // }

      console.log("Creating crop with data:", requestBody);

      const res = await fetch(`${API_BASE}/crops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server response error:", res.status, errorText);
        
        // Try to parse the error response for better error messages
        let errorMessage = `Failed to create crop: ${res.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            if (Array.isArray(errorJson.message)) {
              errorMessage = errorJson.message.join(', ');
            } else {
              errorMessage = errorJson.message;
            }
          }
        } catch {
          errorMessage = errorText || `Failed to create crop: ${res.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const newCrop = await res.json();
      console.log("Crop created successfully:", newCrop);
      
      // Update localStorage crops for real-time updates
      try {
        const existingCrops = JSON.parse(localStorage.getItem("crops") || "[]");
        localStorage.setItem("crops", JSON.stringify([...existingCrops, newCrop]));
      } catch (storageError) {
        console.warn("Failed to update localStorage:", storageError);
      }
      
      // Call the callback if provided
      if (onCropCreated) {
        onCropCreated();
      }
      
      setOpen(false);
      setForm({ name: "", type: "", expectedHarvestDate: "" });
      
      // Show success message
      alert("Crop created successfully!");
      
    } catch (err: any) {
      console.error("Create crop error:", err);
      alert(err.message || "Failed to create crop. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Crop
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]" aria-describedby="crop-creation-description">
        <DialogHeader>
          <DialogTitle>Create New Crop</DialogTitle>
          <DialogDescription id="crop-creation-description">
            Add a new crop to your farm portfolio. This will help track growth and value.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="crop-name">Crop Name *</Label>
            <Input 
              id="crop-name"
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              placeholder="e.g., Organic Tomatoes"
              required 
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="crop-type">Crop Type *</Label>
            <Input 
              id="crop-type"
              name="type" 
              value={form.type} 
              onChange={handleChange} 
              placeholder="e.g., Vegetables, Fruits, Grains"
              required 
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="harvest-date">Expected Harvest Date</Label>
            <div className="relative">
              <Input
                id="harvest-date"
                type="date"
                name="expectedHarvestDate"
                value={form.expectedHarvestDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} // Today's date
                disabled={loading}
              />
              <CalendarIcon className="absolute right-2 top-2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Note: Harvest date functionality is temporarily disabled
            </p>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Crop"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
