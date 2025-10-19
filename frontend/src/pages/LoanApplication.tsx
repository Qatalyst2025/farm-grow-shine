import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/ui/logo";
import { 
  Sprout, 
  MapPin, 
  DollarSign, 
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LoanApplication = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Form state
  const [formData, setFormData] = useState({
    cropType: "",
    landSize: "",
    expectedYield: "",
    loanAmount: "",
    season: "wet-season"
  });

  const cropTypes = [
    { id: "maize", name: "Maize 🌽", season: "wet-season" },
    { id: "cassava", name: "Cassava 🥔", season: "all-season" },
    { id: "rice", name: "Rice 🌾", season: "wet-season" },
    { id: "tomatoes", name: "Tomatoes 🍅", season: "dry-season" },
    { id: "beans", name: "Beans 🫘", season: "wet-season" },
    { id: "yam", name: "Yam 🍠", season: "wet-season" }
  ];

  const handleNext = () => {
    if (currentStep === 1 && !formData.cropType) {
      toast.error("Please select a crop type");
      return;
    }
    if (currentStep === 2 && (!formData.landSize || !formData.loanAmount)) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Simulate successful submission
    toast.success("Loan application submitted successfully!", {
      description: "You'll receive a response within 24 hours"
    });
    
    setTimeout(() => {
      navigate("/farmer/success");
    }, 1500);
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="md" className="[&_span]:text-primary-foreground" showText={false} />
              <h1 className="text-3xl font-bold">Your Path to Growth 🌱</h1>
            </div>
            <Link to="/farmer">
              <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-primary-foreground hover:bg-white/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    ${currentStep >= step 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                    }
                    transition-all duration-300
                  `}>
                    {currentStep > step ? <CheckCircle2 className="h-6 w-6" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`h-1 w-20 md:w-40 mx-2 ${
                      currentStep > step ? 'bg-primary' : 'bg-muted'
                    } transition-all duration-300`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Dream Your Harvest</span>
              <span>Secure Your Future</span>
              <span>Plant Your Success</span>
            </div>
          </div>

          {/* Step Content */}
          <Card className="p-8 shadow-elevated animate-fade-in">
            {/* Step 1: Crop Selection */}
            {currentStep === 1 && (
              <div>
                <div className="text-center mb-8">
                  <Sprout className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2 text-card-foreground">What Will You Grow?</h2>
                  <p className="text-muted-foreground">Select your crop to get started</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {cropTypes.map((crop) => (
                    <button
                      key={crop.id}
                      onClick={() => setFormData({ ...formData, cropType: crop.id })}
                      className={`
                        p-6 rounded-xl border-2 transition-all hover:scale-105
                        ${formData.cropType === crop.id 
                          ? 'border-primary bg-primary/5 shadow-lg' 
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      <div className="text-4xl mb-2">{crop.name.split(' ')[1]}</div>
                      <div className="font-medium text-card-foreground">{crop.name.split(' ')[0]}</div>
                    </button>
                  ))}
                </div>

                <div className="bg-info/10 rounded-lg p-4 border border-info/20">
                  <p className="text-sm text-muted-foreground">
                    💡 <span className="font-medium">Not sure?</span> Choose the crop that grows best in your region this season
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Financial Planning */}
            {currentStep === 2 && (
              <div>
                <div className="text-center mb-8">
                  <DollarSign className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2 text-card-foreground">Plan Your Investment</h2>
                  <p className="text-muted-foreground">Tell us about your farming plans</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="landSize" className="text-base font-medium mb-2 block">
                      How much land will you use? (acres)
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="landSize"
                        type="number"
                        placeholder="e.g., 2.5"
                        value={formData.landSize}
                        onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                        className="pl-10 text-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expectedYield" className="text-base font-medium mb-2 block">
                      Expected harvest (kg)
                    </Label>
                    <div className="relative">
                      <Sprout className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="expectedYield"
                        type="number"
                        placeholder="e.g., 1500"
                        value={formData.expectedYield}
                        onChange={(e) => setFormData({ ...formData, expectedYield: e.target.value })}
                        className="pl-10 text-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="loanAmount" className="text-base font-medium mb-2 block">
                      How much funding do you need? ($)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="loanAmount"
                        type="number"
                        placeholder="e.g., 500"
                        value={formData.loanAmount}
                        onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                        className="pl-10 text-lg"
                      />
                    </div>
                  </div>

                  {formData.loanAmount && (
                    <Card className="p-4 bg-success/5 border-success/20 animate-scale-in">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                        <div>
                          <p className="font-medium text-success mb-1">Pre-approved! 🎉</p>
                          <p className="text-sm text-muted-foreground">
                            Based on your inputs, you're likely to be approved for ${formData.loanAmount}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div>
                <div className="text-center mb-8">
                  <Sparkles className="h-16 w-16 text-secondary mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2 text-card-foreground">Ready to Plant Your Success! 🌱</h2>
                  <p className="text-muted-foreground">Review your application details</p>
                </div>

                <div className="space-y-4 mb-8">
                  <Card className="p-4 bg-muted/50">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Crop Type</span>
                      <span className="font-bold text-card-foreground">
                        {cropTypes.find(c => c.id === formData.cropType)?.name}
                      </span>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-muted/50">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Land Size</span>
                      <span className="font-bold text-card-foreground">{formData.landSize} acres</span>
                    </div>
                  </Card>

                  <Card className="p-4 bg-muted/50">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Expected Yield</span>
                      <span className="font-bold text-card-foreground">{formData.expectedYield} kg</span>
                    </div>
                  </Card>

                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Loan Amount</span>
                      <span className="font-bold text-primary text-2xl">${formData.loanAmount}</span>
                    </div>
                  </Card>
                </div>

                <div className="bg-muted rounded-lg p-6 mb-6">
                  <h3 className="font-bold mb-3 text-card-foreground">Simple Terms:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span>You're tokenizing 15% of your harvest</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span>You'll receive ${formData.loanAmount} today for planting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span>Repayment due after harvest season</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 bg-primary hover:bg-primary-light"
              >
                {currentStep === totalSteps ? "Submit Application" : "Continue"}
                {currentStep < totalSteps && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoanApplication;
