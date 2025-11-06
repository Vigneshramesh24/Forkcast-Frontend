import { useState } from "react";
import Navbar from "@/business/components/Navbar";
import ChatbotPanel from "@/business/components/ChatbotPanel";
import AnalyticsPanel from "@/business/components/AnalyticsPanel";
import { X, MessageSquare } from "lucide-react";

const Index = () => {
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content Area */}
      <main className="pt-[56px] px-10 py-6 h-screen overflow-hidden">
        <div className="h-[calc(100vh-56px-3rem)] relative">
          {/* Toggle Dock Button */}
          <div className="absolute left-0 top-6 z-30 -ml-6">
            <button
              onClick={() => setChatOpen((s) => !s)}
              className="w-10 h-10 rounded-full bg-[#e74a3c] cursor-pointer flex items-center justify-center hover:bg-[#f97116] transition-colors duration-500"
              aria-label={chatOpen ? 'Close chat' : 'Open chat'}
            >
              {chatOpen ? (
                <X className="text-white" />
              ) : (
                <MessageSquare className="text-white" />
              )}
            </button>
          </div>

          <div className="h-full flex gap-5 transition-all duration-500 ease-in-out">
            {/* Left Panel - Chatbot (animates width/translate) */}
            <div className={`h-full min-h-0 flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${chatOpen ? 'w-full lg:w-1/3 translate-x-0 opacity-100' : 'w-0 lg:w-0 -translate-x-full opacity-0 pointer-events-none'}`}>
              <ChatbotPanel isClosed={!chatOpen} />
            </div>

            {/* Right Panel - Analytics */}
            <div className={`h-full min-h-0 flex flex-col overflow-hidden flex-1 ${chatOpen ? '' : 'items-center justify-start'}`}>
              <AnalyticsPanel chatOpen={chatOpen} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
