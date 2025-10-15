import { useState, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<"customer" | "business" | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        
        if (roles?.role === "business_owner") {
          setUserRole("business");
          setMessages([{ role: "assistant", content: "Hello! I'm here to help with your business analytics and review management. How can I assist you?" }]);
        } else {
          setUserRole("customer");
          setMessages([{ role: "assistant", content: "Hi! I'm here to help you discover amazing restaurants and dishes. What are you craving today?" }]);
        }
      }
    };
    
    if (isOpen) {
      checkUserRole();
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = { role: "user", content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    
    // Placeholder for AI response - will integrate with OpenAI later
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm processing your request. Full AI integration coming soon!" 
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg z-50 transition-transform",
          isOpen && "scale-0"
        )}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Modal */}
      {isOpen && (
        <Card
          className="fixed bottom-6 left-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">
                {userRole === "business" ? "Business Assistant" : "Customer Assistant"}
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

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col">
            {/* Chat Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "rounded-lg p-3 max-w-[80%]",
                    msg.role === "assistant"
                      ? "bg-secondary/50 self-start"
                      : "bg-primary text-primary-foreground self-end ml-auto"
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatbotButton;
