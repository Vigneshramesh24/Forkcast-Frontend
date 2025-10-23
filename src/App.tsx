import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginSelection from "@/pages/LoginSelection";
import CustomerApp from "@/customer/CustomerApp";
import BusinessApp from "@/business/BusinessApp";
import Auth from "@/customer/pages/Auth";
import RoleSelection from "@/customer/pages/RoleSelection";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing: Authentication first */}
          <Route path="/" element={<Auth />} />
          {/* Role selection after sign-in */}
          <Route path="/select-role" element={<RoleSelection />} />
          <Route path="/login-selection" element={<LoginSelection />} />
          <Route path="/customer/*" element={<CustomerApp />} />
          <Route path="/business/*" element={<BusinessApp />} />
          {/* Redirect unknown routes to auth */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
