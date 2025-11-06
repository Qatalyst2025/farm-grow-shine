import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { Sprout, Users, TrendingUp, Shield, ArrowRight, Camera, Brain, LogIn, Twitter, Facebook, Linkedin, Video } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    const role = localStorage.getItem("user_role");
    
    setIsAuthenticated(!!token);
    setUserRole(role);
  }, []);

  const handleFarmerClick = () => {
    if (isAuthenticated && userRole === "FARMER") {
      navigate("/farmer");
    } else if (isAuthenticated && userRole === "BUYER") {
      // Buyer trying to access farmer dashboard
      navigate("/marketplace");
    } else {
      // Not authenticated or wrong role - go to auth
      navigate("/auth");
    }
  };

  const handleBuyerClick = () => {
    if (isAuthenticated && userRole === "BUYER") {
      navigate("/marketplace");
    } else if (isAuthenticated && userRole === "FARMER") {
      // Farmer trying to access marketplace
      navigate("/farmer");
    } else {
      // Not authenticated or wrong role - go to auth
      navigate("/auth");
    }
  };

  const handleSignInClick = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}

      <header className="container mx-auto px-4 pt-6 relative z-10">
        <div className="flex items-center justify-between">
          <Logo size="lg" className="text-primary [&_span]:text-primary rounded-full" />
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button 
                onClick={() => userRole === "FARMER" ? navigate("/farmer") : navigate("/marketplace")}
                variant="outline" 
                className="bg-white/10 backdrop-blur-sm text-primary border-white/30 hover:bg-white/20"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            ) : (
              <Button 
                onClick={handleSignInClick}
                variant="outline" 
                className="bg-white/10 backdrop-blur-sm text-primary border-white/30 hover:bg-white/20 [&_span]:text-primary"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>





      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary min-h-[600px]">
        <div 
          className="absolute inset-0 bg-[url('https://s3.amazonaws.com/shecodesio-production/uploads/files/000/175/505/original/i_want_you_to_generate_for_me_an_image_for_the_hero_section_of_my_website._The_project_is_on_agriculture_but_how_the_world_of_lockchain_is_transforming_it.jpg?1762354509')] bg-cover bg-center"
          style={{
            backgroundBlendMode: 'overlay',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
        />

        <div className="container mx-auto px-4 py-24 relative z-10">
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
              Transform your harvest into opportunity. Get loans, tokenize crops, and connect with buyers all in one secure platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleFarmerClick}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-lg px-8 py-6"
              >
                I'm a Farmer
                <Sprout className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleBuyerClick}
                className="bg-white/10 backdrop-blur-sm text-primary-foreground border-white/30 hover:bg-white text-lg px-8 py-6"
              >
                I'm a Buyer
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </div>




            {isAuthenticated && (
              <p className="text-sm text-primary-foreground/70 mt-4">
                Signed in as {userRole?.toLowerCase()} •{" "}
                <button 
                  onClick={() => {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("token");
                    localStorage.removeItem("user_role");
                    window.location.reload();
                  }}
                  className="underline hover:no-underline"
                >
                  Sign out
                </button>
              </p>
            )}


          </div>
        </div>
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



      {/* About Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-2">
              <Sprout className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Our Mission</span>
            </div>
            
            <h2 className="text-4xl font-bold text-secondary leading-tight">
              Transforming Agriculture Through
              <span className="text-foreground block">Blockchain Innovation</span>
            </h2>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              At AgriLinka, we're revolutionizing how farmers access financial resources and market opportunities. 
              Our platform bridges the gap between traditional farming and modern fintech, enabling farmers to 
              tokenize their crops and access fair financing.
            </p>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Financial Empowerment</h3>
                  <p className="text-muted-foreground">Access to quick loans and crop tokenization helps farmers expand their operations and secure their future.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Community Growth</h3>
                  <p className="text-muted-foreground">Join a thriving community of farmers and buyers, sharing knowledge and creating opportunities.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Secure & Transparent</h3>
                  <p className="text-muted-foreground">Blockchain technology ensures all transactions are secure, traceable, and completely transparent.</p>
                </div>
              </div>
            </div>

          

          </div>

         
          <div className="grid grid-cols-2 gap-4 h-[600px]">
            <div className="col-span-2 relative h-[350px] rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&auto=format&fit=crop&q=60" 
                alt="Farmer using AgriLinka platform" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="relative h-[230px] rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&auto=format&fit=crop&q=60" 
                alt="Digital farming technology" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="relative h-[230px] rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1535090467336-9501f96eef89?w=400&auto=format&fit=crop&q=60" 
                alt="Successful farming with AgriLinka" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
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




      {/* Testimonials Section */}
      <section className="py-24 relative overflow-hidden">
     
        <div className="absolute inset-0 bg-muted/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,_var(--primary)_0%,_transparent_25%)] opacity-10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,_var(--secondary)_0%,_transparent_25%)] opacity-10"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Success Stories</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Trusted by Farmers and Industry Leaders
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how AgriLinka is transforming agriculture across Africa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-card rounded-xl p-8 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full ring-4 ring-primary/10 overflow-hidden">
                    <img
                      src="https://s3.amazonaws.com/shecodesio-production/uploads/files/000/171/721/original/b1079428-5f19-421c-882b-ed8fc38307b5.jpeg?1754411929"
                      alt="John Kamau"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-foreground">John Kamau</h3>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-primary/20 text-6xl font-serif absolute top-4 right-4">"</div>
                  <p className="text-base text-foreground/90 leading-relaxed relative">
                    AgriLinka revolutionized my farming. Through their AI crop analysis and funding options, 
                    I've seen a <span className="text-primary font-medium">40% increase</span> in yield and secured 
                    advance payments for my harvest.
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                   
                  </div>
                </div>
              </div>
            </div>

          
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary to-primary rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-card rounded-xl p-8 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full ring-4 ring-primary/10 overflow-hidden">
                    <img
                      src="https://s3.amazonaws.com/shecodesio-production/uploads/files/000/171/718/original/3208c3a7-ce39-4d5c-8097-5e6a145a252a.jpeg?1754411613"
                      alt="Sarah Ochieng"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-foreground">Sarah Ochieng</h3>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-secondary/20 text-6xl font-serif absolute top-4 right-4">"</div>
                  <p className="text-base text-foreground/90 leading-relaxed relative">
                    The blockchain tracking system has transformed our supply chain. We've reduced costs by 
                    <span className="text-secondary font-medium"> 25%</span> and improved quality assurance significantly. 
                    Direct farmer connections are invaluable.
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                   
                  </div>
                </div>
              </div>
            </div>

           
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-card rounded-xl p-8 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full ring-4 ring-primary/10 overflow-hidden">
                    <img
                      src="https://s3.amazonaws.com/shecodesio-production/uploads/files/000/169/275/original/Professional_portraits_of_Mr__David%E2%80%A6.jpeg?1751208652"
                      alt="David Mutua"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-foreground">David Mutua</h3>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-accent/20 text-6xl font-serif absolute top-4 right-4">"</div>
                  <p className="text-base text-foreground/90 leading-relaxed relative">
                    The transparency of blockchain-based crop tokenization has opened new investment avenues. 
                    Our portfolio has seen a <span className="text-accent font-medium">60% growth</span> since 
                    partnering with AgriLinka.
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                   
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     
      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-primary p-12 text-center text-primary-foreground shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Grow Your Future?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of farmers who are transforming their harvests into prosperity.
          </p>
          <Button 
            size="lg" 
            onClick={handleFarmerClick}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-lg px-8 py-6"
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Card>
      </section>





      <footer className="bg-muted py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
            <div className="space-y-4">
              <Logo size="lg" className="text-primary [&_span]:text-primary rounded-full" />
              <p className="text-sm text-muted-foreground">
                Empowering farmers through blockchain technology and innovative financial solutions.
              </p>
            </div>

          
            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/marketplace" className="text-sm text-muted-foreground hover:text-primary transition-colors">Marketplace</Link></li>
                <li><Link to="/farmer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Farmer Dashboard</Link></li>
                <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>

            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQs</Link></li>
                <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

          
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground">Email: support@agrilinka.com</li>
                <li className="text-sm text-muted-foreground">Phone: +254 700 000 000</li>
                <li className="text-sm text-muted-foreground">Location: Nairobi, Kenya</li>
              </ul>
              <div className="flex gap-3 mt-4">
                {/* Social Media Links */}
                <a 
                  href="https://twitter.com/agrilinka" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">Twitter</span>
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="https://facebook.com/agrilinka" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">Facebook</span>
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="https://linkedin.com/company/agrilinka" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">LinkedIn</span>
                  <Linkedin className="h-5 w-5" />
                </a>
                <a 
                  href="https://tiktok.com/@agrilinka" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">TikTok</span>
                  <Video className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AgriLinka. All rights reserved.
            </p>
          </div>
        </div>
      </footer>







    </div>
  );
};

export default Index;
