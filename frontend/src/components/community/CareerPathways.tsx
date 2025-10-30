import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Rocket, 
  Briefcase, 
  GraduationCap, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  DollarSign,
  Clock
} from "lucide-react";

interface CareerPath {
  title: string;
  description: string;
  timeline: string;
  earning: string;
  growth: string;
  skills: string[];
  icon: any;
  color: string;
}

export default function CareerPathways() {
  const careerPaths: CareerPath[] = [
    {
      title: 'Smart Farmer',
      description: 'Modern farming with technology and data-driven decisions',
      timeline: '6-12 months',
      earning: '$500-2000/month',
      growth: 'High',
      skills: ['IoT Sensors', 'Data Analysis', 'Precision Agriculture'],
      icon: Rocket,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Agri-Entrepreneur',
      description: 'Build and scale your agricultural business',
      timeline: '1-2 years',
      earning: '$1000-5000/month',
      growth: 'Very High',
      skills: ['Business Planning', 'Marketing', 'Financial Management'],
      icon: Briefcase,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Agricultural Specialist',
      description: 'Expert in crop science, soil management, or livestock',
      timeline: '2-4 years',
      earning: '$800-3000/month',
      growth: 'Steady',
      skills: ['Crop Science', 'Soil Analysis', 'Pest Management'],
      icon: GraduationCap,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Supply Chain Manager',
      description: 'Connect farmers to markets and optimize distribution',
      timeline: '1-2 years',
      earning: '$1200-4000/month',
      growth: 'High',
      skills: ['Logistics', 'Negotiation', 'Network Building'],
      icon: TrendingUp,
      color: 'from-orange-500 to-rose-500',
    },
  ];

  const educationResources = [
    {
      title: 'Digital Farming Bootcamp',
      duration: '3 months',
      type: 'Online',
      status: 'Free',
      badge: '🎓',
    },
    {
      title: 'Agribusiness MBA',
      duration: '2 years',
      type: 'Hybrid',
      status: 'Scholarship Available',
      badge: '💼',
    },
    {
      title: 'Tech in Agriculture Certificate',
      duration: '6 weeks',
      type: 'Online',
      status: 'Free',
      badge: '🚀',
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Your Agriculture Career Journey
          </CardTitle>
          <CardDescription>
            Explore modern career paths in agriculture - from tech-savvy farming to agri-business
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="paths" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paths">Career Paths</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
        </TabsList>

        <TabsContent value="paths" className="space-y-3 mt-3">
          {careerPaths.map((path, index) => {
            const Icon = path.icon;
            return (
              <Card key={index} className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${path.color}`} />
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${path.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold mb-1">{path.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {path.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center py-2 border-y">
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-medium">{path.timeline}</p>
                        <p className="text-xs text-muted-foreground">Timeline</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <DollarSign className="h-3 w-3 text-emerald-500" />
                        </div>
                        <p className="text-xs font-medium text-emerald-600">{path.earning}</p>
                        <p className="text-xs text-muted-foreground">Potential</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="h-3 w-3 text-blue-500" />
                        </div>
                        <p className="text-xs font-medium text-blue-600">{path.growth}</p>
                        <p className="text-xs text-muted-foreground">Growth</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium mb-2">Key Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {path.skills.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full" size="sm">
                      Start This Path
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="education" className="space-y-3 mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Education & Training Programs
              </CardTitle>
              <CardDescription>
                Get certified and level up your agricultural knowledge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {educationResources.map((resource, index) => (
                <Card key={index} className="bg-gradient-to-br from-card to-muted/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{resource.badge}</span>
                          <h4 className="font-semibold text-sm">{resource.title}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {resource.duration}
                          </span>
                          <span>•</span>
                          <span>{resource.type}</span>
                        </div>
                        <Badge 
                          variant={resource.status === 'Free' ? 'secondary' : 'default'}
                          className="text-xs"
                        >
                          {resource.status}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
