import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Wheat, 
  Sprout, 
  Apple, 
  LeafyGreen,
  Calendar,
  Star,
  Shield,
  MapPin,
  SlidersHorizontal,
  X
} from "lucide-react";
import { useState } from "react";

interface FilterSidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export const FilterSidebar = ({ onClose, isMobile = false }: FilterSidebarProps) => {
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [distanceRadius, setDistanceRadius] = useState([50]);

  const cropTypes = [
    { id: "maize", label: "Maize", icon: Wheat, color: "text-warning" },
    { id: "cassava", label: "Cassava", icon: Sprout, color: "text-success" },
    { id: "tomatoes", label: "Tomatoes", icon: Apple, color: "text-destructive" },
    { id: "vegetables", label: "Vegetables", icon: LeafyGreen, color: "text-primary" },
  ];

  const certifications = [
    { id: "organic", label: "Organic Certified", icon: Shield },
    { id: "verified", label: "Farm Verified", icon: Shield },
    { id: "community", label: "Community Approved", icon: Shield },
  ];

  return (
    <Card className={`p-6 ${isMobile ? "h-full overflow-y-auto" : "sticky top-4"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Filters</h2>
        </div>
        {isMobile && onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Crop Type Filter */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Crop Type</Label>
          <div className="space-y-3">
            {cropTypes.map((crop) => {
              const Icon = crop.icon;
              return (
                <div key={crop.id} className="flex items-center space-x-3">
                  <Checkbox id={crop.id} />
                  <label
                    htmlFor={crop.id}
                    className="flex items-center gap-2 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <Icon className={`h-4 w-4 ${crop.color}`} />
                    {crop.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality Rating */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Minimum Quality Rating</Label>
          <div className="space-y-2">
            {[5, 4, 3].map((rating) => (
              <div key={rating} className="flex items-center space-x-3">
                <Checkbox id={`rating-${rating}`} />
                <label
                  htmlFor={`rating-${rating}`}
                  className="flex items-center gap-1 cursor-pointer text-sm font-medium"
                >
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                  <span className="ml-1 text-muted-foreground">& up</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Certifications</Label>
          <div className="space-y-3">
            {certifications.map((cert) => {
              const Icon = cert.icon;
              return (
                <div key={cert.id} className="flex items-center space-x-3">
                  <Checkbox id={cert.id} />
                  <label
                    htmlFor={cert.id}
                    className="flex items-center gap-2 cursor-pointer text-sm font-medium"
                  >
                    <Icon className="h-4 w-4 text-success" />
                    {cert.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Price Range</Label>
          <div className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={2000}
              min={0}
              step={50}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">${priceRange[0]}</span>
              <span className="text-muted-foreground">to</span>
              <span className="font-medium">${priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Harvest Date */}
        <div>
          <Label className="text-base font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Harvest Date Range
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              Start Date
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              End Date
            </Button>
          </div>
        </div>

        {/* Distance Radius */}
        <div>
          <Label className="text-base font-semibold mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Distance Radius
          </Label>
          <div className="space-y-4">
            <Slider
              value={distanceRadius}
              onValueChange={setDistanceRadius}
              max={200}
              min={10}
              step={10}
              className="w-full"
            />
            <div className="text-center">
              <span className="font-medium text-primary">{distanceRadius[0]} km</span>
              <span className="text-sm text-muted-foreground ml-1">from your location</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t space-y-2">
          <Button className="w-full">Apply Filters</Button>
          <Button variant="outline" className="w-full">Reset All</Button>
        </div>
      </div>
    </Card>
  );
};
