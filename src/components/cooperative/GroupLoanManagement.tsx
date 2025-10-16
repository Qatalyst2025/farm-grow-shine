import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

export const GroupLoanManagement = () => {
  const groupLoans = [
    {
      id: 1,
      name: "Maize Season Expansion",
      amount: 5000,
      purpose: "Purchase seeds and fertilizer for 10 hectares",
      members: 12,
      contributions: 4200,
      status: "active",
      startDate: "2025-09-01",
      dueDate: "2026-01-15",
      repaymentProgress: 84
    },
    {
      id: 2,
      name: "Irrigation System",
      amount: 7500,
      purpose: "Install shared drip irrigation for 5 farms",
      members: 8,
      contributions: 7500,
      status: "pending",
      startDate: "2025-10-15",
      dueDate: "2026-03-01",
      repaymentProgress: 0
    },
    {
      id: 3,
      name: "Storage Facility",
      amount: 3000,
      purpose: "Build collective grain storage",
      members: 15,
      contributions: 2850,
      status: "active",
      startDate: "2025-08-01",
      dueDate: "2025-12-31",
      repaymentProgress: 95
    }
  ];

  const memberContributions = [
    { name: "Kwame M.", amount: 450, percentage: 90, status: "on-time" },
    { name: "Ama B.", amount: 500, percentage: 100, status: "on-time" },
    { name: "Joseph O.", amount: 400, percentage: 80, status: "attention" },
    { name: "Akosua F.", amount: 475, percentage: 95, status: "on-time" }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "active": return "success";
      case "pending": return "warning";
      case "completed": return "primary";
      default: return "muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "active": return <TrendingUp className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "completed": return <CheckCircle2 className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">Group Loan Management</h2>
          <p className="text-muted-foreground">
            Manage collective loans and track member contributions
          </p>
        </div>
        <Button>
          <DollarSign className="h-4 w-4 mr-2" />
          Apply for Group Loan
        </Button>
      </div>

      {/* Active Loans */}
      <div className="space-y-4">
        {groupLoans.map((loan) => (
          <Card key={loan.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-card-foreground">{loan.name}</h3>
                  <Badge 
                    variant="outline" 
                    className={`border-${getStatusColor(loan.status)} text-${getStatusColor(loan.status)}`}
                  >
                    {getStatusIcon(loan.status)}
                    <span className="ml-1 capitalize">{loan.status}</span>
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{loan.purpose}</p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{loan.members} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Due {new Date(loan.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">${loan.amount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Loan Amount</p>
              </div>
            </div>

            {/* Contribution Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Member Contributions</span>
                <span className="text-sm font-medium">
                  ${loan.contributions.toLocaleString()} / ${loan.amount.toLocaleString()}
                </span>
              </div>
              <Progress value={(loan.contributions / loan.amount) * 100} className="h-2 mb-1" />
              <p className="text-xs text-muted-foreground">
                {Math.round((loan.contributions / loan.amount) * 100)}% collected
              </p>
            </div>

            {/* Repayment Progress (for active loans) */}
            {loan.status === "active" && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Repayment Progress</span>
                  <span className="text-sm font-medium">{loan.repaymentProgress}%</span>
                </div>
                <Progress value={loan.repaymentProgress} className="h-2" />
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">View Details</Button>
              <Button variant="outline" className="flex-1">Member Breakdown</Button>
              {loan.status === "pending" && (
                <Button className="flex-1">Contribute</Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Member Contribution Tracking */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 text-card-foreground">Recent Member Contributions</h3>
        <div className="space-y-4">
          {memberContributions.map((contribution, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-semibold text-card-foreground">{contribution.name}</p>
                  {contribution.status === "on-time" ? (
                    <Badge variant="outline" className="border-success text-success text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      On Time
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-warning text-warning text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Needs Attention
                    </Badge>
                  )}
                </div>
                <Progress value={contribution.percentage} className="h-2" />
              </div>
              <div className="text-right ml-6">
                <p className="text-xl font-bold text-primary">${contribution.amount}</p>
                <p className="text-xs text-muted-foreground">{contribution.percentage}% paid</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Risk Assessment */}
      <Card className="p-6 bg-info/5 border-info/20">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-6 w-6 text-info" />
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-card-foreground">Group Risk Assessment</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Your cooperative has a <strong>Low Risk</strong> profile based on:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 95% average repayment rate across members</li>
              <li>• Diverse crop portfolio reducing seasonal risk</li>
              <li>• Strong collective bargaining power (85%)</li>
              <li>• Excellent group coordination and communication</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
