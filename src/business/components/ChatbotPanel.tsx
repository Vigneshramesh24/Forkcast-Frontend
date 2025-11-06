import { Plus, Send } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/shared/integrations/supabase/client";
import { useToast } from "@/shared/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  fileName?: string; // Optional filename for messages with attachments
}

const ChatbotPanel = ({ isClosed = false }: { isClosed?: boolean } = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() && !selectedFile) return;

    // If there's a file but no input, automatically add a prompt to analyze it
    const promptText = inputValue.trim() || (selectedFile ? `Analyze this ${selectedFile.name.endsWith('.csv') ? 'CSV' : 'PDF'} file and create relevant charts and statistics` : "");
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: promptText,
      sender: "user",
      fileName: selectedFile ? selectedFile.name : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // If there's a selected file, upload to Supabase storage and send to the chat function
    if (selectedFile) {
      try {
        // Show loading message
        setMessages((prev) => [...prev, { 
          id: Date.now().toString() + "-uploading", 
          text: `Uploading ${selectedFile.name}...`, 
          sender: "bot" 
        }]);

        const storagePath = `uploads/${Date.now()}_${selectedFile.name}`;
        const { data, error: uploadError } = await supabase.storage.from("uploads").upload(storagePath, selectedFile, { upsert: false });
        
        if (uploadError) {
          console.error("Upload error:", uploadError);
          // Provide helpful error messages based on error type
          if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('does not exist') || uploadError.message?.includes('not allowed')) {
            throw new Error(`Storage bucket 'uploads' not found or not accessible. Please create it in your Supabase dashboard (Storage → Create bucket) and ensure it allows authenticated uploads.`);
          } else if (uploadError.message?.includes('new row violates row-level security') || uploadError.message?.includes('permission') || uploadError.message?.includes('policy')) {
            throw new Error(`Permission denied. Please check your storage bucket policies in Supabase (Storage → uploads → Policies).`);
          } else {
            throw new Error(`Failed to upload file: ${uploadError.message || 'Unknown error'}`);
          }
        }

        if (!data || !data.path) {
          throw new Error("Upload succeeded but no file path returned");
        }

        const filePath = data.path;

        // Get session token to call server function
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          setMessages((prev) => [...prev, { id: Date.now().toString() + "-err", text: "Sign in required to analyze files.", sender: "bot" }]);
          setSelectedFile(null);
          return;
        }

        // Update uploading message to analyzing
        setMessages((prev) => prev.map(m => 
          m.id.endsWith("-uploading") 
            ? { ...m, text: `Analyzing ${selectedFile.name}...` }
            : m
        ));

        // Prepare messages for API: include user prompt and file link
        // Use "Attached file path:" prefix as expected by the backend
        const messagesForApi = [
          { role: "user", content: userMessage.text },
          { role: "user", content: `Attached file path: ${filePath}` },
        ];

        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messages: messagesForApi }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("AI request failed:", res.status, errorText);
          // Remove analyzing message
          setMessages((prev) => prev.filter(m => !m.id.endsWith("-uploading")));
          throw new Error(`AI request failed: ${res.status} ${errorText}`);
        }

        if (!res.body) {
          setMessages((prev) => prev.filter(m => !m.id.endsWith("-uploading")));
          throw new Error("AI response has no body");
        }

        // Remove analyzing message and start streaming
        setMessages((prev) => prev.filter(m => !m.id.endsWith("-uploading")));

        // Stream the response and append to messages
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantText = "";

        // Add placeholder bot message to update as we stream
        setMessages((prev) => [...prev, { id: Date.now().toString() + "-pending", text: "", sender: "bot" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let nlIndex: number;
          while ((nlIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, nlIndex);
            buffer = buffer.slice(nlIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantText += content;
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = { ...copy[copy.length - 1], text: assistantText };
                  return copy;
                });
              }
            } catch {
              // ignore parse errors
            }
          }
        }

        // After streaming completes, attempt to extract analysis JSON from assistantText
        try {
          // Look for JSON blocks that might contain analysis data
          const jsonMatches = assistantText.match(/\{[\s\S]*?\}/g);
          if (jsonMatches) {
            for (const jsonStr of jsonMatches) {
              try {
                const parsed = JSON.parse(jsonStr);
                // Check if it's an analysis object with the expected structure
                if (parsed && (parsed.type === 'chart' || parsed.type === 'statistics')) {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('ai:analysis', { detail: parsed }));
                  }
                }
              } catch (e) {
                // not valid JSON, continue
              }
            }
          }
        } catch (e) {
          // ignore
        }

        // Clear file selection after successful analysis
        setSelectedFile(null);
        return;
      } catch (err) {
        console.error("File upload / AI error", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to analyze file.";
        setMessages((prev) => {
          // Remove uploading message if still present
          const filtered = prev.filter(m => !m.id.endsWith("-uploading"));
          return [...filtered, { 
            id: Date.now().toString() + "-err", 
            text: `Failed to analyze file: ${errorMessage}. Please check if you're signed in and try again.`, 
            sender: "bot" 
          }];
        });
        toast({
          title: "Analysis failed",
          description: errorMessage,
          variant: "destructive",
        });
        setSelectedFile(null);
        return;
      }
    }

    // No file attached: call server chat function and stream response
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setMessages((prev) => [...prev, { id: Date.now().toString() + "-err", text: "Sign in required to use the AI.", sender: "bot" }]);
        return;
      }

      // Build messages array for API: include prior conversation + latest user message
      const apiMessages = [
        ...messages.map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
        { role: 'user', content: userMessage.text },
      ];

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok || !res.body) {
        throw new Error('AI request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';

      setMessages((prev) => [...prev, { id: Date.now().toString() + '-pending', text: '', sender: 'bot' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nlIndex: number;
        while ((nlIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, nlIndex);
          buffer = buffer.slice(nlIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantText += content;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { ...copy[copy.length - 1], text: assistantText };
                return copy;
              });
            }
          } catch {
            // ignore parse errors
          }
        }
      }

      // Attempt to extract analysis JSON and dispatch event
      try {
        const jsonMatches = assistantText.match(/\{[\s\S]*?\}/g);
        if (jsonMatches) {
          for (const jsonStr of jsonMatches) {
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed && (parsed.type === 'chart' || parsed.type === 'statistics')) {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('ai:analysis', { detail: parsed }));
                }
              }
            } catch (e) {
              // not valid JSON, continue
            }
          }
        }
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [...prev, { id: Date.now().toString() + '-err', text: 'Failed to get response. Please try again.', sender: 'bot' }]);
    }
  };

  // api key UI removed: server-side stored key will be used automatically

  return (
    <div className="h-full relative flex flex-col bg-chat-bg rounded-2xl pt-8 pr-8 pl-8 min-h-0">
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
              {message.fileName && (
                <p className="text-xs opacity-80 mb-1.5 font-medium">{message.fileName}</p>
              )}
              <p className="text-sm leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

  {/* File preview (shows when a file is selected) - positioned above chat bar */}
      {selectedFile && (
        <div className="absolute bottom-16 left-5 right-5 flex justify-center z-10">
          <div className="w-full max-w-[84rem] bg-card border border-border/50 rounded-lg px-4 py-2 flex items-center gap-3 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-foreground truncate flex-1">{selectedFile.name}</span>
            <span className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
            <button 
              onClick={() => setSelectedFile(null)} 
              className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input Bar - much lower, 75% height, wider with balanced margins */}
      <div className="absolute bottom-5 left-5 right-5 flex justify-center">
  <div className={`flex items-center bg-card rounded-full shadow-lg w-full max-w-[84rem] transition-all duration-500 ease-in-out ${isClosed ? 'translate-y-8 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`} style={{ height: '2.5rem' }}>
          {/* left button flush with left rounded end */}
          <div className="pl-3 pr-2 flex items-center">
            <button onClick={() => fileInputRef.current?.click()} className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer">
              <Plus className="text-primary" style={{ height: '1rem', width: '1rem' }} strokeWidth={1.5} />
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              className="hidden" 
              accept=".csv,.pdf,text/csv,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const isCSV = file.name.endsWith('.csv') || file.type === 'text/csv';
                  const isPDF = file.name.endsWith('.pdf') || file.type === 'application/pdf';
                  if (isCSV || isPDF) {
                    setSelectedFile(file);
                  } else {
                    toast({
                      title: "Invalid file type",
                      description: "Please upload a CSV or PDF file.",
                      variant: "destructive",
                    });
                  }
                }
              }} 
            />
          </div>

          <div className="flex-1 px-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="What would you like me to analyze?"
              className="w-full min-w-0 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground bg-transparent text-sm px-3"
              style={{ height: '2.5rem' }}
            />
          </div>

          {/* right button flush with right rounded end */}
          <div className="pr-3 pl-2 flex items-center">
            <Button
              size="icon"
              onClick={handleSend}
              aria-label="Send message"
              className="flex-shrink-0 cursor-pointer h-8 w-8 rounded-full text-white flex items-center justify-center"
              style={{ height: '2rem', width: '2rem', backgroundColor: '#e74a3c' }}
            >
              <Send className="" style={{ height: '1rem', width: '1rem' }} strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPanel;
