import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe2, FileCheck, Ship, DollarSign, Award, Users, BookOpen, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function InternationalExportHub() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Globe2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">International Export Hub</CardTitle>
              <CardDescription>
                Everything you need to take your products to global markets
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="standards" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="standards">
            <Award className="h-4 w-4 mr-2" />
            Standards
          </TabsTrigger>
          <TabsTrigger value="buyers">
            <Users className="h-4 w-4 mr-2" />
            Buyers
          </TabsTrigger>
          <TabsTrigger value="docs">
            <FileCheck className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="logistics">
            <Ship className="h-4 w-4 mr-2" />
            Logistics
          </TabsTrigger>
          <TabsTrigger value="payments">
            <DollarSign className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
        </TabsList>

        {/* Export Quality Standards */}
        <TabsContent value="standards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Export Quality Standards
              </CardTitle>
              <CardDescription>
                Meet international quality requirements for your products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {[
                    {
                      region: "European Union",
                      standards: ["GlobalG.A.P", "HACCP", "Organic EU", "Fairtrade"],
                      focus: "Strict pesticide residue limits, traceability requirements",
                      color: "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                    },
                    {
                      region: "United States",
                      standards: ["USDA Organic", "FDA Food Safety", "Primus GFS"],
                      focus: "FSMA compliance, third-party audits, food defense",
                      color: "bg-red-500/10 text-red-700 dark:text-red-300"
                    },
                    {
                      region: "Middle East",
                      standards: ["Halal Certification", "GSO Standards", "ISO 22000"],
                      focus: "Religious compliance, shelf life, packaging requirements",
                      color: "bg-green-500/10 text-green-700 dark:text-green-300"
                    },
                    {
                      region: "Asia Pacific",
                      standards: ["JGAP (Japan)", "ChinaGAP", "SQF"],
                      focus: "Variety specific standards, residue testing, phytosanitary",
                      color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
                    }
                  ].map((region, idx) => (
                    <div key={idx} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{region.region}</h3>
                        <Badge className={region.color}>{region.standards.length} Standards</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {region.standards.map((std, i) => (
                          <Badge key={i} variant="outline">{std}</Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Key Focus:</strong> {region.focus}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Learn More About {region.region} Standards
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* International Buyer Expectations */}
        <TabsContent value="buyers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                International Buyer Expectations
              </CardTitle>
              <CardDescription>
                Understand what global buyers look for in suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {[
                    {
                      category: "Quality Assurance",
                      expectations: [
                        "Consistent product quality across shipments",
                        "Third-party quality certifications",
                        "Documented quality control processes",
                        "Sample testing and lab reports"
                      ],
                      priority: "Critical"
                    },
                    {
                      category: "Supply Reliability",
                      expectations: [
                        "Year-round or seasonal supply guarantees",
                        "Minimum order quantities (MOQ) flexibility",
                        "Backup suppliers for continuity",
                        "Production capacity documentation"
                      ],
                      priority: "High"
                    },
                    {
                      category: "Communication",
                      expectations: [
                        "English language proficiency",
                        "24-48 hour response time",
                        "Proactive updates on shipments",
                        "Professional email etiquette"
                      ],
                      priority: "High"
                    },
                    {
                      category: "Pricing & Terms",
                      expectations: [
                        "Competitive pricing with transparency",
                        "FOB/CIF pricing clarity",
                        "Payment terms flexibility (L/C, T/T)",
                        "Volume discount structures"
                      ],
                      priority: "Medium"
                    },
                    {
                      category: "Sustainability",
                      expectations: [
                        "Environmental certifications",
                        "Ethical labor practices",
                        "Carbon footprint reduction",
                        "Waste management programs"
                      ],
                      priority: "Growing"
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{item.category}</h3>
                        <Badge variant={
                          item.priority === "Critical" ? "destructive" :
                          item.priority === "High" ? "default" : "secondary"
                        }>
                          {item.priority} Priority
                        </Badge>
                      </div>
                      <ul className="space-y-2">
                        {item.expectations.map((exp, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-1">•</span>
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation & Certification */}
        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Export Documentation Guide
              </CardTitle>
              <CardDescription>
                Essential documents and certifications for international trade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  <div className="grid gap-4">
                    {[
                      {
                        category: "Essential Export Documents",
                        docs: [
                          { name: "Commercial Invoice", desc: "Detailed product description, pricing, and terms" },
                          { name: "Packing List", desc: "Contents, weights, dimensions of each package" },
                          { name: "Bill of Lading", desc: "Contract between shipper and carrier" },
                          { name: "Certificate of Origin", desc: "Proves country of product origin" },
                          { name: "Insurance Certificate", desc: "Proof of cargo insurance coverage" }
                        ]
                      },
                      {
                        category: "Quality Certifications",
                        docs: [
                          { name: "Phytosanitary Certificate", desc: "Plant health certificate from agriculture ministry" },
                          { name: "Health Certificate", desc: "Product meets health and safety standards" },
                          { name: "Quality Inspection Report", desc: "Third-party lab testing results" },
                          { name: "Organic Certification", desc: "Certified organic production methods" },
                          { name: "Fumigation Certificate", desc: "Pest control treatment documentation" }
                        ]
                      },
                      {
                        category: "Financial Documents",
                        docs: [
                          { name: "Proforma Invoice", desc: "Preliminary bill for buyer approval" },
                          { name: "Letter of Credit", desc: "Bank guarantee for payment" },
                          { name: "Bank Draft", desc: "Payment instrument drawn on a bank" },
                          { name: "Export License", desc: "Government permission to export" }
                        ]
                      }
                    ].map((section, idx) => (
                      <div key={idx} className="space-y-3">
                        <h3 className="font-semibold text-lg border-b pb-2">{section.category}</h3>
                        <div className="space-y-2">
                          {section.docs.map((doc, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                              <FileCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <div className="space-y-1 flex-1">
                                <div className="font-medium">{doc.name}</div>
                                <div className="text-sm text-muted-foreground">{doc.desc}</div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-3">Need Help with Documentation?</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Connect with export documentation specialists who can guide you through the process.
                      </p>
                      <Button className="w-full">
                        <Users className="h-4 w-4 mr-2" />
                        Find Documentation Expert
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logistics & Shipping */}
        <TabsContent value="logistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Logistics & Shipping Coordination
              </CardTitle>
              <CardDescription>
                Navigate international shipping and logistics successfully
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {/* Shipping Methods */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Shipping Methods Comparison</h3>
                    <div className="grid gap-3">
                      {[
                        {
                          method: "Sea Freight (Container)",
                          time: "20-45 days",
                          cost: "Low",
                          best: "Large volumes, non-perishables, cost-sensitive",
                          considerations: "Port access, container availability, customs delays"
                        },
                        {
                          method: "Sea Freight (Refrigerated)",
                          time: "20-45 days",
                          cost: "Medium",
                          best: "Fresh produce, temperature-sensitive goods",
                          considerations: "Cold chain management, higher insurance"
                        },
                        {
                          method: "Air Freight",
                          time: "3-7 days",
                          cost: "High",
                          best: "Perishables, high-value, urgent orders",
                          considerations: "Weight restrictions, airport handling"
                        },
                        {
                          method: "Express Courier",
                          time: "2-5 days",
                          cost: "Very High",
                          best: "Samples, documents, small urgent shipments",
                          considerations: "Size/weight limits, simplified customs"
                        }
                      ].map((method, idx) => (
                        <div key={idx} className="p-4 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{method.method}</h4>
                            <div className="flex gap-2">
                              <Badge variant="outline">{method.time}</Badge>
                              <Badge variant="secondary">{method.cost} Cost</Badge>
                            </div>
                          </div>
                          <p className="text-sm"><strong>Best for:</strong> {method.best}</p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Key considerations:</strong> {method.considerations}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Incoterms */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Common Incoterms</h3>
                    <div className="grid gap-3">
                      {[
                        { term: "EXW", full: "Ex Works", seller: "Minimal", buyer: "Maximum", desc: "Buyer handles everything from your farm" },
                        { term: "FOB", full: "Free on Board", seller: "Medium", buyer: "Medium", desc: "You deliver to port, buyer handles sea freight" },
                        { term: "CIF", full: "Cost, Insurance, Freight", seller: "High", buyer: "Low", desc: "You handle shipping and insurance to destination port" },
                        { term: "DDP", full: "Delivered Duty Paid", seller: "Maximum", buyer: "Minimal", desc: "You handle everything including customs clearance" }
                      ].map((term, idx) => (
                        <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-bold text-lg">{term.term}</span>
                              <span className="text-sm text-muted-foreground ml-2">({term.full})</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                            <div>Seller Risk: <Badge variant="outline" className="ml-1">{term.seller}</Badge></div>
                            <div>Buyer Risk: <Badge variant="outline" className="ml-1">{term.buyer}</Badge></div>
                          </div>
                          <p className="text-sm text-muted-foreground">{term.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Freight Forwarders */}
                  <Card className="bg-accent/5">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-3">Recommended Freight Forwarders</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Connect with experienced freight forwarders specializing in agricultural exports from your region.
                      </p>
                      <Button className="w-full">
                        <Ship className="h-4 w-4 mr-2" />
                        Browse Freight Forwarders
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency & Payments */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Currency & Payment Management
              </CardTitle>
              <CardDescription>
                Navigate international payments and currency exchange
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Payment Methods</h3>
                    <div className="grid gap-3">
                      {[
                        {
                          method: "Letter of Credit (L/C)",
                          security: "Highest",
                          cost: "High",
                          speed: "Slow",
                          best: "New buyers, large orders, risk mitigation",
                          pros: "Bank guarantee, very secure, trusted globally",
                          cons: "Expensive fees, documentation intensive, slow"
                        },
                        {
                          method: "Telegraphic Transfer (T/T)",
                          security: "Medium",
                          cost: "Low",
                          speed: "Fast",
                          best: "Established relationships, advance payments",
                          pros: "Quick, low cost, simple process",
                          cons: "Less secure, requires trust, risk of non-payment"
                        },
                        {
                          method: "Documentary Collection",
                          security: "Medium",
                          cost: "Medium",
                          speed: "Medium",
                          best: "Moderate risk buyers, cost-conscious",
                          pros: "Cheaper than L/C, some bank involvement",
                          cons: "Less secure than L/C, no payment guarantee"
                        },
                        {
                          method: "Escrow Services",
                          security: "High",
                          cost: "Medium",
                          speed: "Medium",
                          best: "New online buyers, marketplace transactions",
                          pros: "Third-party protection, growing acceptance",
                          cons: "Fees apply, limited to certain platforms"
                        }
                      ].map((payment, idx) => (
                        <div key={idx} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{payment.method}</h4>
                            <div className="flex gap-2">
                              <Badge variant="outline">{payment.security} Security</Badge>
                              <Badge variant="secondary">{payment.speed}</Badge>
                            </div>
                          </div>
                          <p className="text-sm"><strong>Best for:</strong> {payment.best}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-green-600 dark:text-green-400">✓ {payment.pros}</div>
                            <div className="text-red-600 dark:text-red-400">✗ {payment.cons}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Currency Management */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Currency Management Tips</h3>
                    <div className="grid gap-3">
                      {[
                        {
                          tip: "Pricing Currency",
                          advice: "Quote in USD, EUR, or buyer's currency for clarity. Consider using stable currencies to minimize exchange rate risk."
                        },
                        {
                          tip: "Exchange Rate Protection",
                          advice: "Use forward contracts to lock in exchange rates for 30-180 days. Protects from currency fluctuations on large orders."
                        },
                        {
                          tip: "Bank Charges",
                          advice: "Clarify who pays bank fees upfront. Use 'shared fees' or 'OUR' instruction to avoid surprise deductions."
                        },
                        {
                          tip: "Payment Terms",
                          advice: "Common terms: 30% advance, 70% against B/L copy OR 100% L/C at sight. Negotiate based on relationship and order size."
                        },
                        {
                          tip: "Multi-Currency Accounts",
                          advice: "Consider opening USD or EUR accounts to receive payments directly, avoiding conversion fees and delays."
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                          <h4 className="font-medium mb-1">{item.tip}</h4>
                          <p className="text-sm text-muted-foreground">{item.advice}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Mitigation */}
                  <Card className="bg-yellow-500/5 border-yellow-500/20">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Payment Risk Mitigation
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Always verify buyer credentials through trade references and credit checks</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Consider export credit insurance for large orders or new markets</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Start with smaller trial orders before committing to bulk supplies</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Keep detailed records of all communications and agreements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Work with your bank's international trade department for guidance</span>
                        </li>
                      </ul>
                      <Button variant="outline" className="w-full mt-4">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Download Payment Security Checklist
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Community Discussion Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-background">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Join Export Community Discussions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect with experienced exporters, ask questions, and share your journey. Learn from those who've successfully entered international markets.
              </p>
              <Button>
                Join Export Farmers Community
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
