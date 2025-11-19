import { useState } from "react";
import { useBusinessData, RestaurantReportEnvelope, RestaurantReportData } from "@/business/lib/BusinessDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { Upload, FileText } from "lucide-react";
import SalesHeatmap from '@/business/components/SalesHeatmap';
import FinancialLineChart from '@/business/components/FinancialLineChart';
import ItemsSoldPieChart from '@/business/components/ItemsSoldPieChart';
import TopBottomItems from '@/business/components/TopBottomItems';
import { useToast } from "@/shared/hooks/use-toast";

const AnalyticsPanel = () => {
  const { toast } = useToast();
  const [fileName, setFileName] = useState<string | null>(null);
  const { rows, setRows, loadRestaurantReport, report, clearReport } = useBusinessData();
  const uploaded = Boolean(report);

  // CSV/Image upload removed per latest requirements

  const handleJson = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = String(e.target?.result || '');
        const json = JSON.parse(text) as RestaurantReportEnvelope | RestaurantReportData;
        const data: RestaurantReportData = (json as any).restaurant_report ? (json as RestaurantReportEnvelope).restaurant_report : (json as RestaurantReportData);
        loadRestaurantReport(data);
        setFileName(file.name);
        toast({ title: 'Report uploaded', description: `${file.name} parsed successfully` });
      } catch (err) {
        toast({ title: 'Invalid JSON', description: 'Could not parse the report file.', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
  };

  const handlePdf = async (file: File | null) => {
    if (!file) return;
    const endpoint = import.meta.env.VITE_PDF_PARSE_URL as string | undefined;
    if (!endpoint) {
      toast({ title: 'Missing endpoint', description: 'Set VITE_PDF_PARSE_URL in your .env to enable PDF parsing.', variant: 'destructive' });
      return;
    }
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(endpoint, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Expect either envelope or raw report; also optionally a session id for chat
      const reportPayload: RestaurantReportEnvelope | RestaurantReportData = (data && data.restaurant_report) ? data : (data.report || data);
      const parsed: RestaurantReportData = (reportPayload as any).restaurant_report ? (reportPayload as any).restaurant_report : (reportPayload as any);
      loadRestaurantReport(parsed);
      // persist session id if present
      const sessionId = (data.session_id || data.id || null) as string | null;
      if (sessionId) localStorage.setItem('business_report_session_id', sessionId);
      setFileName(file.name);
      toast({ title: 'PDF parsed', description: `${file.name} processed successfully` });
    } catch (err) {
      toast({ title: 'PDF parse failed', description: 'Could not parse PDF. Try again or check the endpoint.', variant: 'destructive' });
    }
  };

  return (
    <div className="h-full bg-graph-bg rounded-2xl p-6 overflow-hidden">
      <ScrollArea className="h-full pr-2">
        <div className="mb-4">
          <Card className="max-w-4xl mx-auto p-6">
            {!uploaded ? (
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">Upload Sales Report</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a JSON report or a PDF report to begin.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="secondary" className="relative">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload JSON
                    <input
                      type="file"
                      accept="application/json,.json"
                      onChange={(e) => handleJson(e.target.files?.[0] ?? null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>

                  <Button variant="outline" className="relative">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload PDF
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(e) => handlePdf(e.target.files?.[0] ?? null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Uploaded</p>
                  <p className="font-medium text-foreground">{fileName}</p>
                  {report ? (
                    <p className="text-sm text-muted-foreground">Report month: {report.metadata?.month ?? 'N/A'}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Rows: {rows.length}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFileName(null);
                      if (report) {
                        clearReport();
                      } else {
                        setRows([]);
                        localStorage.removeItem('business_sales_rows');
                      }
                    }}
                  >
                    Change File
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
        {uploaded && (
        <div className="flex flex-col gap-5 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">Business Performance</h2>
          </div>
          <div className="grid grid-cols-1 gap-5">
            <FinancialLineChart />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ItemsSoldPieChart />
              <SalesHeatmap />
            </div>
            {report && <TopBottomItems />}
          </div>
        </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default AnalyticsPanel;
