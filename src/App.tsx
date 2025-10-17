import React, { lazy, Suspense } from "react";
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
import CropHealthMonitor from "./pages/CropHealthMonitor";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import VerificationCenter from "./pages/VerificationCenter";
import CreditAssessment from "./pages/CreditAssessment";
import Community from "./pages/Community";
import Negotiations from "./pages/Negotiations";

// Lazy load AIAdvisor to prevent i18n initialization issues
const AIAdvisor = lazy(() => import("./pages/AIAdvisor"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AccessibilityProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/farmer" element={<FarmerDashboard />} />
              <Route path="/farmer/apply-loan" element={<LoanApplication />} />
              <Route path="/farmer/success" element={<LoanSuccess />} />
              <Route path="/farmer/crops/:cropId" element={<CropProgress />} />
              <Route path="/farmer/learn" element={<LearningCenter />} />
              <Route path="/farmer/cooperative" element={<CooperativeManagement />} />
            <Route path="/farmer/risk-assessment" element={<RiskAssessment />} />
            <Route path="/farmer/crop-health/:cropId?" element={<CropHealthMonitor />} />
            <Route path="/crop-health" element={<CropHealthMonitor />} />
            <Route path="/auth" element={<Auth />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/buyer/profile" element={<BuyerProfile />} />
            <Route path="/verification" element={<VerificationCenter />} />
            <Route path="/ai-advisor" element={<AIAdvisor />} />
            <Route path="/credit-assessment" element={<CreditAssessment />} />
            <Route path="/community" element={<Community />} />
            <Route path="/negotiations" element={<Negotiations />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <AccessibilityMenu />
        </BrowserRouter>
      </TooltipProvider>
    </AccessibilityProvider>
  </QueryClientProvider>
);

export default App;
