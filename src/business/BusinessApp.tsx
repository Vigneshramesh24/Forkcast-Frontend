import { Routes, Route } from "react-router-dom";
import Index from "@/business/pages/Index";
import SavedInformation from "@/business/pages/SavedInformation";
import NotFound from "@/business/pages/NotFound";

const BusinessApp = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/saved-information" element={<SavedInformation />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default BusinessApp;
