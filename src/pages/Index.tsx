import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { Sprout, Users, TrendingUp, Shield, ArrowRight, Camera, Brain } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-light to-primary-glow">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        {/* Logo Header */}
        <div className="container mx-auto px-4 pt-6 relative z-10">
          <Logo size="lg" className="text-primary-foreground [&_span]:text-primary-foreground" />
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sprout className="h-4 w-4" />
              <span className="text-sm font-medium">Powered by Blockchain</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              AgriLinka: Your Farming Dreams,
              <br />
              <span className="text-secondary">Digitally Funded</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-primary-foreground/90 max-w-2xl mx-auto">
              Transform your harvest into opportunity. Get loans, tokenize crops, and connect with buyers—all in one secure platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/farmer">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-lg px-8 py-6">
                  I'm a Farmer
                  <Sprout className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm text-primary-foreground border-white/30 hover:bg-white/20 text-lg px-8 py-6">
                  I'm a Buyer
                  <Users className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            How We Empower Farmers
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, secure, and designed for your success
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 border-l-4 border-l-primary hover:shadow-elevated transition-all hover:-translate-y-1 animate-fade-in">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Camera className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-card-foreground">AI Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              Upload crop photos for instant AI analysis. Detect pests, diseases, and growth stages automatically.
            </p>
          </Card>

          <Card className="p-8 border-l-4 border-l-secondary hover:shadow-elevated transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
              <TrendingUp className="h-7 w-7 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-card-foreground">Quick Loans</h3>
            <p className="text-muted-foreground leading-relaxed">
              Get funding for your next planting season in minutes. Simple 3-step application with instant approval.
            </p>
          </Card>

          <Card className="p-8 border-l-4 border-l-accent hover:shadow-elevated transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <Sprout className="h-7 w-7 text-accent" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-card-foreground">Tokenize Crops</h3>
            <p className="text-muted-foreground leading-relaxed">
              Turn your future harvest into digital assets. Sell portions in advance while you grow.
            </p>
          </Card>

          <Card className="p-8 border-l-4 border-l-primary hover:shadow-elevated transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-card-foreground">Secure & Transparent</h3>
            <p className="text-muted-foreground leading-relaxed">
              Every transaction recorded on blockchain. Track your crops, payments, and progress in real-time.
            </p>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div className="animate-scale-in">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">$2.5M+</div>
              <div className="text-muted-foreground">Loans Funded</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: "0.1s" }}>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-muted-foreground">Active Farmers</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">350+</div>
              <div className="text-muted-foreground">Verified Buyers</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: "0.3s" }}>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-br from-primary to-primary-light p-12 text-center text-primary-foreground shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Grow Your Future?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of farmers who are transforming their harvests into prosperity.
          </p>
          <Link to="/farmer">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-lg px-8 py-6">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
};

export default Index;
