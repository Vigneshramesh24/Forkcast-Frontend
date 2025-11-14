import { useRef, useState } from "react";
import { useBusinessData } from "@/business/lib/BusinessDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { BarChart3, TrendingUp, Save, ShoppingCart, Users, Target, Camera, Upload } from "lucide-react";
import SalesHeatmap from '@/business/components/SalesHeatmap';
import FinancialLineChart from '@/business/components/FinancialLineChart';
import ItemsSoldPieChart from '@/business/components/ItemsSoldPieChart';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart as ReBarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useToast } from "@/shared/hooks/use-toast";

const AnalyticsPanel = () => {
  const { toast } = useToast();
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const { rows, setRows, totalRevenue, revenueByDate } = useBusinessData();
  // derived metrics from uploaded rows
  const totalRev = totalRevenue();
  const totalOrders = rows.reduce((s, r) => s + (Number(r.orders) || (r.raw && Number(r.raw.orders)) || 0), 0);
  const fallbackOrders = rows.length;
  const ordersCount = totalOrders || fallbackOrders;
  const avgOrder = ordersCount > 0 ? totalRev / ordersCount : 0;

  // customer insights (if customer identifier exists in raw rows)
  const customerIdentifiers = rows
    .map((r) => (r.raw?.customer_id ?? r.raw?.customer ?? r.raw?.email ?? '').toString())
    .filter((v) => v && v !== '');
  const uniqueCustomers = new Set(customerIdentifiers).size;
  const repeatCustomers = Math.max(0, customerIdentifiers.length - uniqueCustomers);
  const retentionRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : null;

  // order statuses if present in raw
  const statuses = rows.map((r) => (r.raw?.status ?? '').toString().toLowerCase());
  const pendingCount = statuses.filter((s) => s.includes('pending')).length;
  const completedCount = statuses.filter((s) => s.includes('complete') || s.includes('completed') || s.includes('success')).length;
  const cancelledCount = statuses.filter((s) => s.includes('cancel') || s.includes('cancelled')).length;
  const abandonedCount = statuses.filter((s) => s.includes('abandon') || s.includes('abandoned')).length;

  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const revenueCardRef = useRef<HTMLDivElement>(null);
  const customerCardRef = useRef<HTMLDivElement>(null);
  const orderCardRef = useRef<HTMLDivElement>(null);
  const trafficCardRef = useRef<HTMLDivElement>(null);
  const conversionCardRef = useRef<HTMLDivElement>(null);

  const saveGraphAsImage = async (cardRef: React.RefObject<HTMLDivElement>, name: string) => {
    if (!cardRef.current) return;

    try {
      // For a real implementation, you would use html2canvas or similar library
      // This is a placeholder implementation
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      // Set canvas size
      canvas.width = cardRef.current.offsetWidth;
      canvas.height = cardRef.current.offsetHeight;

      // For now, create a simple placeholder image
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.font = '16px sans-serif';
      ctx.fillText(`${name} - Saved on ${new Date().toLocaleDateString()}`, 20, 50);

      // Convert to data URL
      const imageData = canvas.toDataURL('image/png');

      // Get existing saved graphs
      const saved = localStorage.getItem("savedGraphs");
      const savedGraphs = saved ? JSON.parse(saved) : [];

      // Add new graph
      savedGraphs.push({
        id: Date.now().toString(),
        name,
        imageData,
        savedAt: new Date().toISOString(),
      });

      // Save to localStorage
      localStorage.setItem("savedGraphs", JSON.stringify(savedGraphs));

      toast({
        title: "Graph saved!",
        description: "View it in Saved Information page.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save graph.",
        variant: "destructive",
      });
    }
  };

  // lightweight CSV parser for simple sales reports (date,revenue,orders)
  const handleFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result || '');
      const lines = text.split(/\r?\n/).filter(Boolean);
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const out: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length !== headers.length) continue;
        const obj: any = {};
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = cols[j].trim();
        }
        // normalize
        const date = new Date(obj.date || obj['timestamp'] || obj['day']);
        const iso = isNaN(date.getTime()) ? (obj.date || '') : date.toISOString().slice(0,10);
        const revenue = parseFloat((obj.revenue || obj.amount || '0').replace(/[^0-9.-]+/g, '')) || 0;
        const orders = parseInt(obj.orders || '0') || 0;
        const expenses = parseFloat((obj.expenses || obj.costs || '0').replace(/[^0-9.-]+/g, '')) || 0;
        const profitRaw = parseFloat((obj.profit || obj.margin || '').replace(/[^0-9.-]+/g, ''));
        const profit = isNaN(profitRaw) ? (revenue - expenses) : profitRaw;
        // dynamic item parsing: columns like item_pizza_qty, item_pizza_revenue, item_pizza_cost
        const itemMap: Record<string, { name: string; quantity: number; revenue: number; cost: number }> = {};
        Object.keys(obj).forEach(k => {
          if (!k.startsWith('item_')) return;
          // pattern item_<name>_<metric>
          const parts = k.split('_');
          if (parts.length < 3) return;
          const name = parts.slice(1, parts.length - 1).join('_');
          const metric = parts[parts.length - 1];
          if (!itemMap[name]) itemMap[name] = { name, quantity: 0, revenue: 0, cost: 0 };
          const valNum = parseFloat(String(obj[k]).replace(/[^0-9.-]+/g, '')) || 0;
          if (metric === 'qty' || metric === 'quantity') itemMap[name].quantity = valNum;
          if (metric === 'revenue') itemMap[name].revenue = valNum;
          if (metric === 'cost') itemMap[name].cost = valNum;
        });
        const items = Object.values(itemMap).filter(i => i.quantity || i.revenue || i.cost);
        out.push({ date: iso, revenue, orders, expenses, profit, items, raw: obj });
      }
      // store in localStorage and update state
      localStorage.setItem('business_sales_rows', JSON.stringify(out));
      setFileName(file.name);
      setUploaded(true);
      setRows(out);
      toast({ title: 'Sales uploaded', description: `Parsed ${out.length} rows from ${file.name}` });
    };
    reader.readAsText(file);
  };

  const handleImageForOCR = (file: File | null) => {
    // placeholder for OCR flow: accept image but OCR not implemented
    if (!file) return;
    setFileName(file.name);
    setUploaded(true);
    toast({ title: 'Image received', description: 'OCR is not yet implemented. Upload a CSV for parsing or coming soon.' });
  };

  return (
    <div className="h-full bg-graph-bg rounded-2xl p-6 overflow-hidden">
      <ScrollArea className="h-full pr-2">
        <div className="mb-4">
          <Card className="max-w-4xl mx-auto p-6">
            {!uploaded ? (
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">Upload Sales Report</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a CSV file containing date/revenue/orders or take a photo of a printed report.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="default" className="relative">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>

                  <Button variant="ghost" className="relative">
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleImageForOCR(e.target.files?.[0] ?? null)}
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
                  <p className="text-sm text-muted-foreground">Parsed rows: {rows.length}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFileName(null);
                      setUploaded(false);
                      setRows([]);
                      localStorage.removeItem('business_sales_rows');
                    }}
                  >
                    Change File
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
        <div className="flex flex-col gap-5 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">Business Performance Dashboard</h2>
            <Button size="sm" variant="outline" onClick={()=>{/* placeholder future refresh hook */}} className="h-7">Refresh</Button>
          </div>
          {/* New Financial & Sales Visualization Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <FinancialLineChart />
            <SalesHeatmap />
            <ItemsSoldPieChart />
          </div>
          {/* Revenue Chart Card */}
          <Card ref={revenueCardRef} className="shadow-sm border-border/50 rounded-2xl overflow-hidden min-h-[400px]">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Revenue Overview
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Last 30 days</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveGraphAsImage(revenueCardRef, "Revenue Overview")}
                className="h-7"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 rounded-lg bg-white/5 p-2">
            {/* Professional charts: revenue line + orders bar */}
            {rows && rows.length > 0 ? (
              (() => {
                // build grouped data by date with revenue and orders
                const byDateMap: Record<string, { date: string; revenue: number; orders: number }> = {};
                rows.forEach((r) => {
                  const d = r.date || (r.raw && (r.raw.date || r.raw.day)) || '';
                  if (!d) return;
                  if (!byDateMap[d]) byDateMap[d] = { date: d, revenue: 0, orders: 0 };
                  byDateMap[d].revenue += Number(r.revenue || 0);
                  byDateMap[d].orders += Number(r.orders || (r.raw && Number(r.raw.orders)) || 0);
                });
                const data = Object.values(byDateMap).sort((a, b) => a.date.localeCompare(b.date));

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.06} />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tickFormatter={(v) => `$${v}`} />
                          <Tooltip formatter={(v: any) => (typeof v === 'number' ? fmt(v) : v)} />
                          <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.06} />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="orders" fill="#10b981" />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No sales data — upload a CSV or take a photo.</div>
            )}
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">{fmt(totalRev)}</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {rows.length > 1 ? `${Math.max(0, Math.round((totalRev / Math.max(1, totalRev * 0.9) - 1) * 100))}%` : "--"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Orders</p>
              <p className="text-2xl font-bold text-foreground">{ordersCount.toLocaleString()}</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {rows.length > 1 ? "--" : "--"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Avg. Order</p>
              <p className="text-2xl font-bold text-foreground">{fmt(avgOrder)}</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {rows.length > 1 ? "--" : "--"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Insights Card */}
      <Card ref={customerCardRef} className="flex-1 shadow-sm border-border/50 rounded-2xl overflow-hidden min-h-[400px]">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Customer Insights
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">This month</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveGraphAsImage(customerCardRef, "Customer Insights")}
                className="h-7"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 rounded-lg">
            {/* Simple customer insights bar chart using SVG */}
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <rect x="10" y="20" width="8" height="20" fill="#06b6d4" />
              <rect x="26" y="14" width="8" height="26" fill="#06b6d4" />
              <rect x="42" y="10" width="8" height="30" fill="#06b6d4" />
              <rect x="58" y="18" width="8" height="22" fill="#06b6d4" />
              <rect x="74" y="8" width="8" height="32" fill="#06b6d4" />
            </svg>
          </div>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">New Customers</p>
              <p className="text-2xl font-bold text-foreground">{uniqueCustomers > 0 ? uniqueCustomers : rows.length}</p>
              <p className="text-xs text-green-600">{uniqueCustomers > 0 ? `${uniqueCustomers} unique customers` : 'Using parsed rows'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Retention Rate</p>
              <p className="text-2xl font-bold text-foreground">{retentionRate !== null ? `${Math.round(retentionRate)}%` : 'N/A'}</p>
              <p className="text-xs text-green-600">{retentionRate !== null ? `${repeatCustomers} returning customers` : 'Insufficient data'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Analytics Card */}
      <Card ref={orderCardRef} className="shadow-sm border-border/50 rounded-2xl overflow-hidden min-h-[400px]">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              Order Analytics
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Weekly</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveGraphAsImage(orderCardRef, "Order Analytics")}
                className="h-7"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
              {rows && rows.length > 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <ResponsiveContainer width="90%" height="90%">
                    <PieChart>
                      <Pie
                        data={[{ name: 'Pending', value: pendingCount }, { name: 'Completed', value: completedCount }, { name: 'Cancelled', value: cancelledCount }]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        <Cell fill="#f59e0b" />
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Order trends will appear here</p>
                </div>
              )}
            </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-xs text-orange-600">Processing</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-foreground">{completedCount}</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {completedCount > 0 ? `${Math.round((completedCount / Math.max(1, ordersCount)) * 100)}%` : '--'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-bold text-foreground">{cancelledCount}</p>
              <p className="text-xs text-red-600">{cancelledCount > 0 ? `${Math.round((cancelledCount / Math.max(1, ordersCount)) * 100)}%` : '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Sources Card */}
      <Card ref={trafficCardRef} className="shadow-sm border-border/50 rounded-2xl overflow-hidden min-h-[400px]">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Traffic Sources
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Last 7 days</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveGraphAsImage(trafficCardRef, "Traffic Sources")}
                className="h-7"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center space-y-2">
              <Users className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Traffic breakdown will appear here</p>
            </div>
          </div>
          
          {/* Traffic Stats */}
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Direct</span>
              <span className="text-sm font-semibold">42.3%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Social Media</span>
              <span className="text-sm font-semibold">28.7%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Search Engines</span>
              <span className="text-sm font-semibold">19.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Referral</span>
              <span className="text-sm font-semibold">9.5%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate Card */}
      <Card ref={conversionCardRef} className="shadow-sm border-border/50 rounded-2xl overflow-hidden min-h-[400px]">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Conversion Rate
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">This quarter</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveGraphAsImage(conversionCardRef, "Conversion Rate")}
                className="h-7"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center space-y-2">
              <Target className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Conversion metrics will appear here</p>
            </div>
          </div>
          
          {/* Conversion Metrics */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Overall Rate</p>
              <p className="text-2xl font-bold text-foreground">{ordersCount > 0 && completedCount > 0 ? `${Math.round((completedCount / ordersCount) * 100 * 10) / 10}%` : 'N/A'}</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {ordersCount > 0 ? `${Math.round((completedCount / Math.max(1, ordersCount)) * 100)}% completed` : 'No data'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Cart Abandonment</p>
              <p className="text-2xl font-bold text-foreground">{ordersCount > 0 ? `${Math.round((abandonedCount / ordersCount) * 100 * 10) / 10}%` : 'N/A'}</p>
              <p className="text-xs text-red-600">{abandonedCount > 0 ? `${abandonedCount} abandoned` : 'No data'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AnalyticsPanel;
