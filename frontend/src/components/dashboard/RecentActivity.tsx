import { Card } from "@/components/ui/card";
import { Sprout, DollarSign, Package, Bell, Clock } from "lucide-react";

type ActivityType = "loan" | "crop" | "sale" | "notification";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  status?: "success" | "pending" | "info";
}

const activityIcons: Record<ActivityType, any> = {
  loan: DollarSign,
  crop: Sprout,
  sale: Package,
  notification: Bell,
};

const activityColors: Record<ActivityType, string> = {
  loan: "text-primary bg-primary/10",
  crop: "text-success bg-success/10",
  sale: "text-secondary bg-secondary/10",
  notification: "text-info bg-info/10",
};

export const RecentActivity = () => {
  // Mock data - in real app, fetch from API
  const activities: Activity[] = [
    {
      id: "1",
      type: "loan",
      title: "Loan Application Submitted",
      description: "$500 for Maize planting - Under review",
      timestamp: "2 hours ago",
      status: "pending",
    },
    {
      id: "2",
      type: "crop",
      title: "Crop Progress Updated",
      description: "Tomatoes: Flowering stage photos added",
      timestamp: "1 day ago",
      status: "success",
    },
    {
      id: "3",
      type: "sale",
      title: "New Buyer Offer",
      description: "Offer received for your Cassava harvest",
      timestamp: "2 days ago",
      status: "info",
    },
    {
      id: "4",
      type: "notification",
      title: "Weather Alert",
      description: "Heavy rains expected this weekend",
      timestamp: "3 days ago",
      status: "info",
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Recent Activity</h2>
        <Clock className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type];
          const colorClasses = activityColors[activity.type];

          return (
            <div
              key={activity.id}
              className="flex gap-4 pb-4 border-b last:border-0 last:pb-0 transition-all hover:bg-muted/30 -mx-2 px-2 py-2 rounded-lg"
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-card-foreground mb-1">{activity.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                <span className="text-xs text-muted-foreground mt-1 inline-block">{activity.timestamp}</span>
              </div>
              {activity.status && (
                <div className="flex-shrink-0">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === "success"
                        ? "bg-success/10 text-success"
                        : activity.status === "pending"
                        ? "bg-warning/10 text-warning"
                        : "bg-info/10 text-info"
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
