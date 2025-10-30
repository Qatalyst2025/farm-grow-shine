import { useEffect, useState } from "react";
import { CropPortfolioCard } from "./CropPortfolioCard";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export const CropPortfolioList = () => {
  const { token } = useAuth();
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchCrops = async () => {
      try {
        const res = await fetch("http://localhost:3000/crops", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setCrops(data);
      } catch (error) {
        console.error("Failed to fetch crops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  if (!crops.length) {
    return (
      <p className="text-center text-muted-foreground py-10">
        You haven’t added any crops yet.
      </p>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {crops.map(crop => (
        <CropPortfolioCard key={crop.id} crop={crop} />
      ))}
    </div>
  );
};
