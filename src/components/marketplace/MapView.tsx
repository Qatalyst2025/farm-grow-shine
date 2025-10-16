import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Sprout, Wheat, Apple, LeafyGreen } from "lucide-react";
import { useState } from "react";

interface FarmLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  cropType: "maize" | "cassava" | "tomatoes" | "vegetables";
  farmerName: string;
  rating: number;
}

const cropIcons = {
  maize: Wheat,
  cassava: Sprout,
  tomatoes: Apple,
  vegetables: LeafyGreen,
};

const cropColors = {
  maize: "bg-warning/20 text-warning border-warning",
  cassava: "bg-success/20 text-success border-success",
  tomatoes: "bg-destructive/20 text-destructive border-destructive",
  vegetables: "bg-primary/20 text-primary border-primary",
};

export const MapView = () => {
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);

  // Mock farm locations
  const farms: FarmLocation[] = [
    { id: "1", name: "Sunshine Farm", lat: 6.5, lng: -1.5, cropType: "maize", farmerName: "Kwame", rating: 4.8 },
    { id: "2", name: "Green Valley", lat: 6.3, lng: -1.3, cropType: "cassava", farmerName: "Ama", rating: 4.9 },
    { id: "3", name: "Fresh Harvest", lat: 6.4, lng: -1.6, cropType: "tomatoes", farmerName: "Kofi", rating: 4.7 },
    { id: "4", name: "Organic Hills", lat: 6.6, lng: -1.4, cropType: "vegetables", farmerName: "Akua", rating: 5.0 },
  ];

  return (
    <Card className="relative h-full overflow-hidden bg-muted/30">
      {/* Map Placeholder - Replace with Mapbox */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-success/5 to-secondary/5">
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-card/80 backdrop-blur-sm rounded-lg border-2 border-dashed border-border">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Interactive Map Coming Soon</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect Mapbox API for live farm locations
            </p>
            <Button variant="outline" size="sm">
              Configure Map API
            </Button>
          </div>
        </div>

        {/* Simulated Farm Pins */}
        {farms.map((farm, index) => {
          const Icon = cropIcons[farm.cropType];
          const positionStyle = {
            top: `${20 + index * 20}%`,
            left: `${15 + index * 18}%`,
          };

          return (
            <div
              key={farm.id}
              className="absolute cursor-pointer group"
              style={positionStyle}
              onClick={() => setSelectedFarm(farm.id)}
            >
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-lg transition-all hover:scale-110 ${
                  selectedFarm === farm.id ? "scale-125 ring-4 ring-primary/30" : ""
                } ${cropColors[farm.cropType]}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Farm Info Popup */}
              {selectedFarm === farm.id && (
                <Card className="absolute top-12 left-0 p-4 w-64 shadow-xl z-10 animate-scale-in">
                  <h4 className="font-bold text-card-foreground mb-1">{farm.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">By {farm.farmerName}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-warning">★</span>
                      <span className="text-sm font-medium">{farm.rating}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      View Crops
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          );
        })}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button size="icon" variant="secondary" className="shadow-lg">
          +
        </Button>
        <Button size="icon" variant="secondary" className="shadow-lg">
          -
        </Button>
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 p-4 shadow-lg">
        <h4 className="font-semibold mb-3 text-sm">Crop Types</h4>
        <div className="space-y-2">
          {Object.entries(cropIcons).map(([type, Icon]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${cropColors[type as keyof typeof cropColors]}`}>
                <Icon className="h-3 w-3" />
              </div>
              <span className="text-xs capitalize">{type}</span>
            </div>
          ))}
        </div>
      </Card>
    </Card>
  );
};
