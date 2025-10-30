import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { CreateCropModal } from "@/components/CreateCropModal";
import { CropPortfolioCard } from "@/components/dashboard/CropPortfolioCard";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { ArrowLeft, Sprout, Grid, List, PlusCircle, FileText, Award } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const CropsList = () => {
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const navigate = useNavigate();

  const fetchCrops = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      
      if (!token) {
        setError("Please log in to view your crops");
        return;
      }

      const res = await fetch(`${API_BASE}/crops`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch crops");

      const data = await res.json();
      setCrops(Array.isArray(data) ? data : data?.crops || []);
    } catch (err: any) {
      console.error("Error fetching crops:", err);
      setError(err.message || "Failed to load crops");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCrops();
  };

  const handleCropCreated = () => {
    fetchCrops();
  };

  const handleBackToDashboard = () => {
    navigate("/farmer");
  };

  // Filter crops based on active tab
  const filteredCrops = crops.filter(crop => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return crop.status === "active" || !crop.status;
    if (activeTab === "harvested") return crop.status === "harvested";
    return true;
  });

  if (loading) {
    return (
      <MobileLayout title="My Crops" showBottomNav={true}>
        <div className="p-6 text-center text-muted-foreground">Loading crops...</div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="My Crops" showBottomNav={true}>
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
                      My Crops
                    </h1>
                    <p className="text-primary-foreground/90">
                      Manage and track all your crops in one place
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
                    Achievements
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-6 border-l-4 border-l-primary">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Total Crops</span>
                  <Sprout className="h-5 w-5 text-primary" />
                </div>
                <div className="text-3xl font-bold text-card-foreground">{crops.length}</div>
                <div className="text-sm text-muted-foreground mt-2">
                  Across all categories
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-success">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Active</span>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="text-3xl font-bold text-card-foreground">
                  {crops.filter(c => c.status === "active" || !c.status).length}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Currently growing
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-secondary">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Harvested</span>
                  <Award className="h-5 w-5 text-secondary" />
                </div>
                <div className="text-3xl font-bold text-card-foreground">
                  {crops.filter(c => c.status === "harvested").length}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Completed harvests
                </div>
              </Card>
            </div>

            {/* Tabs and View Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                  <TabsTrigger value="all">All Crops</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="harvested">Harvested</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Crops Content */}
            {error ? (
              <Card className="p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchCrops}>Try Again</Button>
              </Card>
            ) : filteredCrops.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-muted-foreground mb-4">
                  <PlusCircle className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    {activeTab === "all" ? "No crops yet" : `No ${activeTab} crops`}
                  </h3>
                  <p className="mb-6">
                    {activeTab === "all" 
                      ? "Start your farming journey by adding your first crop!" 
                      : `You don't have any ${activeTab} crops yet.`
                    }
                  </p>
                </div>
                <CreateCropModal onCropCreated={handleCropCreated} />
              </Card>
            ) : viewMode === "list" ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    {activeTab === "all" 
                      ? `All Crops (${filteredCrops.length})`
                      : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Crops (${filteredCrops.length})`
                    }
                  </h2>
                  <CreateCropModal onCropCreated={handleCropCreated} />
                </div>
                
                {filteredCrops.map((crop) => (
                  <Link key={crop.id} to={`/farmer/crops/${crop.id}`}>
                    <CropPortfolioCard crop={crop} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCrops.map((crop) => (
                  <Link key={crop.id} to={`/farmer/crops/${crop.id}`}>
                    <Card className="p-4 hover:shadow-lg transition-all cursor-pointer h-full">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Sprout className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{crop.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{crop.type}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className={`w-2 h-2 rounded-full ${
                              crop.status === "harvested" ? "bg-green-400" : "bg-blue-400 animate-pulse"
                            }`}></div>
                            <span className="text-xs text-muted-foreground">
                              {crop.status === "harvested" ? "Harvested" : "Growing"}
                            </span>
                          </div>
                          {crop.expectedHarvestDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Harvest: {new Date(crop.expectedHarvestDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </PullToRefresh>
    </MobileLayout>
  );
};

export default CropsList;
