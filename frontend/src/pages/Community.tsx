import { useState } from "react";
import { Users, MessageSquare, Sprout, Shield, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChatRoomList from "@/components/community/ChatRoomList";
import ChatRoom from "@/components/community/ChatRoom";

export default function Community() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("regional");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5">
      <div className="container mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary-light to-secondary bg-clip-text text-transparent">
                Village Square
              </h1>
              <p className="text-muted-foreground">
                Share wisdom, grow together 🌳
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">12,450</p>
                <p className="text-xs text-muted-foreground">Active Farmers</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-secondary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">847</p>
                <p className="text-xs text-muted-foreground">Messages Today</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-primary-light/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary-light/10 flex items-center justify-center">
                <Sprout className="h-5 w-5 text-primary-light" />
              </div>
              <div>
                <p className="text-2xl font-bold">234</p>
                <p className="text-xs text-muted-foreground">Wisdom Shared</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-destructive/10 to-card border-destructive/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center animate-pulse">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Room List Sidebar */}
          <div className="lg:col-span-4">
            <Card className="overflow-hidden bg-gradient-to-br from-card to-card/80 border-primary/10">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b bg-muted/30">
                  <TabsList className="w-full grid grid-cols-3 h-auto p-1">
                    <TabsTrigger value="regional" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      Regional
                    </TabsTrigger>
                    <TabsTrigger value="crops" className="text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                      <Sprout className="h-3 w-3 mr-1" />
                      Crops
                    </TabsTrigger>
                    <TabsTrigger value="emergency" className="text-xs data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Alerts
                    </TabsTrigger>
                  </TabsList>
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
                <TabsContent value="emergency" className="mt-0">
                  <ChatRoomList 
                    roomType="emergency" 
                    selectedRoom={selectedRoom}
                    onSelectRoom={setSelectedRoom}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-8">
            {selectedRoom ? (
              <ChatRoom roomId={selectedRoom} />
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
