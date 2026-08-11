import { Send } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Primitives";

export function AssistantPanel() {
  return (
    <Card className="flex h-fit flex-col">
      <CardHeader title="Assistant" hint="⌘J to summon" />
      <div className="flex-1 space-y-3 p-5">
        <Msg
          from="ai"
          text="Good morning, Aarav. I noticed weekend demand is climbing. Want a pricing summary?"
        />
        <Msg from="me" text="Yes, and include competitor parity for Deluxe rooms." />
        <Msg
          from="ai"
          text="Across 4 comp-set hotels, your Deluxe King is priced 11% below the median. A ₹1,800 uplift maintains parity while preserving conversion."
        />
      </div>
      <div className="border-t border-border-subtle p-3">
        <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 focus-within:border-primary">
          <input
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-text-disabled"
            placeholder="Ask anything about your property…"
          />
          <button className="rounded-md bg-primary p-1.5 text-primary-foreground hover:bg-primary-pressed transition">
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
}

function Msg({ from, text }: { from: "ai" | "me"; text: string }) {
  return (
    <div
      className={`max-w-[90%] rounded-md px-3 py-2 text-[12px] leading-snug transition ${
        from === "ai"
          ? "bg-surface-2 text-text-primary"
          : "ml-auto bg-primary text-primary-foreground"
      }`}
    >
      {from === "ai" && (
        <div className="mb-0.5 text-[9px] font-medium uppercase tracking-wider text-primary-pressed">
          Retrod AI
        </div>
      )}
      {text}
    </div>
  );
}
export default AssistantPanel;
