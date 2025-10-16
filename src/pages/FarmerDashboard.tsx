import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Sprout, 
  TrendingUp, 
  DollarSign, 
  Package,
  AlertCircle,
  Camera,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

const FarmerDashboard = () => {
  // Mock data - in real app, fetch from API
  const farmerName = "Kwame";
  const currentSeason = "Planting Season";
  const financialScore = 78;
  const activeLoans = 1;
  const growingCrops = 3;
  const recentSales = 2;

  const actionCards = [
    {
      id: 1,
      title: "Continue Your Loan Application",
      description: "You're 2 steps away from getting funded!",
      icon: Clock,
      color: "warning",
      link: "/farmer/apply-loan",
      priority: 1
    },
    {
      id: 2,
      title: "Update Your Crop Progress",
      description: "Add photos to increase your financial score by 5 points",
      icon: Camera,
      color: "primary",
      link: "/farmer/crops",
      priority: 2
    },
    {
      id: 3,
      title: "New Offer Available!",
      description: "A buyer is interested in your maize harvest",
      icon: Package,
      color: "success",
      link: "/farmer/marketplace",
      priority: 1
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Welcome back, {farmerName}! 👋</h1>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <Sprout className="h-4 w-4" />
                <span>Current Season: {currentSeason}</span>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-primary-foreground hover:bg-white/20">
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-6 border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Active Loans</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-card-foreground">{activeLoans}</div>
          </Card>

          <Card className="p-6 border-l-4 border-l-success hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Growing Crops</span>
              <Sprout className="h-5 w-5 text-success" />
            </div>
            <div className="text-3xl font-bold text-card-foreground">{growingCrops}</div>
          </Card>

          <Card className="p-6 border-l-4 border-l-secondary hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Recent Sales</span>
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <div className="text-3xl font-bold text-card-foreground">{recentSales}</div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
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
              <div className="space-y-4">
                {crops.map((crop) => (
                  <Card key={crop.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-card-foreground mb-1">{crop.name}</h3>
                        <p className="text-muted-foreground">{crop.stage}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{crop.value}</div>
                        <span className="text-sm text-muted-foreground">Current Value</span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Growth Progress</span>
                        <span className="font-medium text-foreground">{crop.progress}%</span>
                      </div>
                      <Progress value={crop.progress} className="h-2" />
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span>{crop.nextMilestone}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
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
      </div>
    </div>
  );
};

export default FarmerDashboard;
