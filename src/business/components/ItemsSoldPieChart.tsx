import React, { useMemo, useState } from 'react';
import { useBusinessData } from '@/business/lib/BusinessDataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ["#0ea5e9", "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#84cc16", "#f97316"];

const ItemsSoldPieChart: React.FC = () => {
  const { itemsSoldAggregate, report } = useBusinessData();
  const [mode, setMode] = useState<'quantity'|'revenue'|'percentage'>('quantity');

  const hasPercentages = !!(report && report.sales_percentages_by_item && report.sales_percentages_by_item.length);
  const raw = useMemo(() => {
    if (hasPercentages) {
      return (report!.sales_percentages_by_item || []).map((x) => ({ name: x.item_name, percentage: x.percentage_of_total_sales }));
    }
    return itemsSoldAggregate();
  }, [hasPercentages, report, itemsSoldAggregate]);

  const data = useMemo(() => {
    if (hasPercentages) {
      const MAX_SLICES = 8;
      const sorted = (raw as any[]).sort((a, b) => b.percentage - a.percentage);
      const top = sorted.slice(0, MAX_SLICES);
      const rest = sorted.slice(MAX_SLICES);
      const other = rest.reduce((s, i) => s + (i.percentage || 0), 0);
      const withOther = other > 0.1 ? [...top, { name: 'Other', percentage: Number(other.toFixed(1)) }] : top;
      return withOther;
    }
    return (raw as any[])
      .sort((a, b) => (mode === 'quantity' ? b.quantity - a.quantity : b.revenue - a.revenue))
      .slice(0, 12);
  }, [raw, hasPercentages, mode]);
  return (
    <Card className="shadow-sm border-border/50 rounded-2xl overflow-hidden min-h-[340px]">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary" />
            {hasPercentages ? 'Sales Percent Share' : `Items ${mode==='quantity' ? 'Sold' : 'Revenue'} Breakdown`}
          </CardTitle>
          {!hasPercentages && (
            <div className="flex items-center gap-2">
              <button onClick={()=>setMode('quantity')} className={`text-xs px-2 py-1 rounded ${mode==='quantity'?'bg-primary text-white':'bg-muted text-muted-foreground'}`}>Qty</button>
              <button onClick={()=>setMode('revenue')} className={`text-xs px-2 py-1 rounded ${mode==='revenue'?'bg-primary text-white':'bg-muted text-muted-foreground'}`}>Revenue</button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={hasPercentages ? "h-80" : "h-64"}>
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">No item-level data (add items column in CSV).</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data as any[]}
                  dataKey={hasPercentages ? 'percentage' : mode}
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={hasPercentages ? 75 : 0}
                  outerRadius={hasPercentages ? 120 : 100}
                  labelLine={false}
                  label={!hasPercentages}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any, n: any) => [hasPercentages ? `${v}%` : v, n]} />
                {!hasPercentages && <Legend />}
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {hasPercentages && data.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
            {(data as any[]).map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="truncate max-w-[120px]" title={d.name}>{d.name}</span>
                </div>
                <span className="tabular-nums text-muted-foreground">{Number(d.percentage).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ItemsSoldPieChart;
