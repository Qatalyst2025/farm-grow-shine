import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  User,
  ShoppingBag,
  Heart,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  Clock,
  CheckCircle2,
  Package
} from "lucide-react";
import { Link } from "react-router-dom";

const BuyerProfile = () => {
  const buyerData = {
    name: "John Buyer",
    initials: "JB",
    email: "john@buyer.com",
    memberSince: "Jan 2024",
    totalInvestment: 15000,
    activeBids: 3,
    completedPurchases: 12,
    savedFarms: 8,
    avgROI: 18.5,
  };

  const savedFarms = [
    { id: "1", name: "Sunshine Farm", farmer: "Kwame", crops: 3, rating: 4.8 },
    { id: "2", name: "Green Valley", farmer: "Ama", crops: 5, rating: 4.9 },
    { id: "3", name: "Organic Hills", farmer: "Akua", crops: 2, rating: 5.0 },
  ];

  const activeBids = [
    {
      id: "1",
      crop: "Premium Maize",
      farmer: "Kwame",
      myBid: 450,
      currentBid: 480,
      status: "outbid",
      timeLeft: "2 days",
    },
    {
      id: "2",
      crop: "Fresh Cassava",
      farmer: "Ama",
      myBid: 360,
      currentBid: 360,
      status: "winning",
      timeLeft: "5 days",
    },
    {
      id: "3",
      crop: "Organic Tomatoes",
      farmer: "Kofi",
      myBid: 820,
      currentBid: 820,
      status: "winning",
      timeLeft: "1 day",
    },
  ];

  const portfolio = [
    {
      id: "1",
      crop: "Maize Harvest 2024",
      farmer: "Kwame",
      invested: 5000,
      currentValue: 5800,
      roi: 16,
      status: "active",
    },
    {
      id: "2",
      crop: "Cassava Season 1",
      farmer: "Ama",
      invested: 3500,
      currentValue: 4200,
      roi: 20,
      status: "harvesting",
    },
    {
      id: "3",
      crop: "Tomatoes Q1",
      farmer: "Kofi",
      invested: 6500,
      currentValue: 7500,
      roi: 15.4,
      status: "completed",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-success text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Buyer Profile</h1>
            <div className="flex gap-3">
              <Link to="/marketplace">
                <Button variant="outline" className="bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Marketplace
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20">
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="p-6 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {buyerData.initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold mb-1">{buyerData.name}</h2>
              <p className="text-muted-foreground mb-4">{buyerData.email}</p>
              <Badge variant="secondary" className="mb-4">
                Member since {buyerData.memberSince}
              </Badge>
              <Button className="w-full">Edit Profile</Button>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Investment Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Invested</span>
                  <span className="font-bold text-lg">${buyerData.totalInvestment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Active Bids</span>
                  <Badge variant="secondary">{buyerData.activeBids}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Purchases</span>
                  <span className="font-bold">{buyerData.completedPurchases}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg ROI</span>
                  <span className="font-bold text-success">+{buyerData.avgROI}%</span>
                </div>
              </div>
            </Card>

            {/* Saved Farms */}
            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-destructive" />
                Saved Farms ({buyerData.savedFarms})
              </h3>
              <div className="space-y-3">
                {savedFarms.map((farm) => (
                  <div key={farm.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{farm.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{farm.farmer}</span>
                        <span>•</span>
                        <span>{farm.crops} crops</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="text-sm font-medium">{farm.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="portfolio" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="portfolio">
                  <Package className="h-4 w-4 mr-2" />
                  Portfolio
                </TabsTrigger>
                <TabsTrigger value="bids">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Active Bids
                </TabsTrigger>
                <TabsTrigger value="farmers">
                  <Users className="h-4 w-4 mr-2" />
                  Farmers
                </TabsTrigger>
              </TabsList>

              {/* Portfolio Tab */}
              <TabsContent value="portfolio" className="space-y-4">
                {portfolio.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{item.crop}</h3>
                        <p className="text-muted-foreground">Farmer: {item.farmer}</p>
                      </div>
                      <Badge
                        variant={
                          item.status === "completed"
                            ? "default"
                            : item.status === "harvesting"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Invested</div>
                        <div className="text-lg font-bold">${item.invested.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Current Value</div>
                        <div className="text-lg font-bold text-success">${item.currentValue.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">ROI</div>
                        <div className="text-lg font-bold text-primary">+{item.roi}%</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Farmer
                      </Button>
                      <Button size="sm" className="flex-1">View Details</Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              {/* Active Bids Tab */}
              <TabsContent value="bids" className="space-y-4">
                {activeBids.map((bid) => (
                  <Card key={bid.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{bid.crop}</h3>
                        <p className="text-muted-foreground">Farmer: {bid.farmer}</p>
                      </div>
                      <Badge variant={bid.status === "winning" ? "default" : "destructive"}>
                        {bid.status === "winning" ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {bid.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Your Bid</div>
                        <div className="text-2xl font-bold">${bid.myBid}</div>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Current Bid</div>
                        <div className="text-2xl font-bold text-primary">${bid.currentBid}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4 text-sm">
                      <div className="flex items-center gap-2 text-warning">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Ends in {bid.timeLeft}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Withdraw Bid
                      </Button>
                      <Button size="sm" className="flex-1">Increase Bid</Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              {/* Farmers Tab */}
              <TabsContent value="farmers" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Farmer Connections</h3>
                  <p className="text-muted-foreground mb-4">
                    Build relationships with trusted farmers for better deals and priority access to quality crops.
                  </p>
                  <div className="space-y-3">
                    {savedFarms.map((farm) => (
                      <div key={farm.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-primary">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {farm.farmer[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{farm.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>By {farm.farmer}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-warning text-warning" />
                                <span>{farm.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button size="sm">View Farm</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;
