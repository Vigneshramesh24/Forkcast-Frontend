import { Plus, Send } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/shared/integrations/supabase/client";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

const ChatbotPanel = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Can you show me what you can do?",
      sender: "user",
    },
    {
      id: "2",
      text: "Absolutely! Pass me any data, images, or whatever you'd like, and I can visualize it for you and give you recommendations!",
      sender: "bot",
    },
    {
      id: "3",
      text: "That sounds great! Can you analyze my sales data from last quarter?",
      sender: "user",
    },
    {
      id: "4",
      text: "Of course! I can help you analyze your sales trends, identify patterns, and provide actionable insights. Just share your data with me.",
      sender: "bot",
    },
    {
      id: "5",
      text: "What kind of visualizations can you create?",
      sender: "user",
    },
    {
      id: "6",
      text: "I can create various charts and graphs including bar charts, line graphs, pie charts, heatmaps, and more. I'll choose the best visualization based on your data type and what you want to discover.",
      sender: "bot",
    },
    {
      id: "7",
      text: "Can you also provide recommendations based on the data?",
      sender: "user",
    },
    {
      id: "8",
      text: "Absolutely! I analyze your data to identify trends, anomalies, and opportunities. I'll provide actionable recommendations to help you make data-driven decisions.",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm analyzing your request. This is a demo response showing how the chat interface works.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-chat-bg rounded-2xl p-8 min-h-0">
      {/* Chat Messages */}
      <div className="flex-1 mb-4 overflow-hidden min-h-0">
        <ScrollArea className="h-full pr-2">
          <div className="space-y-5">
          {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-5 py-3.5 ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-[20px] rounded-tr-md"
                  : "bg-card text-card-foreground shadow-sm rounded-[20px] rounded-tl-md border border-border/50"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Bar - sticky and raised */}
      <div className="sticky bottom-0 left-0 right-0 flex justify-center pt-2">
        <div className="flex items-center gap-3 bg-card border-2 border-primary/20 rounded-full px-3 py-2 shadow-lg w-11/12 max-w-3xl">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full hover:bg-primary/10 transition-smooth flex-shrink-0"
          >
            <Plus className="h-5 w-5 text-primary" strokeWidth={2.5} />
          </Button>
          
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="What would you like me to analyze?"
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground bg-transparent text-sm px-2"
          />
          
          <Button 
            size="icon" 
            onClick={handleSend}
            className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 transition-smooth flex-shrink-0"
          >
            <Send className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPanel;
