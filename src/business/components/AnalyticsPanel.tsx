import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { BarChart3, TrendingUp, Save, ShoppingCart, Users, Target } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

const AnalyticsPanel = () => {
  const { toast } = useToast();
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

  return (
    <div className="h-full bg-graph-bg rounded-2xl p-6 overflow-hidden">
      <ScrollArea className="h-full pr-2">
        <div className="flex flex-col gap-5 pb-4">
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
          <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center space-y-2">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Chart visualization will appear here</p>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">$47,234</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12.5%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Orders</p>
              <p className="text-2xl font-bold text-foreground">1,423</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +8.2%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Avg. Order</p>
              <p className="text-2xl font-bold text-foreground">$33.19</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +4.1%
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
          <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center space-y-2">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Analytics data will appear here</p>
            </div>
          </div>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">New Customers</p>
              <p className="text-2xl font-bold text-foreground">342</p>
              <p className="text-xs text-green-600">+15.3% from last month</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Retention Rate</p>
              <p className="text-2xl font-bold text-foreground">87.4%</p>
              <p className="text-xs text-green-600">+2.1% from last month</p>
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
            <div className="text-center space-y-2">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Order trends will appear here</p>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">127</p>
              <p className="text-xs text-orange-600">Processing</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-foreground">1,296</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +18.7%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-bold text-foreground">23</p>
              <p className="text-xs text-red-600">-3.2%</p>
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
              <p className="text-2xl font-bold text-foreground">3.8%</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +0.5%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Cart Abandonment</p>
              <p className="text-2xl font-bold text-foreground">23.2%</p>
              <p className="text-xs text-red-600">-2.1%</p>
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
