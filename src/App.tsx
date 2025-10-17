import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { AccessibilityMenu } from "@/components/accessibility/AccessibilityMenu";
import Index from "./pages/Index";
import FarmerDashboard from "./pages/FarmerDashboard";
import LoanApplication from "./pages/LoanApplication";
import LoanSuccess from "./pages/LoanSuccess";
import Marketplace from "./pages/Marketplace";
import BuyerProfile from "./pages/BuyerProfile";
import CropProgress from "./pages/CropProgress";
import LearningCenter from "./pages/LearningCenter";
import CooperativeManagement from "./pages/CooperativeManagement";
import RiskAssessment from "./pages/RiskAssessment";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AccessibilityProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/farmer" element={<FarmerDashboard />} />
            <Route path="/farmer/apply-loan" element={<LoanApplication />} />
            <Route path="/farmer/success" element={<LoanSuccess />} />
            <Route path="/farmer/crops/:cropId" element={<CropProgress />} />
            <Route path="/farmer/learn" element={<LearningCenter />} />
            <Route path="/farmer/cooperative" element={<CooperativeManagement />} />
            <Route path="/farmer/risk-assessment" element={<RiskAssessment />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/buyer/profile" element={<BuyerProfile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AccessibilityMenu />
        </BrowserRouter>
      </TooltipProvider>
    </AccessibilityProvider>
  </QueryClientProvider>
);

export default App;
