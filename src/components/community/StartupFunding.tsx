import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Rocket, 
  Users, 
  TrendingUp,
  CheckCircle,
  Clock,
  MapPin,
  ArrowRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FundingOpportunity {
  id: string;
  title: string;
  provider: string;
  amount: string;
  type: 'grant' | 'loan' | 'investment' | 'competition';
  deadline: string;
  location: string;
  description: string;
  requirements: string[];
  successRate: number;
  applicants: number;
  color: string;
}

export default function StartupFunding() {
  const [opportunities] = useState<FundingOpportunity[]>([
    {
      id: '1',
      title: 'Youth Agri-Startup Grant',
      provider: 'African Development Bank',
      amount: '$5,000 - $20,000',
      type: 'grant',
      deadline: '30 days left',
      location: 'Pan-African',
      description: 'No-equity funding for innovative agricultural startups led by youth under 35',
      requirements: ['Age 18-35', 'Business plan', 'Innovation focus'],
      successRate: 35,
      applicants: 847,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: '2',
      title: 'Smart Farming Competition',
      provider: 'AgriTech Innovation Hub',
      amount: '$50,000 Prize',
      type: 'competition',
      deadline: '15 days left',
      location: 'Nigeria, Kenya, Ghana',
      description: 'Pitch your tech-enabled farming solution to win funding and mentorship',
      requirements: ['Working prototype', 'Tech solution', 'Team pitch'],
      successRate: 12,
      applicants: 234,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: '3',
      title: 'Microfinance Agri-Loan',
      provider: 'Community Development Fund',
      amount: '$500 - $5,000',
      type: 'loan',
      deadline: 'Rolling basis',
      location: 'Local communities',
      description: 'Low-interest loans for farm inputs, equipment, and working capital',
      requirements: ['6 months farming', 'Collateral/Group guarantee', 'Repayment plan'],
      successRate: 78,
      applicants: 1523,
      color: 'from-orange-500 to-rose-500',
    },
    {
      id: '4',
      title: 'Angel Investment Program',
      provider: 'Impact Investors Network',
      amount: '$10,000 - $100,000',
      type: 'investment',
      deadline: '45 days left',
      location: 'East Africa',
      description: 'Equity investment for scalable agricultural businesses with impact',
      requirements: ['Traction proof', 'Scaling plan', 'Impact metrics'],
      successRate: 8,
      applicants: 156,
      color: 'from-purple-500 to-pink-500',
    },
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'grant': return <CheckCircle className="h-4 w-4" />;
      case 'loan': return <DollarSign className="h-4 w-4" />;
      case 'investment': return <TrendingUp className="h-4 w-4" />;
      case 'competition': return <Rocket className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'grant': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'loan': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'investment': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'competition': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Startup Funding Opportunities
          </CardTitle>
          <CardDescription>
            Grants, loans, investments, and competitions to launch your agri-business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-emerald-600">$2.8M+</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-blue-600">2,760</p>
                <p className="text-xs text-muted-foreground">Applicants</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {opportunities.map((opp) => (
          <Card key={opp.id} className="overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${opp.color}`} />
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold text-sm">{opp.title}</h4>
                      <Badge variant="outline" className={getTypeBadgeColor(opp.type)}>
                        {getTypeIcon(opp.type)}
                        <span className="ml-1 capitalize">{opp.type}</span>
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      by {opp.provider}
                    </p>
                    <p className="text-sm leading-relaxed mb-3">
                      {opp.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y text-center">
                  <div>
                    <p className="text-sm font-bold text-emerald-600">{opp.amount}</p>
                    <p className="text-xs text-muted-foreground">Funding</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" />
                      {opp.deadline}
                    </p>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center justify-center gap-1">
                      <MapPin className="h-3 w-3" />
                    </p>
                    <p className="text-xs text-muted-foreground">{opp.location}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-medium">{opp.successRate}%</span>
                  </div>
                  <Progress value={opp.successRate} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">
                    {opp.applicants} applicants • Be among the first!
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium mb-2">Requirements:</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {opp.requirements.map((req, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full" size="sm">
                  Apply Now
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
