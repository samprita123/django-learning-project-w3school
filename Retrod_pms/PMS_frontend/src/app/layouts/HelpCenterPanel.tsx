import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Send, Mail, Phone, MessageSquare, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

export function HelpCenterPanel({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [view, setView] = useState<"info" | "chat">("info");
  const [messages, setMessages] = useState<{sender: 'user' | 'support', text: string}[]>([
    { sender: 'support', text: 'Hi there! How can we help you today?' }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset view when reopened
  useEffect(() => {
    if (open) {
      setView("info");
    }
  }, [open]);

  if (!open || !mounted) return null;

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages([...messages, { sender: 'user', text: inputValue }]);
    setInputValue("");
    // Simulate reply
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'support', text: 'Thanks for reaching out! Our team will get back to you shortly.' }]);
    }, 1000);
  };

  const content = (
    <div className="fixed bottom-4 right-4 z-[9999] w-80 shadow-2xl flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between bg-primary p-4 text-primary-foreground">
        <div className="flex items-center gap-2">
          {view === "chat" && (
            <button onClick={() => setView("info")} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <h3 className="font-semibold text-[14px]">Retrod Support</h3>
        </div>
        <button onClick={() => onOpenChange(false)} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {view === "info" ? (
        <div className="flex flex-col p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-text-secondary">
              <div className="bg-surface-2 p-2 rounded-full">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Email Support</span>
                <span className="text-[14px] text-text-primary">support@retrodtech.com</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <div className="bg-surface-2 p-2 rounded-full">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider font-semibold">Phone Support</span>
                <span className="text-[14px] text-text-primary">+1 81180 31833</span>
              </div>
            </div>
          </div>
          
          <Button onClick={() => setView("chat")} className="w-full py-5 text-[14px] flex items-center justify-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Start Chat
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 p-4 overflow-y-scroll max-h-[350px] flex flex-col gap-3 bg-surface">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg max-w-[85%] text-[13px] ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-surface-2 text-text-primary'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-border bg-surface flex gap-2 items-center">
            <input 
              placeholder="Type a message..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-[13px] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Button onClick={handleSend} className="shrink-0 h-9 w-9 p-0 flex items-center justify-center">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return createPortal(content, document.body);
}

