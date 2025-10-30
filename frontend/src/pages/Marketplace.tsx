import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SmartRecommendations } from "@/components/marketplace/SmartRecommendations";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  SlidersHorizontal, 
  Grid3x3, 
  List,
  MapPin,
  ShoppingBag,
  User,
  TrendingUp,
  DollarSign,
  Sparkles,
  Navigation
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { MapView } from "@/components/marketplace/MapView";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { CropListingCard } from "@/components/marketplace/CropListingCard";
import { MarketPulseDashboard } from "@/components/marketplace/MarketPulseDashboard";
import { PriceAnalysisTool } from "@/components/marketplace/PriceAnalysisTool";
import { SmartOffersPanel } from "@/components/marketplace/SmartOffersPanel";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { useToast } from "@/hooks/use-toast";
import { FarmerMap } from "@/components/marketplace/FarmerMap";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const Marketplace = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMap, setShowMap] = useState(true);
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const [marketInsights, setMarketInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loadingFarmers, setLoadingFarmers] = useState(false);
  const [activeTab, setActiveTab] = useState("marketplace");

  // Get authentication token
  const readToken = () => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      null
    );
  };

  // Auth fetch function
  const authFetch = async (input: string, init: RequestInit = {}) => {
    const token = readToken();
    if (!token) throw new Error("NO_TOKEN");

    const headers = {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
    };

    const res = await fetch(`${API_BASE}/buyer/me`, { ...init, headers });
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed: ${res.status}`);
    }
    return res.json();
  };

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = readToken();
      const userRole = localStorage.getItem("user_role");
      
      if (!token) {
        setIsAuthenticated(false);
        toast({
          title: "Authentication Required",
          description: "Please log in to access the marketplace",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      if (userRole !== "BUYER") {
        setIsAuthenticated(false);
        toast({
          title: "Access Denied",
          description: "This section is for buyers only",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      setIsAuthenticated(true);
    };

    checkAuth();
  }, [navigate, toast]);

  // Fetch all farmers for the map from your backend API
  useEffect(() => {
    if (isAuthenticated !== true) return;

    const fetchFarmers = async () => {
      setLoadingFarmers(true);
      try {
        // Fetch farmers from your backend API
        const data = await authFetch("/farmers");
        
        // Transform the data to match the expected format
        const farmersWithDetails = Array.isArray(data) ? data.map((farmer: any) => ({
          id: farmer.id,
          user: {
            name: farmer.name || farmer.email || 'Farmer',
            email: farmer.email
          },
          farm_size: farmer.farm_size || 'Small',
          location: farmer.location,
          coordinates: farmer.location || generateMockCoordinates()
        })) : [];

        setFarmers(farmersWithDetails);
      } catch (error: any) {
        console.error('Error fetching farmers:', error);
        
        // If the /farmers endpoint doesn't exist, try to get farmers from user data
        if (error.message.includes("404") || error.message.includes("farmers")) {
          try {
            // Fallback: Get all users with farmer role
            const usersData = await authFetch("/farmer");
            const farmerUsers = Array.isArray(usersData) ? 
              usersData.filter((user: any) => user.role === "FARMER" || user.role === "farmer") : [];
            
            const farmersWithMockData = farmerUsers.map((user: any) => ({
              id: user.id,
              user: {
                name: user.name || user.email || 'Farmer',
                email: user.email
              },
              farm_size: 'Medium',
              location: null,
              coordinates: generateMockCoordinates()
            }));
            
            setFarmers(farmersWithMockData);
          } catch (fallbackError: any) {
            toast({
              title: "Error loading farmers",
              description: "Could not load farmer data from server",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Error loading farmers",
            description: "Could not load farmer locations",
            variant: "destructive"
          });
        }
      } finally {
        setLoadingFarmers(false);
      }
    };

    fetchFarmers();
  }, [isAuthenticated, toast]);

  // Generate mock coordinates for demo (in a real app, farmers would set their actual location)
  const generateMockCoordinates = () => {
    // Rough coordinates around Kenya/East Africa region
    const kenyaBounds = {
      minLat: -4.67,
      maxLat: 4.62,
      minLng: 33.90,
      maxLng: 41.90
    };
    
    return {
      lat: kenyaBounds.minLat + Math.random() * (kenyaBounds.maxLat - kenyaBounds.minLat),
      lng: kenyaBounds.minLng + Math.random() * (kenyaBounds.maxLng - kenyaBounds.minLng)
    };
  };

  // Fetch farmer profile for recommendations (only if authenticated and is a farmer)
  useEffect(() => {
    if (isAuthenticated !== true) return;

    const fetchFarmerProfile = async () => {
      try {
        const data = await authFetch("/farmer/me");
        setFarmerProfile(data);
        
        // Load market insights for farmers
        if (data) {
          loadMarketInsights(data.id);
        }
      } catch (error) {
        console.error('Error fetching farmer profile:', error);
        // Not a farmer, that's okay
      }
    };
    fetchFarmerProfile();
  }, [isAuthenticated]);

  const loadMarketInsights = async (farmerId: string) => {
    setLoadingInsights(true);
    try {
      // This would call your backend API for market insights
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMarketInsights({
        trendingCrops: ["Maize", "Tomatoes", "Beans"],
        priceTrends: { maize: 450, tomatoes: 800, beans: 600 },
        demandForecast: "High demand for organic vegetables"
      });
    } catch (error: any) {
      console.error('Error loading insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleRefresh = async () => {
    if (farmerProfile) {
      await loadMarketInsights(farmerProfile.id);
    }
    // Refresh farmers list
    if (isAuthenticated) {
      const fetchFarmers = async () => {
        try {
          const data = await authFetch("/farmers");
          const farmersWithDetails = Array.isArray(data) ? data.map((farmer: any) => ({
            id: farmer.id,
            user: {
              name: farmer.name || farmer.email || 'Farmer',
              email: farmer.email
            },
            farm_size: farmer.farm_size || 'Small',
            location: farmer.location,
            coordinates: farmer.location || generateMockCoordinates()
          })) : [];
          setFarmers(farmersWithDetails);
        } catch (error) {
          console.error('Error refreshing farmers:', error);
        }
      };
      fetchFarmers();
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  // Mock listings - in a real app, these would come from your backend
  const listings = [
    {
      id: "1",
      cropName: "Premium Maize",
      farmerName: "Kwame Mensah",
      farmerRating: 4.8,
      farmerInitials: "KM",
      images: [],
      currentPrice: 450,
      marketAverage: 500,
      harvestDate: "Jun 15, 2025",
      quality: 5,
      certifications: ["Organic", "Verified"],
      progress: { stage: "Flowering", percentage: 65 },
      bidEndTime: "2 days 4 hours",
    },
    {
      id: "2",
      cropName: "Fresh Cassava",
      farmerName: "Ama Osei",
      farmerRating: 4.9,
      farmerInitials: "AO",
      images: [],
      currentPrice: 350,
      marketAverage: 380,
      harvestDate: "Jul 20, 2025",
      quality: 4,
      certifications: ["Verified", "Community"],
      progress: { stage: "Growing", percentage: 40 },
      bidEndTime: "5 days 12 hours",
    },
    {
      id: "3",
      cropName: "Organic Tomatoes",
      farmerName: "Kofi Asante",
      farmerRating: 4.7,
      farmerInitials: "KA",
      images: [],
      currentPrice: 800,
      marketAverage: 750,
      harvestDate: "May 30, 2025",
      quality: 5,
      certifications: ["Organic"],
      progress: { stage: "Harvesting", percentage: 90 },
      bidEndTime: "1 day 8 hours",
    },
    {
      id: "4",
      cropName: "Mixed Vegetables",
      farmerName: "Akua Boateng",
      farmerRating: 5.0,
      farmerInitials: "AB",
      images: [],
      currentPrice: 600,
      marketAverage: 620,
      harvestDate: "Jun 5, 2025",
      quality: 5,
      certifications: ["Organic", "Verified", "Community"],
      progress: { stage: "Ready", percentage: 95 },
      bidEndTime: "3 hours",
    },
  ];

  const handleMakeOffer = (id: string) => {
    console.log("Making offer for listing:", id);
    // In real app, open negotiation modal
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <MobileLayout title="Marketplace" showBottomNav={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <MobileLayout title="Marketplace" showBottomNav={true}>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="bg-gradient-to-r from-primary to-success text-primary-foreground py-6 shadow-lg sticky top-0 z-40">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">Crop Marketplace 🌾</h1>
                  <p className="text-primary-foreground/80">
                    Discover quality crops from verified farmers
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link to="/buyer/profile">
                    <Button variant="outline" className="bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20">
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20"
                    onClick={() => navigate("/")}
                  >
                    Home
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search crops, farmers, or locations..."
                    className="pl-10 bg-white/95 border-white/30"
                  />
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setShowMap(!showMap)}
                  className="hidden lg:flex"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {showMap ? "Hide" : "Show"} Map
                </Button>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5">
                <TabsTrigger value="marketplace">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Marketplace
                </TabsTrigger>
                <TabsTrigger value="farmers">
                  <Navigation className="mr-2 h-4 w-4" />
                  Farmers Map
                </TabsTrigger>
                <TabsTrigger value="insights">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="pricing">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Pricing
                </TabsTrigger>
                {farmerProfile && (
                  <TabsTrigger value="offers">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Offers
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="marketplace" className="space-y-6">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-primary">{listings.length}</div>
                    <div className="text-sm text-muted-foreground">Active Listings</div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-success">{farmers.length}</div>
                    <div className="text-sm text-muted-foreground">Verified Farmers</div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-warning">$425</div>
                    <div className="text-sm text-muted-foreground">Avg Price/ton</div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-info">15km</div>
                    <div className="text-sm text-muted-foreground">Avg Distance</div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Filter Sidebar - Desktop */}
                  <div className="hidden lg:block">
                    <FilterSidebar />
                  </div>

                  {/* Main Content */}
                  <div className="lg:col-span-3 space-y-6">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {/* Mobile Filter */}
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="outline" className="lg:hidden">
                              <SlidersHorizontal className="h-4 w-4 mr-2" />
                              Filters
                            </Button>
                          </SheetTrigger>
                          <SheetContent side="left" className="w-80 p-0">
                            <FilterSidebar isMobile onClose={() => {}} />
                          </SheetContent>
                        </Sheet>

                        <div className="hidden md:flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Showing <strong>{listings.length}</strong> crops
                          </span>
                          <Badge variant="secondary">All filters active</Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={viewMode === "grid" ? "default" : "outline"}
                          size="icon"
                          onClick={() => setViewMode("grid")}
                        >
                          <Grid3x3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === "list" ? "default" : "outline"}
                          size="icon"
                          onClick={() => setViewMode("list")}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Map View - Desktop */}
                    {showMap && (
                      <div className="hidden lg:block h-96 rounded-lg overflow-hidden">
                        <MapView />
                      </div>
                    )}

                    {/* Listings Grid */}
                    <div className={viewMode === "grid" ? "grid md:grid-cols-2 gap-6" : "space-y-4"}>
                      {listings.map((listing) => (
                        <CropListingCard
                          key={listing.id}
                          listing={listing}
                          onMakeOffer={handleMakeOffer}
                        />
                      ))}
                    </div>

                    {/* Load More */}
                    <div className="text-center py-8">
                      <Button variant="outline" size="lg">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Load More Crops
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Smart Recommendations for Farmers */}
                {farmerProfile && (
                  <div className="mt-8">
                    <SmartRecommendations farmerId={farmerProfile.id} />
                  </div>
                )}
              </TabsContent>

              {/* Farmers Map Tab */}
              <TabsContent value="farmers" className="space-y-6">
                <div className="bg-card p-6 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">Farmers Map</h2>
                      <p className="text-muted-foreground">
                        Discover farmers near you and their available crops
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {farmers.length} farmers registered
                    </Badge>
                  </div>

                  {loadingFarmers ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="h-96 rounded-lg overflow-hidden border">
                      <FarmerMap farmers={farmers} />
                    </div>
                  )}

                  {/* Farmers List */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Registered Farmers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {farmers.map((farmer) => (
                        <div key={farmer.id} className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{farmer.user?.name || 'Farmer'}</h4>
                              <p className="text-sm text-muted-foreground">
                                {farmer.farm_size || 'Small'} farm
                              </p>
                            </div>
                          </div>
                          {farmer.location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>Location available</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                {loadingInsights ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : marketInsights ? (
                  <MarketPulseDashboard insights={marketInsights} />
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Market insights will appear here once available
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <PriceAnalysisTool />
              </TabsContent>

              {farmerProfile && (
                <TabsContent value="offers" className="space-y-6">
                  <SmartOffersPanel farmerId={farmerProfile.id} />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </PullToRefresh>
    </MobileLayout>
  );
};

export default Marketplace;
