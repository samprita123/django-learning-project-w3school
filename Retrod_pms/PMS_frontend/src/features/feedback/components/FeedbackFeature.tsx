import { useState } from "react";
import {
  PageHeader,
  KpiCard,
  Card,
  CardHeader,
  StatusBadge,
  Button,
} from "@/components/ui/Primitives";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useFeedbackEntriesQuery } from "@/services/mock/queries";
import { type FeedbackEntry } from "@/types/pms";
import { toast } from "sonner";

export function FeedbackFeature() {
  const { data: feedbackEntries = [] } = useFeedbackEntriesQuery();
  
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackEntry | null>(null);
  const [responseText, setResponseText] = useState("");

  const open = feedbackEntries.filter((f) => f.status !== "Resolved").length;
  const nps = Math.round(
    (feedbackEntries.reduce((a, f) => a + f.score, 0) / Math.max(1, feedbackEntries.length)) * 10,
  );

  const handleSendResponse = (markResolved: boolean) => {
    if (!responseText.trim()) {
      toast.error("Please enter a response.");
      return;
    }
    
    // Mock sending logic
    toast.success(`Response sent to ${selectedFeedback?.guest}`);
    if (markResolved) {
      toast.success("Feedback marked as resolved.");
    }
    
    setSelectedFeedback(null);
    setResponseText("");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Guests"
        title="Guest Feedback"
        description="Surveys, reviews, and complaint recovery."
      />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="NPS proxy" value={String(nps)} accent="brand" />
          <KpiCard label="Open complaints" value={String(open)} accent="warning" />
          <KpiCard label="Avg resolution" value="4.2h" accent="info" />
          <KpiCard label="Review rating" value="4.6" accent="success" />
        </div>
        <Card>
          <CardHeader title="Feedback inbox" hint={`${feedbackEntries.length} items`} />
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface-2/40 text-left">
                {["ID", "Guest", "Channel", "Score", "Category", "Severity", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {feedbackEntries.map((f) => (
                <tr key={f.id} className="border-b border-border-subtle hover:bg-surface-2/50">
                  <td className="px-4 py-3 font-mono text-[12px]">{f.id}</td>
                  <td className="px-4 py-3 font-medium">{f.guest}</td>
                  <td className="px-4 py-3 text-text-secondary">{f.channel}</td>
                  <td className="px-4 py-3 font-mono">{f.score}/10</td>
                  <td className="px-4 py-3">{f.category}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={
                        f.severity === "High"
                          ? "error"
                          : f.severity === "Medium"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {f.severity}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={f.status === "Resolved" ? "success" : "info"}>
                      {f.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedFeedback(f);
                        setResponseText("");
                      }}
                    >
                      Respond
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {selectedFeedback && (
        <Sheet open={!!selectedFeedback} onOpenChange={(isOpen) => !isOpen && setSelectedFeedback(null)}>
          <SheetContent className="flex w-full flex-col sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Respond to Feedback</SheetTitle>
              <SheetDescription>
                Compose a response to {selectedFeedback.guest} regarding their {selectedFeedback.channel} feedback.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-4 py-6">
              <div className="rounded-md border border-border bg-surface-2/30 p-4 text-[13px]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-text-primary">{selectedFeedback.guest}</span>
                  <StatusBadge tone={selectedFeedback.score >= 8 ? "success" : selectedFeedback.score >= 5 ? "warning" : "error"}>
                    Score: {selectedFeedback.score}/10
                  </StatusBadge>
                </div>
                <div className="text-text-secondary">
                  Category: {selectedFeedback.category}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-medium text-text-primary">Your Response</label>
                <textarea
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none placeholder:text-text-disabled focus:border-primary min-h-[200px]"
                  placeholder={`Hi ${selectedFeedback.guest.split(' ')[0]},\n\nThank you for your feedback...`}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                />
              </div>
            </div>
            <SheetFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setSelectedFeedback(null)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => handleSendResponse(false)}>
                Send Only
              </Button>
              <Button variant="primary" onClick={() => handleSendResponse(true)}>
                Send & Resolve
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
export default FeedbackFeature;
