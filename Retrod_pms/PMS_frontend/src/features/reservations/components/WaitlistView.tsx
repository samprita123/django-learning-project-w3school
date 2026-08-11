import { Card, CardHeader, StatusBadge, Button } from "@/components/ui/Primitives";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from "@tanstack/react-router";
import { useConvertWaitlistMutation } from "@/services/mock/queries";
import { format } from "date-fns";

export function WaitlistView({ entries }: { entries: any[] }) {
  const navigate = useNavigate();
  const convertMutation = useConvertWaitlistMutation();
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!convertingId) return;
    try {
      await convertMutation.mutateAsync(convertingId);
      toast.success("Waitlist entry successfully converted to reservation!");
      setConvertingId(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to convert waitlist entry.");
    }
  };

  const formatRequestedAt = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy HH:mm");
    } catch {
      return dateStr;
    }
  };

  if (!entries || entries.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-[14px] font-medium text-text-primary">No waitlist entries</p>
        <p className="mt-1 max-w-sm text-[13px] text-text-secondary">
          Guests waiting for availability will appear here.
        </p>
        <Button size="sm" className="mt-4" onClick={() => navigate({ to: "/reservations/new" })}>
          Add to waitlist
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Waitlist" hint={`${entries.length} guests waiting`} />
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface-2/40 text-left">
              {["ID", "Guest", "Dates", "Room type", "Priority", "Requested", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-border-subtle hover:bg-surface-2/50">
                <td className="px-4 py-3 font-mono text-[12px]">
                  {e.wl_number}
                </td>
                <td className="px-4 py-3 font-medium text-text-primary">
                  {e.guest_name}
                </td>
                <td className="px-4 py-3 text-text-secondary">{e.dates_display}</td>
                <td className="px-4 py-3 text-text-secondary">{e.room_type_display}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={e.priority_display === "High" ? "warning" : "neutral"}>
                    {e.priority_display}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3 text-text-secondary">{formatRequestedAt(e.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setConvertingId(e.id)}
                    className="text-[12px] font-medium text-primary hover:underline cursor-pointer"
                  >
                    Convert
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!convertingId} onOpenChange={(open) => !open && setConvertingId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convert to Reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to convert this waitlist entry into an active reservation? This will remove it from the waitlist and allocate inventory.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConvertingId(null)}>Cancel</Button>
            <Button onClick={handleConvert} disabled={convertMutation.isPending}>
              {convertMutation.isPending ? "Converting..." : "Confirm Convert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

