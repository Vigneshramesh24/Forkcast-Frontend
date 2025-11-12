import React, { useEffect, useState, useRef } from "react";
import ChatbotPanel from "./ChatbotPanel";
import { Button } from "@/shared/components/ui/button";

export default function BusinessChatSidebar() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // close when clicking outside
      if (open && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  return (
    <>
      {/* Left-edge hotspot */}
      <div
        onMouseEnter={() => setOpen(true)}
        className="fixed left-0 top-0 h-full z-[9999]"
        style={{ width: 8 }}
        aria-hidden
      />

      {/* Sliding panel */}
      <div
        ref={containerRef}
        className={`fixed left-0 top-0 h-full z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col w-[420px] ${open ? "translate-x-0" : "-translate-x-full pointer-events-none"}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-hidden={!open}
      >
        {/* opaque outer wrapper so navbar doesn't show through rounded areas */}
        <div className="h-full w-[420px] flex flex-col bg-card text-card-foreground overflow-hidden shadow-lg">
          <div className="p-3 border-b flex items-center justify-between bg-transparent">
            <div className="font-semibold">Assistant</div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>×</Button>
          </div>
          <div className="h-full">
            <ChatbotPanel />
          </div>
        </div>
      </div>
    </>
  );
}
