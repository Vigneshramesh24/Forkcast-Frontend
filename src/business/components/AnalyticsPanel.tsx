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
  const [isLoading, setIsLoading] = useState(false);
  const { rows, setRows, loadRestaurantReport, report, clearReport } = useBusinessData();
  const uploaded = Boolean(report);

  const handlePdf = async (file: File | null) => {
    if (!file) return;
    
    setIsLoading(true);
    const endpoint = "http://127.0.0.1:8000/extract-json";
    
    try {
      const form = new FormData();
      form.append('pdf', file);
      const res = await fetch(endpoint, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // Extract the report from response
      const reportData: RestaurantReportData = data.report || data;
      loadRestaurantReport(reportData);
      setFileName(file.name);
      
      // Store pdf_id for chat context if needed
      if (data.pdf_id) {
        localStorage.setItem('current_pdf_id', data.pdf_id);
      }
      
      toast({ title: 'PDF processed', description: `${file.name} extracted successfully` });
    } catch (err) {
      console.error('PDF upload error:', err);
      toast({ title: 'PDF upload failed', description: 'Could not process PDF. Ensure the API server is running at http://127.0.0.1:8000', variant: 'destructive' });
    } finally {
      setIsLoading(false);
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
                  Upload a PDF report to begin analysis and chat.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant="outline" 
                    className="relative"
                    disabled={isLoading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isLoading ? 'Processing...' : 'Upload PDF'}
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(e) => handlePdf(e.target.files?.[0] ?? null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isLoading}
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
