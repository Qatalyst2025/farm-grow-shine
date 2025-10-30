import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Eye, Camera, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { CropPortfolioList } from "./CropPortfolioList";

interface CropPortfolioCardProps {
  crop: {
    id: string;
    name: string;
    stage?: string;
    progress?: number;
    health?: string;
    type?: string;
    expectedHarvestDate?: string | null;
  };
}

export const CropPortfolioCard = ({ crop }: CropPortfolioCardProps) => {
  const progress = crop.progress ?? 0;
  const stage = crop.stage ?? "Not updated yet";
  const health = crop.health ?? "Awaiting chain sync";

  return (
    <Card className="p-6 hover:shadow-lg transition-all hover:scale-[1.02] group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-card-foreground mb-1 group-hover:text-primary transition-colors">
            {crop.name}
          </h3>
          <p className="text-muted-foreground capitalize">{stage}</p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {progress}%
          </div>
          <span className="text-sm text-muted-foreground">Growth Status</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <AlertCircle className="h-4 w-4" />
        <span>{health}</span>
      </div>

      <div className="flex gap-2">
        <Link to={`/farmer/crops/${crop.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full group/btn">
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
        </Link>

        <Button variant="outline" size="sm" className="flex-1 group/btn">
          <Camera className="h-4 w-4 mr-1" />
          Update
        </Button>

        <Button size="sm" className="flex-1 group/btn">
          <ShoppingCart className="h-4 w-4 mr-1" />
          Sell
        </Button>
      </div>
    </Card>
  );
};

