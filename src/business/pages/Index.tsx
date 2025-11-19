import Navbar from "@/business/components/Navbar";
import AnalyticsPanel from "@/business/components/AnalyticsPanel";
import { BusinessDataProvider } from "@/business/lib/BusinessDataContext";
import ChatbotPanel from "@/business/components/ChatbotPanel";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BusinessDataProvider>
        {/* Split view: left (chat) | right (visuals) */}
        <main className="pt-[56px] px-6 py-4 h-screen overflow-hidden">
          <div className="h-[calc(100vh-56px-2rem)] grid grid-cols-1 lg:grid-cols-12 gap-4">
            <section className="lg:col-span-4 h-full min-h-0 flex flex-col overflow-hidden">
              <ChatbotPanel />
            </section>
            <section className="lg:col-span-8 h-full min-h-0 flex flex-col overflow-hidden">
              <AnalyticsPanel />
            </section>
          </div>
        </main>
      </BusinessDataProvider>
    </div>
  );
};

export default Index;
