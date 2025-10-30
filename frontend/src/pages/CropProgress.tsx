import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Camera, TrendingUp, FileText, Award } from "lucide-react";
import { CropTimeline } from "@/components/crop-progress/CropTimeline";
import { PhotoJournal } from "@/components/crop-progress/PhotoJournal";
import { DataLoggingForm } from "@/components/crop-progress/DataLoggingForm";
import { HealthMonitoring } from "@/components/crop-progress/HealthMonitoring";
import { ProgressIndicators } from "@/components/crop-progress/ProgressIndicators";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { CameraCapture } from "@/components/mobile/CameraCapture";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { CreateCropModal } from "@/components/CreateCropModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const CropProgress = () => {
  const { cropId } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCropData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate cropId
      if (!cropId) {
        setError("No crop ID provided");
        return;
      }

      // Check if cropId is a valid UUID, not just "1"
      if (cropId === "1") {
        setError("Invalid crop ID. Please select a valid crop from your dashboard.");
        return;
      }

      // 🌾 Retrieve token safely
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized. Please log in.");
        return;
      }

      // 🌿 Fetch single crop by ID - FIXED ENDPOINT
      const res = await fetch(`${API_BASE}/crops/${cropId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // 🌧️ Handle failed responses
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Crop not found");
        }
        throw new Error(`Failed to load crop (${res.status})`);
      }

      // 🌞 Parse data
      const data = await res.json();

      // 🧩 Set crop and milestones safely
      setCrop(data);
      setMilestones(data.milestones || []);
    } catch (err: any) {
      console.error("❌ Error fetching crop:", err);
      setError(err.message || "Failed to fetch crop data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (cropId) {
      fetchCropData();
    }
  }, [cropId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCropData();
  };

  // 👇 Callback to refresh crops after creating a new one
  const handleCropCreated = async () => {
    // After creating a crop, redirect to the new crop's page
    // We'll need to get the new crop ID from the response
    // For now, just refresh the current page data
    await fetchCropData();
  };

  // Handle navigation back to dashboard with crops list
  const handleBackToDashboard = () => {
    navigate("/farmer");
  };

  if (loading) {
    return (
      <MobileLayout title="Loading..." showBottomNav={true}>
        <div className="p-6 text-center text-muted-foreground">Loading crop...</div>
      </MobileLayout>
    );
  }

  if (error || !crop) {
    return (
      <MobileLayout title="Error" showBottomNav={true}>
        <div className="p-6 text-center space-y-4">
          <div className="text-red-600">
            {error || "Crop not found"}
          </div>
          <div className="space-y-2">
            <Button onClick={handleBackToDashboard} variant="outline">
              Back to Dashboard
            </Button>
            <p className="text-sm text-muted-foreground">
              Crop ID: {cropId}
            </p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={`${crop.name} Progress`} showBottomNav={true}>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="min-h-screen bg-background">
          <header className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground py-6 shadow-lg">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary-foreground hover:bg-white/10"
                    onClick={handleBackToDashboard}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold mb-1">
                      {crop.name}
                    </h1>
                    <p className="text-primary-foreground/90">
                      {crop.type} • Created{" "}
                      {new Date(crop.createdAt).toLocaleDateString()}
                      {crop.expectedHarvestDate && (
                        <> • Harvest by {new Date(crop.expectedHarvestDate).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <CreateCropModal onCropCreated={handleCropCreated} />
                  <Button variant="outline" className="bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                  <Button variant="outline" className="bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20">
                    <Award className="h-4 w-4 mr-2" />
                    View Achievements
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">
            <ProgressIndicators crop={crop} milestones={milestones} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                <TabsTrigger value="overview">Timeline</TabsTrigger>
                <TabsTrigger value="photos">
                  <Camera className="h-4 w-4 mr-2" />
                  Photos
                </TabsTrigger>
                <TabsTrigger value="updates">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Updates
                </TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <CropTimeline crop={crop} milestones={milestones} />
              </TabsContent>

              <TabsContent value="photos" className="mt-6">
                <CameraCapture cropId={crop.id} />
                <div className="mt-6">
                  <PhotoJournal cropId={crop.id} />
                </div>
              </TabsContent>

              <TabsContent value="updates" className="mt-6">
                <DataLoggingForm crop={crop} />
              </TabsContent>

              <TabsContent value="health" className="mt-6">
                <HealthMonitoring crop={crop} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PullToRefresh>
    </MobileLayout>
  );
};

export default CropProgress;
