import { useState, useEffect } from "react";
import { Users, MessageSquare, Sprout, Shield, AlertCircle, Rocket, Trophy, Sparkles, Globe, BookOpen, Heart, Bell, Briefcase } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChatRoomList from "@/components/community/ChatRoomList";
import ChatRoom from "@/components/community/ChatRoom";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { CreateAlertDialog } from "@/components/alerts/CreateAlertDialog";
import { AlertsFeed } from "@/components/alerts/AlertsFeed";
import LearningChallenges from "@/components/community/LearningChallenges";
import YouthSuccessStories from "@/components/community/YouthSuccessStories";
import CareerPathways from "@/components/community/CareerPathways";
import StartupFunding from "@/components/community/StartupFunding";
import { InternationalExportHub } from "@/components/community/InternationalExportHub";
import { MobileHeader } from "@/components/mobile/MobileHeader";

export default function Community() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("regional");
  const [isAuthority, setIsAuthority] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    checkUserRole();
    const tab = searchParams.get("tab");
    if (tab === "alerts") {
      setActiveTab("alerts");
    }
  }, [searchParams]);

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "authority"]);

    setIsAuthority((roles?.length || 0) > 0);
  };

  return (
    <div className="min-h-screen bg-muted">
      <MobileHeader />
      <div className="container mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
                Village Square
              </h1>
              <p className="text-muted-foreground">
                Share wisdom, grow together 
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-primary border-secondary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <Users className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">12,450</p>
                <p className="text-xs text-secondary">Active Farmers</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-primary border-secondary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">847</p>
                <p className="text-xs text-secondary">Messages Today</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-primary border-secondary-light/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <Sprout className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">234</p>
                <p className="text-xs text-secondary">Wisdom Shared</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-primary border-secondary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">3</p>
                <p className="text-xs text-secondary">Active Alerts</p>
              </div>
            </div>
          </Card>
        </div>




        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Room List Sidebar */}
          <div className="lg:col-span-12">
            <Card className="overflow-hidden bg-primary border-primary/10">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b bg-muted/30 p-2">
                  <TabsList className="w-full grid grid-cols-3 lg:grid-cols-7 h-auto p-1 gap-1">
                    <TabsTrigger value="regional" className="text-xs data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      Regional
                    </TabsTrigger>
                    <TabsTrigger value="crops" className="text-xs data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground">
                      <Sprout className="h-3 w-3 mr-1" />
                      Crops
                    </TabsTrigger>
                    <TabsTrigger value="learning" className="text-xs data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Learning
                    </TabsTrigger>
                    <TabsTrigger value="youth" className="text-xs data-[state=active]:bg-secondary data-[state=active]:from-orange-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">
                      <Rocket className="h-3 w-3 mr-1" />
                      Youth
                    </TabsTrigger>
                    <TabsTrigger value="careers" className="text-xs data-[state=active]:bg-secondary data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                      <Trophy className="h-3 w-3 mr-1" />
                      Careers
                    </TabsTrigger>
                    <TabsTrigger value="export" className="text-xs data-[state=active]:bg-secondary data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                      <Globe className="h-3 w-3 mr-1" />
                      Export
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="text-xs data-[state=active]:bg-secondary data-[state=active]:text-destructive-foreground">
                      <Bell className="h-3 w-3 mr-1" />
                      Alerts
                    </TabsTrigger>
                  </TabsList>
                  {isAuthority && activeTab === "alerts" && (
                    <div className="mt-2">
                      <CreateAlertDialog />
                    </div>
                  )}
                </div>

                <TabsContent value="regional" className="mt-0">
                  <ChatRoomList 
                    roomType="regional" 
                    selectedRoom={selectedRoom}
                    onSelectRoom={setSelectedRoom}
                  />
                </TabsContent>
                <TabsContent value="crops" className="mt-0">
                  <ChatRoomList 
                    roomType="crop_specific" 
                    selectedRoom={selectedRoom}
                    onSelectRoom={setSelectedRoom}
                  />
                </TabsContent>
                <TabsContent value="learning" className="mt-0">
                  <ChatRoomList 
                    roomType="learning" 
                    selectedRoom={selectedRoom}
                    onSelectRoom={setSelectedRoom}
                  />
                </TabsContent>
                <TabsContent value="youth" className="mt-0 p-4 space-y-4">
                  <LearningChallenges />
                  <YouthSuccessStories />
                  <StartupFunding />
                </TabsContent>
                <TabsContent value="careers" className="mt-0 p-4">
                  <CareerPathways />
                </TabsContent>
                <TabsContent value="export" className="mt-0 p-4">
                  <InternationalExportHub />
                </TabsContent>
                <TabsContent value="alerts" className="mt-0 p-4">
                  <AlertsFeed />
                </TabsContent>
              </Tabs>
            </Card>
          </div>






          
          <div className="lg:col-span-12">
            {selectedRoom && !['alerts', 'youth', 'careers', 'export'].includes(activeTab) ? (
              <ChatRoom roomId={selectedRoom} />
            ) : !selectedRoom && !['alerts', 'youth', 'careers', 'export'].includes(activeTab) ? (
              <Card className="h-[600px] flex items-center justify-center bg-gradient-to-br from-card to-primary/5 border-dashed">
                <div className="text-center space-y-3">
                  <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <MessageSquare className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-lg font-medium">Welcome to the Village Square!</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Select a community room to start sharing wisdom and connecting with fellow farmers
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    <Shield className="h-3 w-3 mr-1" />
                    Safe & Respectful Space
                  </Badge>
                </div>
              </Card>
            ) : null}

          </div>
        



            </div>
          </div>
    
    </div>
  );
}
