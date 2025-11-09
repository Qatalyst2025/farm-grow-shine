import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sprout,
  TrendingUp,
  DollarSign,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cloud,
  CloudRain,
  Sun,
  Brain,
  Leaf,
  LogOut
} from "lucide-react";
import { CropPortfolioCard } from "@/components/dashboard/CropPortfolioCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SmartRecommendations } from "@/components/marketplace/SmartRecommendations";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { CameraCapture } from "@/components/mobile/CameraCapture";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/hooks/use-toast";
import { CreateCropModal } from "@/components/CreateCropModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://hedera-backend-7zk4.onrender.com/api" || "http://localhost:3000/api";

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { position, getCurrentPosition } = useGeolocation();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [cropsLoading, setCropsLoading] = useState(true);

  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const [crops, setCrops] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFarmerRole, setIsFarmerRole] = useState(false);

  const lastLocalCropsRef = useRef<string | null>(null);
  const pollingRef = useRef<number | null>(null);

  const readToken = () => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      null
    );
  };

  const authFetch = useCallback(
    async (input: string, init: RequestInit = {}) => {
      const token = readToken();
      if (!token) throw new Error("NO_TOKEN");

      const headers = {
        "Content-Type": "application/json",
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch(`${API_BASE}${input}`, { ...init, headers });
      if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }
      return res.json();
    },
    []
  );

  const forceLogout = useCallback((message?: string) => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_role");
    if (message) {
      toast({ title: "Session ended", description: message, variant: "destructive" });
    }
    navigate("/login");
  }, [navigate, toast]);

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const data = await authFetch("/farmer/me");
      setFarmerProfile(data);
      setProfileLoading(false);
      return data;
    } catch (err: any) {
      setProfileLoading(false);
      if (err.message === "NO_TOKEN" || err.message === "UNAUTHORIZED") {
        forceLogout("Please sign in again");
        return null;
      }
      setError("Failed to load profile");
      toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
      return null;
    }
  }, [authFetch, forceLogout, toast]);

  const fetchCrops = useCallback(
    async (farmerId?: string) => {
      setCropsLoading(true);
      try {
        const data = await authFetch("/crops");
        const arr = Array.isArray(data) ? data : data?.crops ?? [];
        const filtered = farmerId ? arr.filter((c: any) => c.farmerId === farmerId || c.farmer_id === farmerId) : arr;
        setCrops(filtered);
        lastLocalCropsRef.current = JSON.stringify(filtered || []);
        localStorage.setItem("crops", JSON.stringify(filtered || []));
      } catch (err: any) {
        if (err.message === "NO_TOKEN" || err.message === "UNAUTHORIZED") {
          forceLogout("Please sign in again");
          return;
        }
        toast({ title: "Error", description: "Failed to fetch crops", variant: "destructive" });
      } finally {
        setCropsLoading(false);
      }
    },
    [authFetch, forceLogout, toast]
  );

  const fetchDashboard = useCallback(
    async (farmerId?: string) => {
      if (!farmerId) return;
      try {
        const d = await authFetch(`/farmer/${farmerId}/dashboard`);
        setDashboardData(d);
      } catch {
        setDashboardData(null);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    const role = localStorage.getItem("user_role") || "";
    setIsFarmerRole(role.toUpperCase() === "FARMER");
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const token = readToken();
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const profile = await fetchProfile();
        if (profile) {
          await fetchCrops(profile.id);
          await fetchDashboard(profile.id);
        }
      } finally {
        setLoading(false);
      }
    };

    init();
    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
      }
    };
  }, [fetchProfile, fetchCrops, fetchDashboard, navigate]);

  useEffect(() => {
    getCurrentPosition().catch(() => {});
  }, [getCurrentPosition]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_role");
    navigate("/login");
  };

  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "crops") {
        try {
          const parsed = JSON.parse(String(ev.newValue || "[]"));
          if (farmerProfile?.id) {
            fetchCrops(farmerProfile.id);
          } else {
            setCrops(Array.isArray(parsed) ? parsed : []);
          }
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);

    pollingRef.current = window.setInterval(() => {
      try {
        const local = localStorage.getItem("crops") || "[]";
        if (lastLocalCropsRef.current !== local) {
          lastLocalCropsRef.current = local;
          if (farmerProfile?.id) {
            fetchCrops(farmerProfile.id);
          } else {
            const parsed = JSON.parse(local);
            setCrops(Array.isArray(parsed) ? parsed : []);
          }
        }
      } catch {}
    }, 1000);

    return () => {
      window.removeEventListener("storage", onStorage);
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [farmerProfile, fetchCrops]);

  const farmerName = farmerProfile?.name || farmerProfile?.email || "Farmer";
  const financialScore = dashboardData?.financialScore ?? 78;
  const activeLoans = dashboardData?.activeLoans ?? 1;
  const growingCrops = crops.length;
  const recentSales = dashboardData?.recentSales ?? 2;
  const weatherCondition = "sunny";

  const getWeatherIcon = () => {
    if (weatherCondition === "sunny") return <Sun className="h-5 w-5" />;
    if (weatherCondition === "rainy") return <CloudRain className="h-5 w-5" />;
    return <Cloud className="h-5 w-5" />;
  };

  if (loading || profileLoading || cropsLoading) {
    return (
      <MobileLayout title="Dashboard">
        <div className="min-h-screen bg-background">
          <header className="bg-primary text-primary-foreground py-6 shadow-lg">
            <div className="container mx-auto px-4">
              <Skeleton className="h-10 w-64 bg-white/20" />
            </div>
          </header>
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
            </div>
            <Skeleton className="h-96 mb-8" />
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout title="Dashboard">
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="p-8 max-w-md w-full text-center">
            <div className="text-destructive mb-4">
              <Sprout className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-xl font-bold mb-2">Failed to Load Dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">Try Again</Button>
              <Button onClick={handleLogout} variant="outline" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  const isFarmer = isFarmerRole || !!(farmerProfile?.role === "FARMER");

  return (
    <MobileLayout showBottomNav={false}>
      <div className="min-h-screen bg-background">
        

        <header className="bg-primary text-primary-foreground py-6 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Welcome back, {farmerName}! </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {isFarmer && (
                    <div className="mr-0 sm:mr-2 ">
                      <CreateCropModal />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 border-l-4 border-l-primary hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Active Loans</span>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div className="text-3xl font-bold text-card-foreground">{activeLoans}</div>
              <div className="text-sm text-muted-foreground mt-2">
                {dashboardData?.totalLoanAmount ? `$${dashboardData.totalLoanAmount} total` : '$5000 total amount'}
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-success hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Growing Crops</span>
                <Sprout className="h-5 w-5 text-success" />
              </div>
              <div className="text-3xl font-bold text-card-foreground">{growingCrops}</div>
              <div className="text-sm text-muted-foreground mt-2">
                {dashboardData?.totalCropValue ? `$${dashboardData.totalCropValue} total value` : '$18,500 total value'}
              </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="col-span-1 sm:col-span-2 space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Your Next Steps</h2>
                <div className="space-y-4">
                  {[ 
                    { id: 1, title: "Crop Health Monitor", description: "AI-powered computer vision analysis for pests and diseases", icon: Leaf, color: "success", link: "/crop-health" },
                    { id: 2, title: "AI Verification Center", description: "Build trust with AI security", icon: Brain, color: "secondary", link: "/verification" },
                    { id: 3, title: "AI Advisor", description: "Personalized farming advice", icon: Brain, color: "accent", link: "/ai-advisor" },
                    { id: 4, title: "AI Credit Assessment", description: "View explainable credit score", icon: Brain, color: "primary", link: "/credit-assessment" },
                    { id: 5, title: "Continue Loan Application", description: "You’re close to getting funded", icon: Clock, color: "warning", link: "/farmer/apply-loan" }
                  ].map((card) => (
                    <Card key={card.id} className="p-6 hover:shadow-elevated transition-all hover:-translate-y-1 border-l-4 border-l-primary">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <card.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-1 text-card-foreground">{card.title}</h3>
                          <p className="text-muted-foreground mb-3">{card.description}</p>
                          <Link to={card.link}>
                            <Button variant="outline" size="sm">
                              Take Action
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4">
                  <h2 className="text-2xl font-bold text-foreground">Your Crops</h2>
                  <Link to="/farmer/crops">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>

                {crops.length > 0 ? (
                  <div className="space-y-4">
                    {crops.map((crop) => (
                      <CropPortfolioCard key={String(crop.id)} crop={crop} />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <Sprout className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No crops yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start your farming journey by adding your first crop.
                    </p>

                    {isFarmer && (
                      <div className="flex flex-col items-center gap-3">
                        <CreateCropModal onCropCreated={() => fetchCrops(farmerProfile?.id)} />
                        <p className="text-xs text-muted-foreground">or</p>
                        <Link to="/farmer/apply-loan">
                          <Button variant="outline">Apply for Loan</Button>
                        </Link>
                      </div>
                    )}
                  </Card>
                )}
              </div>

              <CameraCapture cropId="quick-update" />

              <RecentActivity />
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-primary">
                <h3 className="text-lg font-bold mb-4 text-card-foreground">Financial Health Score</h3>
                <div className="relative h-32 flex items-center justify-center mb-4">
                  <div className="relative">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - (financialScore / 100))}`}
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
                    <span className="font-medium text-foreground">{dashboardData?.totalCropValue ?? "$1,850"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Market Demand</span>
                    <span className="font-medium text-success">High</span>
                  </div>
                </div>

                <div className="bg-info/10 rounded-lg p-3 border border-info/20">
                  <p className="text-sm text-muted-foreground">
                    💡 <span className="font-medium">Tip:</span> Add one photo weekly to increase your score.
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-card-foreground">Learning Center</h3>
                </div>
                <p className="text-muted-foreground mb-4">Improve your farming with expert tips.</p>
                <Link to="/farmer/learn">
                  <Button variant="outline" className="w-full group">
                    Explore Resources
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </Card>
            </div>
          </div>

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
