import { Plus, Send } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";
import { useBusinessData } from "@/business/lib/BusinessDataContext";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

const ChatbotPanel = () => {
  // Start with an empty conversation (no placeholder/demo messages)
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { report } = useBusinessData();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const text = inputValue.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
    };

    // append user's message
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // show a temporary 'thinking' bot message
    const thinkingId = `bot-${Date.now()}`;
    const thinkingMessage: Message = { id: thinkingId, text: "Analyzing...", sender: "bot" };
    setMessages((prev) => [...prev, thinkingMessage]);

    // Call the /chat endpoint
    (async () => {
      try {
        const form = new FormData();
        form.append('question', text);
        
        // Get uploaded PDFs if any (from the report upload)
        // Note: In this setup, we're passing the question only since PDFs are 
        // already on the backend after /extract-json was called
        
        const res = await fetch("http://127.0.0.1:8000/chat", {
          method: 'POST',
          body: form,
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const answer = data.answer || data.text || 'No answer provided.';
        
        setMessages((prev) => prev.map((m) => (m.id === thinkingId ? { ...m, text: String(answer) } : m)));
      } catch (err) {
        console.error('Chat error:', err);
        setMessages((prev) => prev.map((m) => (m.id === thinkingId ? { ...m, text: 'Sorry, I could not reach the API server. Ensure it is running at http://127.0.0.1:8000' } : m)));
      }
    })();
  };

  if (!report) {
    return (
      <div className="h-full flex items-center justify-center bg-chat-bg rounded-2xl p-8">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">Upload a JSON or PDF report</div>
          <div className="text-sm text-muted-foreground">Once uploaded, you can chat with your data here.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-chat-bg rounded-2xl p-8 min-h-0">
      {/* Chat Messages */}
      <div className="flex-1 mb-4 overflow-hidden min-h-0">
        <ScrollArea className="h-full pr-2">
          <div className="space-y-5">
            {/* Show centered header when chat is empty and user hasn't typed yet */}
            {messages.length === 0 && inputValue.trim() === "" ? (
              <div className="w-full h-full flex items-center justify-center py-6">
                <div className="text-center">
                  <div className="text-xl font-bold">AI Powered Chatbot</div>
                  <div className="text-sm text-muted-foreground mt-2">Ask me anything — start by typing below</div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
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
              ))
            )}
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
