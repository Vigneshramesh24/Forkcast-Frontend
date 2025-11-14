import React from 'react';
import { useBusinessData } from '@/business/lib/BusinessDataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { LineChart as LineChartIcon } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const FinancialLineChart: React.FC = () => {
  const { dailyFinancials } = useBusinessData();
  const data = dailyFinancials();
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
              <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${v}`}/> 
                <Tooltip formatter={(v: any, name: any, props: any) => {
                  if (props && props.payload) {
                    const p = props.payload as any;
                    const margin = p.revenue ? ((p.profit / p.revenue) * 100).toFixed(1) : '0.0';
                    return [`$${Number(v).toLocaleString()}${name==='profit'?` (Margin ${margin}%)`:''}`, name];
                  }
                  return [`$${Number(v).toLocaleString()}`, name];
                }}/>
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#dc2626" strokeWidth={2} dot={false} name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={2} dot={false} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialLineChart;
