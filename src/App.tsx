import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

const LoginSelection = lazy(() => import("@/pages/LoginSelection"));
const CustomerApp = lazy(() => import("@/customer/CustomerApp"));
const BusinessApp = lazy(() => import("@/business/BusinessApp"));
const Auth = lazy(() => import("@/customer/pages/Auth"));
const RoleSelection = lazy(() => import("@/customer/pages/RoleSelection"));
const Restaurants = lazy(() => import("@/customer/pages/Restaurants"));
const RestaurantDetail = lazy(() => import("@/customer/pages/RestaurantDetail"));
const SuggestionDetail = lazy(() => import("@/customer/pages/SuggestionDetail"));
const FoodSearchResults = lazy(() => import("@/customer/pages/FoodSearchResults"));
const CSVRestaurantDetail = lazy(() => import("@/customer/pages/CSVRestaurantDetail"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
        <Routes>
          {/* Landing: Authentication first */}
          <Route path="/" element={<Auth />} />
          {/* Role selection after sign-in */}
          <Route path="/select-role" element={<RoleSelection />} />
          <Route path="/login-selection" element={<LoginSelection />} />
          <Route path="/customer/*" element={<CustomerApp />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
          <Route path="/search" element={<FoodSearchResults />} />
          <Route path="/csv-restaurant/:slug" element={<CSVRestaurantDetail />} />
          <Route path="/suggestion" element={<SuggestionDetail />} />
          <Route path="/business/*" element={<BusinessApp />} />
          {/* Redirect unknown routes to auth */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
