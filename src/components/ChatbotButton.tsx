import { useState } from "react";
import { MessageCircle, X, User, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"customer" | "business" | null>(null);

  const handleModeSelect = (mode: "customer" | "business") => {
    setSelectedMode(mode);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedMode(null);
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-transform",
          isOpen && "scale-0"
        )}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Modal */}
      {isOpen && (
        <Card
          className={cn(
            "fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col transition-all",
            selectedMode ? "opacity-100" : "opacity-100"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">
                {selectedMode === "customer"
                  ? "Customer Assistant"
                  : selectedMode === "business"
                  ? "Business Assistant"
                  : "ForkCastAI Assistant"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mode Selection or Chat Interface */}
          {!selectedMode ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground text-center mb-2">
                How can I help you today?
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Choose the type of assistance you need
              </p>

              <Button
                onClick={() => handleModeSelect("customer")}
                variant="outline"
                className="w-full h-auto py-6 flex-col gap-3 hover:bg-primary/10"
              >
                <User className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-semibold text-foreground">Customer Chat</p>
                  <p className="text-xs text-muted-foreground">
                    Find restaurants, get meal recommendations, analyze food photos
                  </p>
                </div>
              </Button>

              <Button
                onClick={() => handleModeSelect("business")}
                variant="outline"
                className="w-full h-auto py-6 flex-col gap-3 hover:bg-primary/10"
              >
                <Briefcase className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-semibold text-foreground">Business Chat</p>
                  <p className="text-xs text-muted-foreground">
                    Analytics, performance insights, review management
                  </p>
                </div>
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Chat Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="bg-secondary/50 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm text-foreground">
                    {selectedMode === "customer"
                      ? "Hi! I'm here to help you discover amazing restaurants and dishes. What are you craving today?"
                      : "Hello! I'm here to help with your business analytics and review management. How can I assist you?"}
                  </p>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button size="sm">Send</Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMode(null)}
                  className="w-full mt-2 text-xs"
                >
                  Switch Mode
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </>
  );
};

export default ChatbotButton;
