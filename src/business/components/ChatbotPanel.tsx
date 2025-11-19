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
  const { ragSearch, totalRevenue, revenueByDate, report } = useBusinessData();

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

    // show a temporary 'thinking' bot message and then replace it with a synthesized reply
    const thinkingId = `bot-${Date.now()}`;
    const thinkingMessage: Message = { id: thinkingId, text: "Analyzing...", sender: "bot" };
    setMessages((prev) => [...prev, thinkingMessage]);

    // If remote Q&A endpoint configured and we have a report session, call it; else fallback to RAG
    const formatCurrency = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const q = text.toLowerCase();
    const qaUrl = (import.meta as any).env?.VITE_REPORT_QA_URL as string | undefined;
    const sessionId = localStorage.getItem('business_report_session_id');

    const fallbackRag = () => {
      let botText = "";
      try {
        if (q.includes("total") && q.includes("revenue")) {
          const total = totalRevenue();
          botText = `Total revenue across uploaded rows is ${formatCurrency(total)}.`;
        } else if (q.includes("revenue by date") || q.includes("by date") || q.includes("trend") || q.includes("sales trend")) {
          const byDate = revenueByDate();
          if (byDate.length === 0) {
            botText = "I don't have any uploaded sales data yet. Upload a JSON/PDF report on the right.";
          } else {
            const sample = byDate.slice(-5).map((d) => `${d.date}: ${formatCurrency(d.revenue)}`).join(', ');
            botText = `I have ${byDate.length} date buckets. Recent examples — ${sample}.`;
          }
        } else if (q.match(/sales on|sales for|revenue on|revenue for/)) {
          const rows = ragSearch(text);
          if (rows.length === 0) botText = `I couldn't find sales for that date or query.`;
          else {
            const summed = rows.reduce((s, r) => s + (r.revenue || 0), 0);
            botText = `Found ${rows.length} rows matching. Total: ${formatCurrency(summed)}. Example: ${rows
              .slice(0, 3)
              .map((r) => `${r.date} ${formatCurrency(r.revenue)}`)
              .join(' ; ')}`;
          }
        } else {
          const rows = ragSearch(text);
          if (rows.length === 0) botText = `I couldn't find data matching "${text}". Try queries like "total revenue", "sales on 2025-01-15", or "revenue trend".`;
          else
            botText = `I found ${rows.length} matching rows. Sample: ${rows
              .slice(0, 3)
              .map((r) => `${r.date} ${formatCurrency(r.revenue)}`)
              .join(' ; ')}`;
        }
      } catch (e) {
        botText = "Sorry, I couldn't analyze the data — please try again.";
      }
      setTimeout(() => {
        setMessages((prev) => prev.map((m) => (m.id === thinkingId ? { ...m, text: botText } : m)));
      }, 400);
    };

    if (!qaUrl || !sessionId) {
      // No endpoint configured yet or no session context — fallback
      fallbackRag();
      return;
    }

    (async () => {
      try {
        const res = await fetch(qaUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: text, session_id: sessionId }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const answer = data.answer || data.text || data.message || 'No answer provided.';
        setMessages((prev) => prev.map((m) => (m.id === thinkingId ? { ...m, text: String(answer) } : m)));
      } catch (e) {
        setMessages((prev) => prev.map((m) => (m.id === thinkingId ? { ...m, text: 'Endpoint unavailable — using local analysis.' } : m)));
        fallbackRag();
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
