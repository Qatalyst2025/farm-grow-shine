import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Award, Star, Shield } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface ExpertBadgeProps {
  verificationLevel: string;
  expertiseAreas?: string[];
  averageRating?: number;
  totalResponses?: number;
  yearsExperience?: number;
}

export default function ExpertBadge({
  verificationLevel,
  expertiseAreas = [],
  averageRating = 0,
  totalResponses = 0,
  yearsExperience = 0,
}: ExpertBadgeProps) {
  const getBadgeConfig = () => {
    switch (verificationLevel) {
      case "government_agent":
        return {
          icon: <Shield className="h-3 w-3" />,
          label: "Government Agent",
          color: "bg-blue-600 text-white",
        };
      case "certified_agronomist":
        return {
          icon: <Award className="h-3 w-3" />,
          label: "Certified Agronomist",
          color: "bg-purple-600 text-white",
        };
      case "master_farmer":
        return {
          icon: <Star className="h-3 w-3" />,
          label: "Master Farmer",
          color: "bg-amber-600 text-white",
        };
      default:
        return {
          icon: <CheckCircle2 className="h-3 w-3" />,
          label: "Verified Expert",
          color: "bg-green-600 text-white",
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Badge className={`${config.color} cursor-pointer text-xs`}>
          {config.icon}
          <span className="ml-1">{config.label}</span>
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-1">{config.label}</h4>
            <p className="text-xs text-muted-foreground">
              Verified agricultural expert
            </p>
          </div>

          {expertiseAreas.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">Expertise:</p>
              <div className="flex flex-wrap gap-1">
                {expertiseAreas.map((area) => (
                  <Badge key={area} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            <div className="text-center">
              <p className="text-lg font-bold">{averageRating.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{totalResponses}</p>
              <p className="text-xs text-muted-foreground">Responses</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{yearsExperience}</p>
              <p className="text-xs text-muted-foreground">Years Exp</p>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
