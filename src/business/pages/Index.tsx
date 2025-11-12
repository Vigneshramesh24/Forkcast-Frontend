import Navbar from "@/business/components/Navbar";
import BusinessChatSidebar from "@/business/components/BusinessChatSidebar";
import AnalyticsPanel from "@/business/components/AnalyticsPanel";
import { BusinessDataProvider } from "@/business/lib/BusinessDataContext";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BusinessDataProvider>
        <BusinessChatSidebar />
        {/* Main Content Area */}
        <main className="pt-[56px] px-10 py-6 h-screen overflow-hidden">
          <div className="h-[calc(100vh-56px-3rem)] grid grid-cols-1 gap-5">
            {/* Analytics - full width */}
            <div className="h-full min-h-0 flex flex-col overflow-hidden">
              <AnalyticsPanel />
            </div>
          </div>
        </main>
      </BusinessDataProvider>
    </div>
  );
};

export default Index;
