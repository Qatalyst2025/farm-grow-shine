import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, PiggyBank, Target, Users, BarChart3 } from "lucide-react";

interface Cooperative {
  name: string;
  members: number;
  totalRevenue: number;
  sharedLoans: number;
}

interface FinancialToolsProps {
  cooperative: Cooperative;
}

export const FinancialTools = ({ cooperative }: FinancialToolsProps) => {
  const revenueDistribution = [
    { member: "Kwame M.", contribution: 4500, percentage: 28 },
    { member: "Ama B.", contribution: 3800, percentage: 23 },
    { member: "Joseph O.", contribution: 3200, percentage: 20 },
    { member: "Akosua F.", contribution: 2900, percentage: 18 },
    { member: "Others", contribution: 1800, percentage: 11 }
  ];

  const sharedExpenses = [
    { category: "Equipment Maintenance", amount: 1200, percentage: 35 },
    { category: "Storage Facility", amount: 800, percentage: 24 },
    { category: "Administrative Costs", amount: 600, percentage: 18 },
    { category: "Training & Development", amount: 500, percentage: 15 },
    { category: "Insurance", amount: 300, percentage: 8 }
  ];

  const savingsGoals = [
    {
      id: 1,
      name: "Emergency Fund",
      target: 10000,
      current: 7500,
      deadline: "2025-12-31",
      priority: "high"
    },
    {
      id: 2,
      name: "Equipment Upgrade Fund",
      target: 15000,
      current: 5200,
      deadline: "2026-06-30",
      priority: "medium"
    },
    {
      id: 3,
      name: "Expansion Fund",
      target: 20000,
      current: 2800,
      deadline: "2026-12-31",
      priority: "low"
    }
  ];

  const investments = [
    {
      id: 1,
      name: "Bulk Fertilizer Purchase",
      invested: 3000,
      expectedReturn: 3600,
      roi: 20,
      status: "active",
      maturity: "2025-11-30"
    },
    {
      id: 2,
      name: "Shared Irrigation System",
      invested: 5000,
      expectedReturn: 6500,
      roi: 30,
      status: "active",
      maturity: "2026-02-28"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Revenue Distribution */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 text-card-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Revenue Distribution
        </h3>
        <div className="space-y-4">
          {revenueDistribution.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-card-foreground">{item.member}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-primary">${item.contribution.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground ml-2">({item.percentage}%)</span>
                </div>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Cooperative Revenue</p>
              <p className="text-3xl font-bold text-primary">${cooperative.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Average per Member</p>
              <p className="text-xl font-bold text-secondary">
                ${Math.round(cooperative.totalRevenue / cooperative.members).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Shared Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-card-foreground">Shared Expenses</h3>
          <div className="space-y-3">
            {sharedExpenses.map((expense, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground mb-1">{expense.category}</p>
                  <Progress value={expense.percentage} className="h-1.5" />
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-card-foreground">${expense.amount}</p>
                  <p className="text-xs text-muted-foreground">{expense.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            <DollarSign className="h-4 w-4 mr-2" />
            View Detailed Breakdown
          </Button>
        </Card>

        {/* Savings Calculator */}
        <Card className="p-6 bg-gradient-to-br from-success/5 to-primary/5">
          <h3 className="text-lg font-bold mb-4 text-card-foreground">Savings Calculator</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <span className="text-sm text-muted-foreground">Monthly Target</span>
              <span className="text-lg font-bold text-success">$2,500</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <span className="text-sm text-muted-foreground">Per Member</span>
              <span className="text-lg font-bold text-primary">
                ${Math.round(2500 / cooperative.members)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <span className="text-sm text-muted-foreground">Annual Projection</span>
              <span className="text-lg font-bold text-secondary">$30,000</span>
            </div>
          </div>
          <Button className="w-full mt-4">
            <PiggyBank className="h-4 w-4 mr-2" />
            Update Savings Plan
          </Button>
        </Card>
      </div>

      {/* Collective Savings Goals */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 text-card-foreground flex items-center gap-2">
          <Target className="h-5 w-5" />
          Collective Savings Goals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {savingsGoals.map((goal) => (
            <div key={goal.id} className="p-4 border border-border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-card-foreground">{goal.name}</h4>
                <Badge 
                  variant={
                    goal.priority === "high" ? "default" : 
                    goal.priority === "medium" ? "secondary" : 
                    "outline"
                  }
                  className="text-xs"
                >
                  {goal.priority}
                </Badge>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                  </span>
                </div>
                <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((goal.current / goal.target) * 100)}% complete
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Target: {new Date(goal.deadline).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Group Investment Opportunities */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 text-card-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Group Investment Opportunities
        </h3>
        <div className="space-y-4">
          {investments.map((investment) => (
            <div key={investment.id} className="p-4 border border-border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-card-foreground mb-1">{investment.name}</h4>
                  <Badge variant="outline" className="border-success text-success">
                    {investment.roi}% ROI
                  </Badge>
                </div>
                <Badge variant={investment.status === "active" ? "default" : "secondary"}>
                  {investment.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Invested</p>
                  <p className="font-bold text-card-foreground">${investment.invested.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Expected Return</p>
                  <p className="font-bold text-success">${investment.expectedReturn.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Maturity</p>
                  <p className="font-medium text-card-foreground">
                    {new Date(investment.maturity).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4">
          Explore More Opportunities
        </Button>
      </Card>
    </div>
  );
};
