import Navbar from "@/business/components/Navbar";
import ChatbotPanel from "@/business/components/ChatbotPanel";
import AnalyticsPanel from "@/business/components/AnalyticsPanel";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Main Content Area */}
      <main className="pt-[56px] px-10 py-6 h-screen overflow-hidden">
        <div className="h-[calc(100vh-56px-3rem)] grid grid-cols-1 lg:grid-cols-[45%_55%] gap-5">
          {/* Left Panel - Chatbot */}
          <div className="h-full min-h-0 flex flex-col overflow-hidden">
            <ChatbotPanel />
          </div>
          
          {/* Right Panel - Analytics */}
          <div className="h-full min-h-0 flex flex-col overflow-hidden">
            <AnalyticsPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
