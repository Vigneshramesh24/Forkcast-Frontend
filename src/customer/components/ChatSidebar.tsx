import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/shared/integrations/supabase/client";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

// ChatSidebar: hidden until left-edge hover, only for authenticated users.
export default function ChatSidebar() {
  const [open, setOpen] = useState(false);
  const [allowed, setAllowed] = useState(false); // whether user is authenticated
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) setAllowed(true);
        else setAllowed(false);
      } catch (e) {
        setAllowed(false);
      }
    };
    check();

    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setAllowed(Boolean(session?.user));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput("");
    setLoading(true);
    // add user message and assistant placeholder
    setMessages((m) => [...m, { role: "user", content: msg }, { role: "assistant", content: "" }]);

    try {
      // include supabase auth token so the Edge Function can validate the user
      const { data } = await supabase.auth.getSession();
      const token = (data as any)?.session?.access_token;

      const CHAT_ENDPOINT = import.meta.env.VITE_CHAT_FUNCTION_URL ?? "/api/chat";
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        // server expects an array of messages
        body: JSON.stringify({ messages: [{ role: "user", content: msg }] }),
      });
      // if server returned JSON error (non-stream), surface it
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const err = await res.json();
          setMessages((m) => [...m, { role: "assistant", content: `Error: ${err?.error ?? JSON.stringify(err)}` }]);
        } else {
          const t = await res.text();
          setMessages((m) => [...m, { role: "assistant", content: `Error: ${t}` }]);
        }
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const t = await res.text();
        setMessages((m) => [...m, { role: "assistant", content: `Error: ${t}` }]);
        return;
      }

  const reader = res.body?.getReader();
      if (!reader) {
        setMessages((m) => [...m, { role: "assistant", content: "No stream available" }]);
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let assistant = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistant += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          for (let i = copy.length - 1; i >= 0; i--) {
            if (copy[i].role === "assistant") {
              copy[i] = { role: "assistant", content: assistant };
              break;
            }
          }
          return copy;
        });
      }
    } catch (e) {
      console.error(e);
      setMessages((m) => [...m, { role: "assistant", content: "Error: chat failed" }]);
    } finally {
      setLoading(false);
    }
  };

  // don't render anything if user isn't authenticated
  if (!allowed) return null;

  return (
    <>
      {/* left-edge hotspot */}
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="fixed left-0 top-0 h-full z-50"
        style={{ width: 8 }}
        aria-hidden
      />

      {/* sliding panel: use translate-x for smooth motion */}
      <div
        className={`fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out flex flex-col w-[360px] ${open ? "translate-x-0" : "-translate-x-full pointer-events-none"}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-hidden={!open}
      >
        <Card className="h-full w-[360px] flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <div className="font-semibold">Assistant</div>
              <div className="text-xs text-muted-foreground">Ask any questions and we will answer</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              ×
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="p-3 rounded bg-slate-50 text-sm text-muted-foreground">Ask any questions and we will answer — try "Find nearby pizza"</div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`p-2 rounded ${m.role === "user" ? "bg-slate-100 self-end" : "bg-slate-50"}`}>
                  <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </div>

          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !loading && send()} placeholder="Ask me about restaurants, menus, or tips" className="flex-1" />
              <Button onClick={() => send()} disabled={loading}>{loading ? "..." : "Send"}</Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
