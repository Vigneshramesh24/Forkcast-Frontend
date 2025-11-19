import React, { useMemo } from 'react';
import { useBusinessData } from '@/business/lib/BusinessDataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { LineChart as LineChartIcon } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const FinancialLineChart: React.FC = () => {
  const { dailyFinancials, report } = useBusinessData();
  const data = useMemo(() => {
    if (report && (report.revenue_over_time?.length || report.expenses_over_time?.length || report.profit_over_time?.length)) {
      const map: Record<string, { date: string; revenue: number; expenses: number; profit: number }> = {};
      (report.revenue_over_time || []).forEach(r => {
        const d = r.date;
        if (!map[d]) map[d] = { date: d, revenue: 0, expenses: 0, profit: 0 };
        map[d].revenue = Number(r.revenue || 0);
      });
      (report.expenses_over_time || []).forEach(e => {
        const d = e.date;
        if (!map[d]) map[d] = { date: d, revenue: 0, expenses: 0, profit: 0 };
        map[d].expenses += Number(e.amount || 0);
      });
      (report.profit_over_time || []).forEach(p => {
        const d = p.date;
        if (!map[d]) map[d] = { date: d, revenue: 0, expenses: 0, profit: 0 };
        map[d].profit = Number(p.profit || 0);
      });
      const out = Object.values(map).sort((a,b)=>a.date.localeCompare(b.date));
      out.forEach(r => { if (r.profit === undefined || r.profit === null) r.profit = (r.revenue || 0) - (r.expenses || 0); });
      return out;
    }
    return dailyFinancials();
  }, [report, dailyFinancials]);

  const fmtCurrency = (n: number) => {
    if (Math.abs(n) >= 1_000_000) return `$${(n/1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000) return `$${(n/1_000).toFixed(1)}k`;
    return `$${n}`;
  };
  return (
    <Card className="shadow-sm border-border/50 rounded-2xl overflow-hidden min-h-[340px]">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <LineChartIcon className="h-4 w-4 text-primary" />
            Revenue / Expenses / Profit
          </CardTitle>
          <span className="text-xs text-muted-foreground">Monthly daily trend</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">Upload sales data to view financial trends.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="pro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => fmtCurrency(Number(v))}/>
                <Tooltip formatter={(v: any, name: any, props: any) => {
                  if (props && props.payload) {
                    const p = props.payload as any;
                    const margin = p.revenue ? ((p.profit / p.revenue) * 100).toFixed(1) : '0.0';
                    return [`$${Number(v).toLocaleString()}${name==='profit'?` (Margin ${margin}%)`:''}`, name];
                  }
                  return [`$${Number(v).toLocaleString()}`, name];
                }}/>
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" fillOpacity={1} fill="url(#rev)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#dc2626" fillOpacity={1} fill="url(#exp)" name="Expenses" />
                <Area type="monotone" dataKey="profit" stroke="#16a34a" fillOpacity={1} fill="url(#pro)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialLineChart;
