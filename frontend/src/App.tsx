import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { AccessibilityMenu } from "@/components/accessibility/AccessibilityMenu";
import { EmergencyAlertBanner } from "@/components/alerts/EmergencyAlertBanner";
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
import CropsList from "./pages/CropsList";

// Lazy load AIAdvisor and Messages
const AIAdvisor = lazy(() => import("./pages/AIAdvisor"));
const Messages = lazy(() => import("./pages/Messages"));

const queryClient = new QueryClient();

// Function to get user role
const getUserRole = () => {
  return localStorage.getItem("user_role") || "";
};

// Function to check authentication and role-based access
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("access_token");
  const location = useLocation();
  const userRole = getUserRole();

  // If no token and not trying to access "/" or "/auth", redirect to login
  if (!token && location.pathname !== "/" && location.pathname !== "/auth") {
    return <Navigate to="/auth" replace />;
  }

  // If user has token but tries to access public routes, redirect to appropriate dashboard
  if (token && (location.pathname === "/" || location.pathname === "/auth")) {
    if (userRole === "FARMER") {
      return <Navigate to="/farmer" replace />;
    } else if (userRole === "BUYER") {
      return <Navigate to="/marketplace" replace />;
    }
  }

  // Check role-based access
  if (token && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === "FARMER") {
      return <Navigate to="/farmer" replace />;
    } else if (userRole === "BUYER") {
      return <Navigate to="/marketplace" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// Component to redirect users based on their role
const RoleBasedRedirect = () => {
  const userRole = getUserRole();
  
  if (userRole === "FARMER") {
    return <Navigate to="/farmer" replace />;
  } else if (userRole === "BUYER") {
    return <Navigate to="/marketplace" replace />;
  } else {
    return <Navigate to="/auth" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AccessibilityProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <WalletProvider>
            <EmergencyAlertBanner />
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <Routes>
                {/* Public Routes - No authentication required */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />

                {/* Protected Routes with role-based access */}
                <Route path="/*" element={
                  <PrivateRoute>
                    <Routes>
                      {/* Farmer-only routes */}
                      <Route path="/farmer" element={
                        <PrivateRoute allowedRoles={["FARMER"]}>
                          <FarmerDashboard />
                        </PrivateRoute>
                      } />
                      <Route path="/farmer/apply-loan" element={
                        <PrivateRoute allowedRoles={["FARMER"]}>
                          <LoanApplication />
                        </PrivateRoute>
                      } />
                      <Route path="/farmer/success" element={
                        <PrivateRoute allowedRoles={["FARMER"]}>
                          <LoanSuccess />
                        </PrivateRoute>
                      } />
                      <Route path="/farmer/crops/:cropId" element={
                        <PrivateRoute allowedRoles={["FARMER"]}>
                          <CropProgress />
                        </PrivateRoute>
                      } />
                      <Route path="/farmer/crops" element={
                        <PrivateRoute allowedRoles={["FARMER"]}>
                          <CropsList />
                        </PrivateRoute>
                      } />
                      <Route path="/farmer/learn" element={
                        <PrivateRoute allowedRoles={["FARMER"]}>
                          <LearningCenter />
                        </PrivateRoute>
                      } />
                      <Route path="/farmer/cooperative" element={
                        <PrivateRoute allowedRoles={["FARMER"]}>
                          <CooperativeManagement />
                        </PrivateRoute>
                      } />
                      <Route path="/farmer/risk-assessment" element={
                        <PrivateRoute allowedRoles={["FARMER"]}>
                          <RiskAssessment />
                        </PrivateRoute>
                      } />
                      <Route path="/farmer/crop-health/:cropId?" element={
                        <PrivateRoute allowedRoles={["FARMER"]}>
                          <CropHealthMonitor />
                        </PrivateRoute>
                      } />
                      <Route path="/crop-health" element={
                        <PrivateRoute allowedRoles={["FARMER"]}>
                          <CropHealthMonitor />
                        </PrivateRoute>
                      } />
                      <Route path="/verification" element={
                        <PrivateRoute allowedRoles={["FARMER"]}>
                          <VerificationCenter />
                        </PrivateRoute>
                      } />
                      <Route path="/ai-advisor" element={
                        <PrivateRoute allowedRoles={["FARMER"]}>
                          <AIAdvisor />
                        </PrivateRoute>
                      } />
                      <Route path="/credit-assessment" element={
                        <PrivateRoute allowedRoles={["FARMER"]}>
                          <CreditAssessment />
                        </PrivateRoute>
                      } />

                      {/* Buyer-only routes */}
                      <Route path="/marketplace" element={
                        <PrivateRoute allowedRoles={["BUYER"]}>
                          <Marketplace />
                        </PrivateRoute>
                      } />
                      <Route path="/buyer/profile" element={
                        <PrivateRoute allowedRoles={["BUYER"]}>
                          <BuyerProfile />
                        </PrivateRoute>
                      } />

                      {/* Shared routes - accessible by both roles */}
                      <Route path="/community" element={
                        <PrivateRoute allowedRoles={["FARMER", "BUYER"]}>
                          <Community />
                        </PrivateRoute>
                      } />
                      <Route path="/negotiations" element={
                        <PrivateRoute allowedRoles={["FARMER", "BUYER"]}>
                          <Negotiations />
                        </PrivateRoute>
                      } />
                      <Route path="/messages" element={
                        <PrivateRoute allowedRoles={["FARMER", "BUYER"]}>
                          <Messages />
                        </PrivateRoute>
                      } />

                      {/* Redirect based on user role for root protected routes */}
                      <Route path="/" element={<RoleBasedRedirect />} />

                      {/* Catch-all for unknown routes */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </PrivateRoute>
                } />
              </Routes>
            </Suspense>
            <AccessibilityMenu />
          </WalletProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AccessibilityProvider>
  </QueryClientProvider>
);

export default App;
