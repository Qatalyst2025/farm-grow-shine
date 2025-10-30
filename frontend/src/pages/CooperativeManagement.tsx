import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Package,
  MessageCircle,
  Calendar,
  Settings,
  Award
} from "lucide-react";
import { MemberDirectory } from "@/components/cooperative/MemberDirectory";
import { GroupLoanManagement } from "@/components/cooperative/GroupLoanManagement";
import { ResourceSharing } from "@/components/cooperative/ResourceSharing";
import { CollaborationTools } from "@/components/cooperative/CollaborationTools";
import { FinancialTools } from "@/components/cooperative/FinancialTools";

const CooperativeManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock cooperative data
  const cooperative = {
    name: "Ashanti Valley Farmers Cooperative",
    members: 24,
    established: "2023-05-15",
    totalRevenue: 45600,
    sharedLoans: 12500,
    collectivePower: 85,
    activeCrops: 8
  };

  const quickStats = [
    {
      label: "Total Members",
      value: cooperative.members,
      icon: Users,
      color: "primary",
      change: "+3 this month"
    },
    {
      label: "Collective Revenue",
      value: `$${cooperative.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "success",
      change: "+15% vs last month"
    },
    {
      label: "Active Group Loans",
      value: `$${cooperative.sharedLoans.toLocaleString()}`,
      icon: TrendingUp,
      color: "warning",
      change: "2 pending applications"
    },
    {
      label: "Shared Resources",
      value: "12 items",
      icon: Package,
      color: "secondary",
      change: "95% utilization"
    }
  ];

  return (
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
                <h1 className="text-3xl font-bold mb-1">{cooperative.name}</h1>
                <p className="text-primary-foreground/90">
                  {cooperative.members} members • Established {new Date(cooperative.established).getFullYear()}
                </p>
              </div>
            </div>
            <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-primary-foreground hover:bg-white/20">
              <Settings className="h-4 w-4 mr-2" />
              Manage Cooperative
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className={`p-6 border-l-4 border-l-${stat.color}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-full bg-${stat.color}/10 flex items-center justify-center`}>
                    <IconComponent className={`h-6 w-6 text-${stat.color}`} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </Card>
            );
          })}
        </div>

        {/* Collective Bargaining Power */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-success/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-card-foreground">Collective Bargaining Power</h3>
              <p className="text-sm text-muted-foreground">
                Your group's negotiation strength in the marketplace
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">{cooperative.collectivePower}%</div>
              <Award className="h-6 w-6 text-warning mx-auto" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-background rounded-lg">
              <p className="text-2xl font-bold text-success">{cooperative.activeCrops}</p>
              <p className="text-sm text-muted-foreground">Crop Diversity</p>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <p className="text-2xl font-bold text-primary">{cooperative.members}</p>
              <p className="text-sm text-muted-foreground">Active Members</p>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <p className="text-2xl font-bold text-secondary">4.8/5</p>
              <p className="text-sm text-muted-foreground">Buyer Rating</p>
            </div>
          </div>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="loans">
              <DollarSign className="h-4 w-4 mr-2" />
              Loans
            </TabsTrigger>
            <TabsTrigger value="resources">
              <Package className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="collaborate">
              <MessageCircle className="h-4 w-4 mr-2" />
              Collaborate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <FinancialTools cooperative={cooperative} />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <MemberDirectory />
          </TabsContent>

          <TabsContent value="loans" className="mt-6">
            <GroupLoanManagement />
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <ResourceSharing />
          </TabsContent>

          <TabsContent value="collaborate" className="mt-6">
            <CollaborationTools />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CooperativeManagement;
