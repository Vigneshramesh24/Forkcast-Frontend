import { Routes, Route } from "react-router-dom";
import Index from "@/customer/pages/Index";
import Auth from "@/customer/pages/Auth";
import NotFound from "@/customer/pages/NotFound";

const CustomerApp = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default CustomerApp;
