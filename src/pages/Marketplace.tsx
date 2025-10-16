import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  SlidersHorizontal, 
  Grid3x3, 
  List,
  MapPin,
  ShoppingBag,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { MapView } from "@/components/marketplace/MapView";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { CropListingCard } from "@/components/marketplace/CropListingCard";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";

const Marketplace = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMap, setShowMap] = useState(true);

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  // Mock listings
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
              <Link to="/">
                <Button variant="outline" className="bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20">
                  Home
                </Button>
              </Link>
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
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-primary">{listings.length}</div>
            <div className="text-sm text-muted-foreground">Active Listings</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold text-success">47</div>
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
      </div>
        </div>
      </PullToRefresh>
    </MobileLayout>
  );
};

export default Marketplace;
