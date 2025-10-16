import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

const CropProgress = () => {
  const { cropId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  // Mock crop data - in real app, fetch from API/database
  const crop = {
    id: cropId || "1",
    name: "Maize",
    variety: "Golden Harvest",
    plantingDate: "2025-08-15",
    expectedHarvest: "2025-12-10",
    stage: "Flowering",
    progress: 65,
    health: "healthy",
    location: "Plot A, North Field",
    size: "2.5 hectares"
  };

  const milestones = [
    { id: 1, name: "Land Preparation", date: "2025-08-10", completed: true, verified: true },
    { id: 2, name: "Planting", date: "2025-08-15", completed: true, verified: true },
    { id: 3, name: "Germination", date: "2025-08-22", completed: true, verified: true },
    { id: 4, name: "Vegetative Growth", date: "2025-09-15", completed: true, verified: true },
    { id: 5, name: "Flowering", date: "2025-10-05", completed: true, verified: false },
    { id: 6, name: "Grain Filling", date: "2025-11-01", completed: false, verified: false },
    { id: 7, name: "Maturity", date: "2025-11-25", completed: false, verified: false },
    { id: 8, name: "Harvest", date: "2025-12-10", completed: false, verified: false }
  ];

  return (
    <MobileLayout title={`${crop.name} Progress`} showBottomNav={true}>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/farmer">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold mb-1">{crop.name} - {crop.variety}</h1>
                <p className="text-primary-foreground/90">
                  {crop.location} • {crop.size} • Planted {new Date(crop.plantingDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-primary-foreground hover:bg-white/20">
                <FileText className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-primary-foreground hover:bg-white/20">
                <Award className="h-4 w-4 mr-2" />
                View Achievements
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Overview */}
        <ProgressIndicators crop={crop} milestones={milestones} />

        {/* Main Content Tabs */}
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
