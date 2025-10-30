import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, ArrowRight, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const LoanSuccess = () => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/10 via-background to-primary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-[fall_3s_ease-in_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              <Sparkles className="h-4 w-4 text-secondary" />
            </div>
          ))}
        </div>
      )}

      <Card className="max-w-2xl w-full p-8 md:p-12 text-center shadow-2xl animate-scale-in">
        {/* Success Icon */}
        <div className="relative mb-6">
          <div className="h-24 w-24 rounded-full bg-success/10 flex items-center justify-center mx-auto animate-pulse">
            <CheckCircle2 className="h-16 w-16 text-success" />
          </div>
          <div className="absolute -top-2 -right-2 animate-bounce">
            <Sparkles className="h-8 w-8 text-secondary" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-card-foreground">
          🎉 Congratulations!
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8">
          Your loan has been <span className="text-success font-bold">approved</span>!
        </p>

        {/* Loan Details */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-success/5 mb-8">
          <div className="text-5xl font-bold text-primary mb-2">$500</div>
          <p className="text-muted-foreground">
            has been approved and will be disbursed within 24 hours
          </p>
        </Card>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-4 bg-muted/50">
            <div className="text-2xl font-bold text-primary mb-1">2</div>
            <div className="text-sm text-muted-foreground">Children can go to school</div>
          </Card>
          <Card className="p-4 bg-muted/50">
            <div className="text-2xl font-bold text-primary mb-1">5</div>
            <div className="text-sm text-muted-foreground">Families can be fed</div>
          </Card>
        </div>

        {/* Next Steps */}
        <div className="bg-info/10 rounded-lg p-6 mb-8 border border-info/20 text-left">
          <h3 className="font-bold mb-3 text-card-foreground">What happens next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
              <span>Your funds will be deposited within 24 hours</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
              <span>Update your crop progress regularly for better terms</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
              <span>Start selling your future harvest on the marketplace</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/farmer" className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary-light group">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button variant="outline" className="flex-1 group">
            <Share2 className="mr-2 h-4 w-4" />
            Share Good News
          </Button>
        </div>

        {/* Encouragement */}
        <p className="mt-8 text-muted-foreground italic">
          "Your farming dreams are now funded. Let's grow together! 🌱"
        </p>
      </Card>

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LoanSuccess;
