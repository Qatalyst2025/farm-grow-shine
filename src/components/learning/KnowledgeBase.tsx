import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, ThumbsUp, Calendar, User, TrendingUp } from "lucide-react";

interface KnowledgeBaseProps {
  searchQuery: string;
}

export const KnowledgeBase = ({ searchQuery }: KnowledgeBaseProps) => {
  const [activeCategory, setActiveCategory] = useState("faq");

  const faqs = [
    {
      id: 1,
      question: "How do I apply for my first loan?",
      answer: "Navigate to the 'Apply for Loan' section from your dashboard. You'll need to select your crop type, land size, and expected yield. Our system will recommend a loan amount based on your inputs. The entire process takes about 10 minutes.",
      category: "Getting Started",
      helpful: 145
    },
    {
      id: 2,
      question: "What documents do I need for loan verification?",
      answer: "You'll need proof of land ownership (title deed or rental agreement), a valid ID, and at least 3 photos of your farm. We also recommend having recent crop photos to improve your financial score.",
      category: "Loans & Finance",
      helpful: 98
    },
    {
      id: 3,
      question: "How can I improve my financial health score?",
      answer: "Upload crop photos weekly (adds 5 points per week), complete loan repayments on time, maintain diverse crops, and update your progress regularly. A score above 80 unlocks better loan terms.",
      category: "Financial Health",
      helpful: 212
    },
    {
      id: 4,
      question: "How do I sell my crops on the marketplace?",
      answer: "Once your crop reaches the harvest milestone, you can list it in the marketplace. Add quality photos, set your price (or accept offers), and connect with verified buyers. Our system guides you through negotiation best practices.",
      category: "Marketplace",
      helpful: 87
    },
    {
      id: 5,
      question: "What happens if my crop fails due to weather?",
      answer: "We understand farming risks. If you've maintained regular photo updates and can document the weather damage, you may be eligible for loan restructuring. Contact support within 7 days of the incident.",
      category: "Risk Management",
      helpful: 156
    }
  ];

  const communityTips = [
    {
      id: 1,
      author: "Kwame from Kumasi",
      region: "Ashanti Region",
      tip: "Mix maize with beans on the same plot. The beans fix nitrogen in the soil, reducing your fertilizer costs by 30%. I've been doing this for 3 seasons with great results!",
      topic: "Soil Enrichment",
      likes: 234,
      date: "2025-10-12"
    },
    {
      id: 2,
      author: "Amina from Tamale",
      region: "Northern Region",
      tip: "Take photos of your crops every Saturday morning - same time, same angle. This consistency helps the AI accurately track your growth and increases your financial score faster.",
      topic: "Financial Tips",
      likes: 189,
      date: "2025-10-08"
    },
    {
      id: 3,
      author: "Joseph from Accra",
      region: "Greater Accra",
      tip: "Before negotiating with buyers, check the regional price trends in the marketplace. Don't accept the first offer - buyers expect to negotiate up by 10-15%.",
      topic: "Selling Strategies",
      likes: 167,
      date: "2025-10-05"
    }
  ];

  const expertQA = [
    {
      id: 1,
      question: "Best time to plant maize in Northern Ghana?",
      expert: "Dr. Mensah - Agricultural Specialist",
      answer: "For Northern Ghana, the optimal planting window is late April to early June, coinciding with the onset of the main rainy season. Plant when you receive at least 20mm of rainfall to ensure good germination.",
      date: "2025-10-10",
      region: "Northern Region"
    },
    {
      id: 2,
      question: "How to manage fall armyworm organically?",
      expert: "Prof. Addo - Pest Management Expert",
      answer: "Mix 1 liter of neem oil with 10 liters of water and spray early morning. Also, plant marigolds around your field - they repel armyworms naturally. Monitor weekly and catch infestations early.",
      date: "2025-10-03",
      region: "All Regions"
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Community Knowledge Base</h2>
        <p className="text-muted-foreground">
          Learn from farmers like you and expert advisors
        </p>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="community">Community Tips</TabsTrigger>
          <TabsTrigger value="experts">Expert Q&A</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="mt-6">
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <Card key={faq.id} className="p-6">
                <div className="mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-card-foreground pr-4">
                      {faq.question}
                    </h3>
                    <Badge variant="outline">{faq.category}</Badge>
                  </div>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    Helpful ({faq.helpful})
                  </Button>
                  <span>•</span>
                  <span>Updated recently</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="community" className="mt-6">
          <div className="space-y-4">
            {communityTips.map((tip) => (
              <Card key={tip.id} className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-card-foreground">{tip.author}</h4>
                        <p className="text-sm text-muted-foreground">{tip.region}</p>
                      </div>
                      <Badge variant="outline">{tip.topic}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{tip.tip}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        {tip.likes}
                      </Button>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(tip.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <Card className="p-6 bg-primary/5 border-primary/20">
              <h4 className="font-semibold mb-2 text-card-foreground">Share Your Knowledge</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Have a farming tip that worked well? Share it with the community and help other farmers succeed!
              </p>
              <Button>
                <MessageCircle className="h-4 w-4 mr-2" />
                Share Your Tip
              </Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="experts" className="mt-6">
          <div className="space-y-4">
            {expertQA.map((qa) => (
              <Card key={qa.id} className="p-6">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-card-foreground pr-4">
                      {qa.question}
                    </h3>
                    <Badge variant="outline">{qa.region}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{qa.expert}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(qa.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-muted-foreground">{qa.answer}</p>
                </div>
              </Card>
            ))}

            <Card className="p-6 bg-info/5 border-info/20">
              <h4 className="font-semibold mb-2 text-card-foreground">Ask an Expert</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Submit your farming question and get answers from certified agricultural experts within 48 hours.
              </p>
              <Button>
                <MessageCircle className="h-4 w-4 mr-2" />
                Ask a Question
              </Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
