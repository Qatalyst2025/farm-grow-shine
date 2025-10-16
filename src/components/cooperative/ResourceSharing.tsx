import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Wrench, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";

export const ResourceSharing = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const sharedResources = [
    {
      id: 1,
      name: "John Deere Tractor",
      owner: "Kwame M.",
      type: "Heavy Equipment",
      availability: "available",
      nextAvailable: "2025-10-20",
      bookingRate: "$50/day",
      utilizationRate: 85,
      condition: "excellent"
    },
    {
      id: 2,
      name: "Irrigation System",
      owner: "Cooperative Fund",
      type: "Equipment",
      availability: "booked",
      nextAvailable: "2025-10-25",
      bookingRate: "$30/day",
      utilizationRate: 95,
      condition: "good"
    },
    {
      id: 3,
      name: "Harvester",
      owner: "Joseph O.",
      type: "Heavy Equipment",
      availability: "available",
      nextAvailable: "Now",
      bookingRate: "$75/day",
      utilizationRate: 72,
      condition: "excellent"
    },
    {
      id: 4,
      name: "Storage Facility",
      owner: "Cooperative Fund",
      type: "Infrastructure",
      availability: "available",
      nextAvailable: "Now",
      bookingRate: "$20/month",
      utilizationRate: 68,
      condition: "good"
    }
  ];

  const upcomingBookings = [
    {
      id: 1,
      resource: "Tractor",
      member: "Ama B.",
      date: "2025-10-18",
      duration: "3 days",
      purpose: "Land preparation"
    },
    {
      id: 2,
      resource: "Irrigation System",
      member: "Akosua F.",
      date: "2025-10-20",
      duration: "1 week",
      purpose: "Vegetable irrigation"
    },
    {
      id: 3,
      resource: "Harvester",
      member: "Kwame M.",
      date: "2025-10-22",
      duration: "2 days",
      purpose: "Maize harvest"
    }
  ];

  const getAvailabilityColor = (status: string) => {
    switch(status) {
      case "available": return "success";
      case "booked": return "warning";
      case "maintenance": return "destructive";
      default: return "muted";
    }
  };

  const getAvailabilityIcon = (status: string) => {
    switch(status) {
      case "available": return <CheckCircle2 className="h-4 w-4" />;
      case "booked": return <Clock className="h-4 w-4" />;
      case "maintenance": return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">Resource Sharing</h2>
          <p className="text-muted-foreground">
            Book and manage shared equipment and facilities
          </p>
        </div>
        <Button>
          <Wrench className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* Available Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sharedResources.map((resource) => (
          <Card key={resource.id} className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-card-foreground mb-1">{resource.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{resource.type}</Badge>
                  <Badge 
                    variant="outline"
                    className={`border-${getAvailabilityColor(resource.availability)} text-${getAvailabilityColor(resource.availability)}`}
                  >
                    {getAvailabilityIcon(resource.availability)}
                    <span className="ml-1 capitalize">{resource.availability}</span>
                  </Badge>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Owner:</span>
                <span className="font-medium">{resource.owner}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rate:</span>
                <span className="font-medium text-primary">{resource.bookingRate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next Available:</span>
                <span className="font-medium">{resource.nextAvailable}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Utilization:</span>
                <span className="font-medium">{resource.utilizationRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Condition:</span>
                <Badge variant="outline" className="border-success text-success text-xs capitalize">
                  {resource.condition}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              {resource.availability === "available" ? (
                <Button className="flex-1">Book Now</Button>
              ) : (
                <Button variant="outline" className="flex-1">View Schedule</Button>
              )}
              <Button variant="outline">Details</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Upcoming Bookings */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 text-card-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Bookings
        </h3>
        <div className="space-y-3">
          {upcomingBookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">{booking.resource}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.member} • {booking.purpose}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-card-foreground">
                  {new Date(booking.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">{booking.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Labor Exchange */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <h3 className="text-lg font-bold mb-4 text-card-foreground">Labor Exchange Marketplace</h3>
        <p className="text-muted-foreground mb-4">
          Exchange labor services with cooperative members to reduce costs
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-background rounded-lg">
            <p className="text-2xl font-bold text-primary">48</p>
            <p className="text-sm text-muted-foreground">Hours Available</p>
          </div>
          <div className="text-center p-4 bg-background rounded-lg">
            <p className="text-2xl font-bold text-success">12</p>
            <p className="text-sm text-muted-foreground">Active Exchanges</p>
          </div>
          <div className="text-center p-4 bg-background rounded-lg">
            <p className="text-2xl font-bold text-secondary">$850</p>
            <p className="text-sm text-muted-foreground">Value Saved</p>
          </div>
        </div>
        <Button className="w-full mt-4">View Labor Exchange</Button>
      </Card>

      {/* Bulk Purchasing */}
      <Card className="p-6 bg-info/5 border-info/20">
        <h3 className="text-lg font-bold mb-2 text-card-foreground">Bulk Purchasing Coordinator</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Coordinate group purchases to get better prices on seeds, fertilizer, and equipment
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">Active Orders</Button>
          <Button className="flex-1">Start New Order</Button>
        </div>
      </Card>
    </div>
  );
};
