import { useState, useEffect } from "react";
import { Download, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Primitives";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface ReportViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string | null;
}

type ReportData = {
  columns: string[];
  rows: (string | number | React.ReactNode)[][];
};

function getReportMockData(reportTitle: string): ReportData {
  switch (reportTitle) {
    // Night Audit & Financials
    case "Manager's Flash Report":
      return {
        columns: ["Metric", "Today", "MTD (Month-To-Date)", "YTD (Year-To-Date)"],
        rows: [
          ["Rooms Available", "120", "3,600", "43,800"],
          ["Rooms Occupied", "94", "2,840", "32,150"],
          ["Occupancy %", "78.33%", "78.88%", "73.40%"],
          ["ADR", "₹12,450", "₹11,820", "₹10,950"],
          ["RevPAR", "₹9,752", "₹9,323", "₹8,037"],
          ["Room Revenue", "₹11,70,300", "₹3,35,68,800", "₹35,20,42,500"],
          ["F&B Revenue", "₹4,20,500", "₹1,12,40,000", "₹12,50,00,000"],
          ["Total Revenue", "₹15,90,800", "₹4,48,08,800", "₹47,70,42,500"],
        ]
      };
    case "Trial Balance":
      return {
        columns: ["Ledger Type", "Opening Balance", "Today's Debits", "Today's Credits", "Closing Balance"],
        rows: [
          ["Guest Ledger", "₹4,50,200", "₹15,90,800", "₹12,40,000", "₹8,01,000"],
          ["City Ledger", "₹12,40,500", "₹2,50,000", "₹1,20,000", "₹13,70,500"],
          ["Advanced Deposit", "₹8,90,000", "₹1,00,000", "₹3,50,000", "₹6,40,000"],
          ["Total", "₹25,80,700", "₹19,40,800", "₹17,10,000", "₹28,11,500"],
        ]
      };
    case "Tax & GST Liability":
      return {
        columns: ["Date", "Tax Code", "Tax Rate", "Taxable Amount", "CGST", "SGST", "Total Tax"],
        rows: [
          ["Today", "GST_12", "12%", "₹4,20,000", "₹25,200", "₹25,200", "₹50,400"],
          ["Today", "GST_18", "18%", "₹11,70,000", "₹1,05,300", "₹1,05,300", "₹2,10,600"],
          ["MTD", "GST_12", "12%", "₹1,10,00,000", "₹6,60,000", "₹6,60,000", "₹13,20,000"],
          ["MTD", "GST_18", "18%", "₹3,30,00,000", "₹29,70,000", "₹29,70,000", "₹59,40,000"],
        ]
      };
    case "Shift Collections":
      return {
        columns: ["Date", "Cashier", "Shift", "Payment Method", "Total Collected", "Total Refunded", "Net Collection"],
        rows: [
          ["Today", "Alice S.", "Morning", "Credit Card", "₹4,50,000", "₹12,000", "₹4,38,000"],
          ["Today", "Alice S.", "Morning", "Cash", "₹45,000", "₹0", "₹45,000"],
          ["Today", "Bob M.", "Evening", "Credit Card", "₹2,10,000", "₹0", "₹2,10,000"],
          ["Today", "Bob M.", "Evening", "UPI", "₹85,000", "₹5,000", "₹80,000"],
        ]
      };
    case "City Ledger & AR":
      return {
        columns: ["Account Name", "Account No", "0-30 Days", "31-60 Days", "61-90 Days", "90+ Days", "Total Balance"],
        rows: [
          ["TCS Corporate", "AR-1001", "₹4,50,000", "₹1,20,000", "₹0", "₹0", "₹5,70,000"],
          ["MakeMyTrip", "AR-2045", "₹8,90,000", "₹2,40,000", "₹50,000", "₹0", "₹11,80,000"],
          ["Infosys Ltd", "AR-1042", "₹1,20,000", "₹0", "₹0", "₹0", "₹1,20,000"],
          ["Agoda", "AR-2088", "₹3,40,000", "₹1,10,000", "₹45,000", "₹12,000", "₹5,07,000"],
        ]
      };

    // Front Office & Reception
    case "Expected Arrivals":
      return {
        columns: ["Res ID", "Guest Name", "VIP", "Room Type", "Room No", "Pax (A/C)", "Balance"],
        rows: [
          ["#R-10042", "John Doe", "No", "Deluxe King", "204", "2/0", "₹0"],
          ["#R-10043", "Sarah Smith", "VIP 1", "Suite", "401", "1/0", "₹5,400"],
          ["#R-10044", "Rajesh Kumar", "No", "Standard Twin", "Unassigned", "2/1", "₹12,000"],
          ["#R-10045", "Emily Davis", "No", "Deluxe King", "310", "1/0", "₹0"],
        ]
      };
    case "Expected Departures":
      return {
        columns: ["Room No", "Guest Name", "VIP", "Arrival", "Departure", "Folio Balance", "Payment Method"],
        rows: [
          ["105", "Michael Scott", "No", "24-Jun", "26-Jun", "₹4,500", "Credit Card"],
          ["212", "Jim Halpert", "No", "22-Jun", "26-Jun", "₹0", "Prepaid"],
          ["304", "Pam Beesly", "VIP 2", "20-Jun", "26-Jun", "₹12,400", "Pending"],
          ["405", "Dwight Schrute", "No", "25-Jun", "26-Jun", "₹800", "Cash"],
        ]
      };
    case "In-House Guests":
      return {
        columns: ["Room No", "Guest Name", "Pax (A/C)", "Arrival", "Departure", "Rate Code", "Daily Rate", "Balance"],
        rows: [
          ["101", "Angela Martin", "1/0", "25-Jun", "28-Jun", "CORP10", "₹8,500", "₹17,000"],
          ["102", "Kevin Malone", "2/0", "25-Jun", "27-Jun", "BAR", "₹12,000", "₹24,000"],
          ["205", "Oscar Martinez", "1/0", "26-Jun", "30-Jun", "OTA_BK", "₹9,500", "₹0"],
          ["310", "Stanley Hudson", "2/1", "24-Jun", "29-Jun", "BAR", "₹14,000", "₹42,000"],
        ]
      };
    case "No-Show & Cancellations":
      return {
        columns: ["Res ID", "Guest Name", "Arrival", "Status", "Cancel Date", "Reason", "Penalty Fee"],
        rows: [
          ["#R-09982", "Toby Flenderson", "25-Jun", "No-Show", "-", "-", "₹12,000"],
          ["#R-10005", "Kelly Kapoor", "26-Jun", "Cancelled", "25-Jun", "Flight Delay", "₹0"],
          ["#R-10012", "Ryan Howard", "26-Jun", "Cancelled", "20-Jun", "Change of plans", "₹0"],
        ]
      };
    case "Police / Immigration Export":
      return {
        columns: ["Passport No", "Guest Name", "Nationality", "DOB", "Visa No", "Room No", "Arrival", "Departure"],
        rows: [
          ["P8923441", "David Wallace", "USA", "12-May-1975", "V998234", "402", "25-Jun", "30-Jun"],
          ["L2349088", "Jan Levinson", "USA", "04-Aug-1978", "V112344", "405", "26-Jun", "29-Jun"],
          ["K9982333", "Todd Packer", "UK", "19-Nov-1970", "V887344", "210", "24-Jun", "27-Jun"],
        ]
      };

    // Housekeeping & Maintenance
    case "Room Discrepancy":
      return {
        columns: ["Room No", "Room Type", "PMS Status (FO)", "HK Status", "Discrepancy Type", "Persons"],
        rows: [
          ["101", "Deluxe King", "Occupied", "Vacant Dirty", "Skip", "1"],
          ["205", "Standard Twin", "Vacant", "Occupied Clean", "Sleep", "0"],
          ["310", "Suite", "Occupied", "Occupied Dirty", "None", "2"],
          ["402", "Deluxe King", "Vacant", "Vacant Clean", "None", "0"],
        ]
      };
    case "OOO / OOS Log":
      return {
        columns: ["Room No", "Room Type", "Status", "Start Date", "End Date", "Reason", "Remarks"],
        rows: [
          ["108", "Deluxe King", "OOO", "24-Jun", "28-Jun", "Plumbing Leak", "Awaiting parts"],
          ["302", "Suite", "OOS", "26-Jun", "27-Jun", "Deep Cleaning", "Carpet wash"],
          ["415", "Standard Twin", "OOO", "20-Jun", "30-Jun", "AC Malfunction", "Vendor contacted"],
        ]
      };
    case "Daily Task Assignment":
      return {
        columns: ["Attendant", "Zone/Floor", "Room No", "HK Status", "Task Type", "Credits"],
        rows: [
          ["Maria G.", "Floor 1", "101", "Occupied Dirty", "Stayover Clean", "1"],
          ["Maria G.", "Floor 1", "105", "Vacant Dirty", "Departure Clean", "1.5"],
          ["Rosa P.", "Floor 2", "210", "Vacant Dirty", "Departure Clean", "1.5"],
          ["Rosa P.", "Floor 2", "212", "Occupied Dirty", "Stayover Clean", "1"],
        ]
      };

    // Sales & Marketing
    case "Booking Pace":
      return {
        columns: ["Date", "OTB Rooms (TY)", "OTB Rooms (LY)", "Variance", "OTB Revenue (TY)", "OTB Revenue (LY)", "Var %"],
        rows: [
          ["26-Jun", "94", "88", "+6", "₹11,70,300", "₹9,80,000", "+19.4%"],
          ["27-Jun", "92", "85", "+7", "₹11,40,000", "₹9,50,000", "+20.0%"],
          ["28-Jun", "85", "90", "-5", "₹10,50,000", "₹11,00,000", "-4.5%"],
          ["29-Jun", "78", "75", "+3", "₹9,60,000", "₹8,90,000", "+7.8%"],
        ]
      };
    case "Source of Business":
      return {
        columns: ["Channel / Source", "Rooms Sold", "Room Revenue", "% of Total Rev", "ADR", "RevPAR", "LOS"],
        rows: [
          ["Direct Web", "450", "₹55,00,000", "35%", "₹12,222", "₹4,583", "2.4"],
          ["Booking.com", "320", "₹38,00,000", "24%", "₹11,875", "₹3,166", "2.1"],
          ["Expedia", "280", "₹32,00,000", "20%", "₹11,428", "₹2,666", "1.9"],
          ["Corporate", "180", "₹24,00,000", "15%", "₹13,333", "₹2,000", "3.2"],
          ["Walk-In", "90", "₹9,00,000", "6%", "₹10,000", "₹750", "1.1"],
        ]
      };
    case "Market Segmentation":
      return {
        columns: ["Market Segment", "Rooms Sold", "Room Revenue", "% of Total Rev", "ADR", "Pax"],
        rows: [
          ["Retail (BAR)", "680", "₹81,00,000", "42%", "₹11,911", "1420"],
          ["Corporate / Negotiated", "340", "₹45,00,000", "23%", "₹13,235", "410"],
          ["OTA / Third Party", "610", "₹70,00,000", "36%", "₹11,475", "1100"],
          ["Groups", "50", "₹6,00,000", "3%", "₹12,000", "100"],
        ]
      };

    // Point of Sale & F&B
    case "Meal Plan List":
      return {
        columns: ["Room No", "Guest Name", "Pax", "Meal Plan", "Breakfast Status", "Lunch Status", "Dinner Status", "Dietary Req."],
        rows: [
          ["101", "Angela Martin", "1", "BB (Bed & Breakfast)", "Pending", "-", "-", "Vegetarian"],
          ["102", "Kevin Malone", "2", "FB (Full Board)", "Consumed", "Pending", "Pending", "None"],
          ["205", "Oscar Martinez", "1", "HB (Half Board)", "Pending", "-", "Pending", "Vegan"],
          ["310", "Stanley Hudson", "3", "BB", "Consumed", "-", "-", "Gluten Free"],
        ]
      };
    case "POS Revenue":
      return {
        columns: ["Outlet Name", "Date", "Cash Sales", "Card Sales", "Room Charges", "Tax Collected", "Total Revenue", "Covers"],
        rows: [
          ["The Grand Buffet", "26-Jun", "₹45,000", "₹1,20,000", "₹2,10,000", "₹67,500", "₹4,42,500", "280"],
          ["Lobby Lounge", "26-Jun", "₹12,000", "₹45,000", "₹85,000", "₹25,560", "₹1,67,560", "110"],
          ["In-Room Dining", "26-Jun", "₹0", "₹0", "₹1,40,000", "₹25,200", "₹1,65,200", "85"],
          ["Lotus Spa", "26-Jun", "₹5,000", "₹85,000", "₹1,10,000", "₹36,000", "₹2,36,000", "42"],
        ]
      };

    default:
      return {
        columns: ["Column A", "Column B", "Column C", "Column D", "Column E"],
        rows: Array.from({ length: 5 }).map((_, i) => [
          `Data A${i + 1}`,
          `Data B${i + 1}`,
          `Data C${i + 1}`,
          `Data D${i + 1}`,
          `Data E${i + 1}`,
        ]),
      };
  }
}

