import { useRef } from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { Save, TrendingUp, TrendingDown, BarChart3, LineChart, PieChart, Activity } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
import { BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

interface AnalysisCard {
  id: string;
  type: 'chart' | 'statistics';
  title: string;
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  data?: any[];
  statistics?: Array<{
    label: string;
    value: string | number;
    change?: number;
    changeType?: 'increase' | 'decrease';
  }>;
  description?: string;
}

const AnalyticsPanel = (props: { chatOpen?: boolean } = {}) => {
  const { chatOpen } = props;
  const { toast } = useToast();
  const [analysisCards, setAnalysisCards] = useState<AnalysisCard[]>([]);

  const saveGraphAsImage = async (cardRef: React.RefObject<HTMLDivElement>, name: string) => {
    if (!cardRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      canvas.width = cardRef.current.offsetWidth;
      canvas.height = cardRef.current.offsetHeight;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.font = '16px sans-serif';
      ctx.fillText(`${name} - Saved on ${new Date().toLocaleDateString()}`, 20, 50);

      const imageData = canvas.toDataURL('image/png');

      const saved = localStorage.getItem("savedGraphs");
      const savedGraphs = saved ? JSON.parse(saved) : [];

      savedGraphs.push({
        id: Date.now().toString(),
        name,
        imageData,
        savedAt: new Date().toISOString(),
      });

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

  // Listen for AI-provided analysis data
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      
      // Expected format: { type: 'chart'|'statistics', title: string, chartType?: 'bar'|'line'|'pie'|'area', data?: [...], statistics?: [...] }
      if (detail && (detail.type === 'chart' || detail.type === 'statistics')) {
        const newCard: AnalysisCard = {
          id: Date.now().toString(),
          type: detail.type,
          title: detail.title || 'Analysis',
          chartType: detail.chartType,
          data: detail.data,
          statistics: detail.statistics,
          description: detail.description,
        };
        
        setAnalysisCards((prev) => [...prev, newCard]);
        toast({ 
          title: 'New analysis added', 
          description: `${detail.title || 'Analysis'} has been added to the panel.` 
        });
      }
    };
    
    window.addEventListener('ai:analysis', handler as EventListener);
    return () => window.removeEventListener('ai:analysis', handler as EventListener);
  }, [toast]);

  const renderChart = (card: AnalysisCard) => {
    if (!card.data || card.data.length === 0) return null;

    // Use design system colors
    const primaryColor = "hsl(var(--primary))"; // #e74a3c equivalent
    const accentColor = "hsl(var(--accent))"; // #f97116 equivalent
    
    // Color palette matching the design system
    const COLORS = [
      primaryColor, // Primary red
      accentColor, // Accent orange
      "hsl(217, 91%, 60%)", // Blue
      "hsl(142, 71%, 45%)", // Green
      "hsl(262, 83%, 58%)", // Purple
      "hsl(43, 96%, 56%)", // Yellow/Orange
    ];

    const chartConfig = {
      value: {
        label: "Value",
        color: primaryColor,
      },
    };

    switch (card.chartType) {
      case 'bar':
        return (
          <ChartContainer config={chartConfig} className="h-[300px] font-sans">
            <BarChart data={card.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontFamily: "Inter, sans-serif" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontFamily: "Inter, sans-serif" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill={primaryColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        );
      case 'line':
        return (
          <ChartContainer config={chartConfig} className="h-[300px] font-sans">
            <RechartsLineChart data={card.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontFamily: "Inter, sans-serif" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontFamily: "Inter, sans-serif" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="value" stroke={primaryColor} strokeWidth={2} dot={{ r: 4, fill: primaryColor }} />
            </RechartsLineChart>
          </ChartContainer>
        );
      case 'area':
        return (
          <ChartContainer config={chartConfig} className="h-[300px] font-sans">
            <AreaChart data={card.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontFamily: "Inter, sans-serif" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontFamily: "Inter, sans-serif" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="value" stroke={primaryColor} fill={primaryColor} fillOpacity={0.6} />
            </AreaChart>
          </ChartContainer>
        );
      case 'pie':
        return (
          <ChartContainer config={chartConfig} className="h-[300px] font-sans">
            <RechartsPieChart>
              <Pie
                data={card.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill={primaryColor}
                dataKey="value"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}
              >
                {card.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </RechartsPieChart>
          </ChartContainer>
        );
      default:
        return null;
    }
  };

  const getChartIcon = (chartType?: string) => {
    switch (chartType) {
      case 'bar':
        return <BarChart3 className="h-4 w-4 text-primary" />;
      case 'line':
        return <LineChart className="h-4 w-4 text-primary" />;
      case 'pie':
        return <PieChart className="h-4 w-4 text-primary" />;
      case 'area':
        return <Activity className="h-4 w-4 text-primary" />;
      default:
        return <Activity className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className={`h-full bg-graph-bg rounded-2xl p-6 overflow-hidden transition-all duration-500 ease-in-out ${chatOpen === false ? 'w-[80vw] mx-auto' : 'w-full'}`}>
      <ScrollArea className="h-full pr-2">
        <div className="flex flex-col gap-5 pb-4">
          {analysisCards.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto" />
                <p className="text-lg font-medium text-foreground">No analyses yet</p>
                <p className="text-sm text-muted-foreground">Upload a CSV or PDF sales report and ask questions to generate insights</p>
              </div>
            </div>
          ) : (
            analysisCards.map((card) => (
              <AnalysisCardComponent
                key={card.id}
                card={card}
                chatOpen={chatOpen}
                renderChart={renderChart}
                getChartIcon={getChartIcon}
                onSave={saveGraphAsImage}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const AnalysisCardComponent = ({ 
  card, 
  chatOpen, 
  renderChart, 
  getChartIcon, 
  onSave 
}: { 
  card: AnalysisCard; 
  chatOpen?: boolean; 
  renderChart: (card: AnalysisCard) => React.ReactNode;
  getChartIcon: (chartType?: string) => React.ReactNode;
  onSave: (ref: React.RefObject<HTMLDivElement>, name: string) => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <Card
      ref={cardRef}
      className={`shadow-sm border-border/50 rounded-2xl overflow-hidden min-h-[300px] ${chatOpen === false ? 'w-full max-w-none' : ''}`}
    >
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            {card.type === 'chart' ? getChartIcon(card.chartType) : <Activity className="h-4 w-4 text-primary" />}
            {card.title}
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSave(cardRef, card.title)}
            className="h-7"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>
        {card.description && (
          <p className="text-sm text-muted-foreground mt-2">{card.description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        {card.type === 'chart' && renderChart(card)}
        {card.type === 'statistics' && card.statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {card.statistics.map((stat, index) => (
              <div key={index} className="space-y-1">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">
                  {typeof stat.value === 'number' 
                    ? stat.value.toLocaleString() 
                    : stat.value}
                </p>
                {stat.change !== undefined && (
                  <p className={`text-xs flex items-center gap-1 ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.changeType === 'increase' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stat.change > 0 ? '+' : ''}{stat.change.toFixed(1)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsPanel;
