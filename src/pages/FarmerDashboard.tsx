import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sprout, 
  TrendingUp, 
  DollarSign, 
  Package,
  Camera,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cloud,
  CloudRain,
  Sun,
  MapPin,
  Brain,
  Leaf
} from "lucide-react";
import { Link } from "react-router-dom";
import { CropPortfolioCard } from "@/components/dashboard/CropPortfolioCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SmartRecommendations } from "@/components/marketplace/SmartRecommendations";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { CameraCapture } from "@/components/mobile/CameraCapture";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/hooks/use-toast";

const FarmerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const { position, getCurrentPosition } = useGeolocation();
  const { toast } = useToast();
  
  // Fetch farmer profile
  useEffect(() => {
    const fetchFarmerProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('farmer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setFarmerProfile(data);
      }
    };
    fetchFarmerProfile();
  }, []);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Get location on mount
  useEffect(() => {
    getCurrentPosition();
  }, []);

  // Mock data - in real app, fetch from API
  const farmerName = "Kwame";
  const currentSeason = "Planting Season";
  const weatherCondition = "sunny"; // sunny, rainy, cloudy
  const financialScore = 78;
  const activeLoans = 1;
  const growingCrops = 3;
  const recentSales = 2;

  const getWeatherIcon = () => {
    if (weatherCondition === "sunny") return <Sun className="h-5 w-5" />;
    if (weatherCondition === "rainy") return <CloudRain className="h-5 w-5" />;
    return <Cloud className="h-5 w-5" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  const actionCards = [
    {
      id: 1,
      title: "Crop Health Monitor",
      description: "AI-powered computer vision analysis for pests, diseases, and growth stages",
      icon: Leaf,
      color: "success",
      link: "/crop-health",
      priority: 1
    },
    {
      id: 2,
      title: "AI Verification Center",
      description: "Verify farm ownership and build your trust network with AI-powered security",
      icon: Brain,
      color: "secondary",
      link: "/verification",
      priority: 1
    },
    {
      id: 9,
      title: "AI Agricultural Advisor",
      description: "Get personalized farming advice with voice support in local languages",
      icon: Brain,
      color: "accent",
      link: "/ai-advisor",
      priority: 1
    },
    {
      id: 10,
      title: "AI Credit Assessment",
      description: "View your multi-dimensional credit score with explainable AI insights",
      icon: Brain,
      color: "primary",
      link: "/credit-assessment",
      priority: 1
    },
    {
      id: 3,
      title: "AI Risk Assessment",
      description: "Get your AI-powered Farmer Trust Score and unlock better loan terms",
      icon: Brain,
      color: "secondary",
      link: "/farmer/risk-assessment",
      priority: 1
    },
    {
      id: 4,
      title: "Continue Your Loan Application",
      description: "You're 2 steps away from getting funded!",
      icon: Clock,
      color: "warning",
      link: "/farmer/apply-loan",
      priority: 1
    },
    {
      id: 5,
      title: "Explore the Marketplace",
      description: "See buyer offers for your crops and connect with customers",
      icon: Package,
      color: "success",
      link: "/marketplace",
      priority: 2
    }
  ];

  const crops = [
    {
      id: 1,
      name: "Maize",
      stage: "Flowering",
      progress: 65,
      value: "$800",
      nextMilestone: "Harvest in 6 weeks"
    },
    {
      id: 2,
      name: "Cassava",
      stage: "Growing",
      progress: 40,
      value: "$600",
      nextMilestone: "Update photos this week"
    },
    {
      id: 3,
      name: "Tomatoes",
      stage: "Harvesting",
      progress: 90,
      value: "$450",
      nextMilestone: "Ready to sell!"
    }
  ];

  if (loading) {
    return (
      <MobileLayout title="Dashboard">
        <div className="min-h-screen bg-background">
          <header className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground py-6 shadow-lg">
            <div className="container mx-auto px-4">
              <Skeleton className="h-10 w-64 bg-white/20" />
            </div>
          </header>
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96 mb-8" />
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={`Welcome, ${farmerName}!`} showBottomNav={true}>
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {farmerName}! 👋</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm md:text-base text-primary-foreground/90">
                  <div className="flex items-center gap-2">
                    <Sprout className="h-4 w-4" />
                    <span>{currentSeason}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getWeatherIcon()}
                    <span className="capitalize">{weatherCondition}</span>
                  </div>
                  {position && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs">
                        {position.coords.latitude.toFixed(2)}°, {position.coords.longitude.toFixed(2)}°
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 border-l-4 border-l-primary hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Active Loans</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-card-foreground">{activeLoans}</div>
            <div className="text-sm text-muted-foreground mt-2">$500 total amount</div>
          </Card>

          <Card className="p-6 border-l-4 border-l-success hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Growing Crops</span>
              <Sprout className="h-5 w-5 text-success" />
            </div>
            <div className="text-3xl font-bold text-card-foreground">{growingCrops}</div>
            <div className="text-sm text-muted-foreground mt-2">$1,850 total value</div>
          </Card>

          <Card className="p-6 border-l-4 border-l-secondary hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Recent Sales</span>
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <div className="text-3xl font-bold text-card-foreground">{recentSales}</div>
            <div className="text-sm text-muted-foreground mt-2">Last 30 days</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Cards */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Your Next Steps</h2>
              <div className="space-y-4">
                {actionCards.map((card) => (
                  <Card 
                    key={card.id}
                    className={`p-6 hover:shadow-elevated transition-all hover:-translate-y-1 border-l-4 ${
                      card.color === 'warning' ? 'border-l-warning' :
                      card.color === 'success' ? 'border-l-success' :
                      'border-l-primary'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        card.color === 'warning' ? 'bg-warning/10' :
                        card.color === 'success' ? 'bg-success/10' :
                        'bg-primary/10'
                      }`}>
                        <card.icon className={`h-6 w-6 ${
                          card.color === 'warning' ? 'text-warning' :
                          card.color === 'success' ? 'text-success' :
                          'text-primary'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1 text-card-foreground">{card.title}</h3>
                        <p className="text-muted-foreground mb-3">{card.description}</p>
                        <Link to={card.link}>
                          <Button variant="outline" size="sm" className="group">
                            Take Action
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Crop Portfolio */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Your Crops</h2>
                <Link to="/farmer/crops">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              {crops.length > 0 ? (
                <div className="space-y-4">
                  {crops.map((crop) => (
                    <CropPortfolioCard key={crop.id} crop={crop} />
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Sprout className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No crops yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your farming journey by applying for a loan!
                  </p>
                  <Link to="/farmer/apply-loan">
                    <Button>Apply for Loan</Button>
                  </Link>
                </Card>
              )}
            </div>

            {/* Camera Quick Access */}
            <CameraCapture cropId="quick-update" />

            {/* Recent Activity */}
            <RecentActivity />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Health Score */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-success/5">
              <h3 className="text-lg font-bold mb-4 text-card-foreground">Financial Health Score</h3>
              
              <div className="relative h-32 flex items-center justify-center mb-4">
                <div className="relative">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-muted"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - financialScore / 100)}`}
                      className="text-primary transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary">{financialScore}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment History</span>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="font-medium">Excellent</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Crop Value</span>
                  <span className="font-medium text-foreground">$1,850</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Market Demand</span>
                  <span className="font-medium text-success">High</span>
                </div>
              </div>

              <div className="bg-info/10 rounded-lg p-3 border border-info/20">
                <p className="text-sm text-muted-foreground">
                  💡 <span className="font-medium">Tip:</span> Add one photo weekly to increase your score by 5 points
                </p>
              </div>
            </Card>

            {/* Learning Center */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-card-foreground">Learning Center</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Improve your farming with expert tips and guides
              </p>
              <Link to="/farmer/learn">
                <Button variant="outline" className="w-full group">
                  Explore Resources
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>

        {/* Smart Recommendations */}
        {farmerProfile && (
          <div className="mt-8">
            <SmartRecommendations farmerId={farmerProfile.id} />
          </div>
        )}
      </div>
      </div>
    </MobileLayout>
  );
};

export default FarmerDashboard;