export function ReportViewerModal({ isOpen, onClose, reportTitle }: ReportViewerModalProps) {
  const [data, setData] = useState<ReportData | null>(null);
  const [filterType, setFilterType] = useState<"month" | "date_range">("month");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    // Set default month to current month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${year}-${month}`);
  }, []);

  useEffect(() => {
    if (!isOpen || !reportTitle) {
      setData(null);
      return;
    }
    setData(getReportMockData(reportTitle));
  }, [isOpen, reportTitle]);

  if (!isOpen || !reportTitle || !data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[100vw] w-screen h-[100vh] max-h-[100vh] m-0 rounded-none border-none flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{reportTitle}</DialogTitle>
              <div className="text-sm text-text-secondary mt-1">Generated on: {new Date().toLocaleDateString()}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-surface-2 p-1.5 rounded-md border border-border">
                <select 
                  className="h-8 rounded-sm border-0 bg-transparent px-2 py-1 text-sm font-medium focus:ring-0 cursor-pointer hover:bg-surface-3 transition-colors outline-none"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                >
                  <option value="month">Month</option>
                  <option value="date_range">Date Range</option>
                </select>
                
                <div className="w-px h-5 bg-border mx-1"></div>
                
                {filterType === 'month' ? (
                  <input 
                    type="month" 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="h-8 rounded-sm border border-input bg-surface px-2 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="h-8 rounded-sm border border-input bg-surface px-2 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-xs font-medium text-text-secondary">to</span>
                    <input 
                      type="date" 
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="h-8 rounded-sm border border-input bg-surface px-2 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
                
                <Button size="sm" variant="secondary" className="ml-1 h-8">
                  Apply Filter
                </Button>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-1.5" />
                  Print
                </Button>
                <Button size="sm">
                  <Download className="h-4 w-4 mr-1.5" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-6 bg-surface-2/30">
          <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-2 hover:bg-surface-2">
                  {data.columns.map((col, idx) => (
                    <TableHead key={idx} className="font-medium text-text-secondary whitespace-nowrap">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <TableCell key={cellIdx} className="py-3 whitespace-nowrap">
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {data.rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={data.columns.length} className="h-24 text-center">
                      No data found for this report.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
