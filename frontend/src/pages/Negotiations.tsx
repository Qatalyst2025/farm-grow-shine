import { useState } from "react";
import { Handshake, FileText, Truck, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NegotiationRoomList from "@/components/negotiations/NegotiationRoomList";
import NegotiationRoom from "@/components/negotiations/NegotiationRoom";
import CreateNegotiationDialog from "@/components/negotiations/CreateNegotiationDialog";

export default function Negotiations() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("farmer_buyer");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5">
      <div className="container mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <Handshake className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary-light to-secondary bg-clip-text text-transparent">
                  Deal Negotiations
                </h1>
                <p className="text-muted-foreground">
                  Secure, transparent, blockchain-backed agreements
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Negotiation
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Handshake className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Active Deals</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-secondary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">$45,230</p>
                <p className="text-xs text-muted-foreground">In Negotiation</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-card border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">Deals Closed</p>
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
                    <TabsTrigger value="farmer_buyer" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Handshake className="h-3 w-3 mr-1" />
                      Crop Sales
                    </TabsTrigger>
                    <TabsTrigger value="loan_application" className="text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                      <FileText className="h-3 w-3 mr-1" />
                      Loans
                    </TabsTrigger>
                    <TabsTrigger value="supply_chain" className="text-xs data-[state=active]:bg-primary-light data-[state=active]:text-primary-foreground">
                      <Truck className="h-3 w-3 mr-1" />
                      Logistics
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="farmer_buyer" className="mt-0">
                  <NegotiationRoomList 
                    roomType="farmer_buyer" 
                    selectedRoom={selectedRoom}
                    onSelectRoom={setSelectedRoom}
                  />
                </TabsContent>
                <TabsContent value="loan_application" className="mt-0">
                  <NegotiationRoomList 
                    roomType="loan_application" 
                    selectedRoom={selectedRoom}
                    onSelectRoom={setSelectedRoom}
                  />
                </TabsContent>
                <TabsContent value="supply_chain" className="mt-0">
                  <NegotiationRoomList 
                    roomType="supply_chain" 
                    selectedRoom={selectedRoom}
                    onSelectRoom={setSelectedRoom}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Negotiation Area */}
          <div className="lg:col-span-8">
            {selectedRoom ? (
              <NegotiationRoom roomId={selectedRoom} />
            ) : (
              <Card className="h-[600px] flex items-center justify-center bg-gradient-to-br from-card to-primary/5 border-dashed">
                <div className="text-center space-y-3">
                  <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Handshake className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-lg font-medium">Start a New Deal</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Select an existing negotiation or create a new one to begin structured, secure deal-making
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)} className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Negotiation
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        <CreateNegotiationDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreated={(roomId) => {
            setSelectedRoom(roomId);
            setShowCreateDialog(false);
          }}
        />
      </div>
    </div>
  );
}
