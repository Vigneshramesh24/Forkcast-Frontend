import React, { useState } from 'react';
import { useBusinessData } from '@/business/lib/BusinessDataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Calendar } from 'lucide-react';

// Simple weekly heat map for daily revenue or orders
// We map days of current month into weeks (starting Monday) and color by revenue intensity.

const getWeeks = (daily: { date: string; revenue: number; orders: number; expenses: number; profit: number }[]) => {
  if (daily.length === 0) return [];
  const cells: { date: string; revenue: number; orders: number; expenses: number; profit: number; dayIndex: number }[] = daily.map(d => {
    const parts = d.date.split('-');
    const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    // Monday=0 ... Sunday=6
    const dayIndex = (dt.getDay() + 6) % 7;
    return { ...d, dayIndex };
  });
  const weeks: { days: typeof cells }[] = [];
  let current: typeof cells = [];
  let prevWeekNumber: number | null = null;
  cells.forEach(c => {
    const parts = c.date.split('-');
    const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    // week number simplistic: day/7
    const weekNumber = Math.floor((dt.getDate() - 1) / 7);
    if (prevWeekNumber === null || weekNumber === prevWeekNumber) {
      current.push(c);
    } else {
      weeks.push({ days: current });
      current = [c];
    }
    prevWeekNumber = weekNumber;
  });
  if (current.length) weeks.push({ days: current });
  return weeks;
};

const SalesHeatmap: React.FC = () => {
  const { dailyFinancials } = useBusinessData();
  const daily = dailyFinancials();
  const [mode, setMode] = useState<'revenue' | 'orders'>('revenue');
  const [selected, setSelected] = useState<{ date: string; revenue: number; expenses: number; profit: number; orders: number } | null>(null);
  const weeks = getWeeks(daily);
  const maxValue = daily.reduce((m, d) => Math.max(m, mode === 'revenue' ? d.revenue : d.orders), 0) || 1;

  return (
    <Card className="shadow-sm border-border/50 rounded-2xl overflow-hidden min-h-[340px]">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Weekly {mode === 'revenue' ? 'Revenue' : 'Orders'} Heatmap
          </CardTitle>
          <div className="flex items-center gap-2">
            <button onClick={()=>setMode('revenue')} className={`text-xs px-2 py-1 rounded ${mode==='revenue'?'bg-primary text-white':'bg-muted text-muted-foreground'}`}>Revenue</button>
            <button onClick={()=>setMode('orders')} className={`text-xs px-2 py-1 rounded ${mode==='orders'?'bg-primary text-white':'bg-muted text-muted-foreground'}`}>Orders</button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {daily.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground">Upload sales data to view heatmap.</div>
        ) : (
          <div className="grid gap-4">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
              <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
            </div>
            <div className="flex flex-col gap-2">
              {weeks.map((w, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }).map((_, di) => {
                    const cell = w.days.find(d => d.dayIndex === di);
                    const revenue = cell ? cell.revenue : 0;
                    const orders = cell ? cell.orders : 0;
                    const value = mode === 'revenue' ? revenue : orders;
                    const ratio = value / maxValue;
                    const bg = ratio === 0 ? 'bg-muted/25' : 'bg-gradient-to-br from-primary/70 to-primary';
                    const opacity = ratio === 0 ? 'opacity-30' : (0.3 + ratio * 0.7).toFixed(2);
                    return (
                      <button
                        key={di}
                        onClick={()=> cell && setSelected({ date: cell.date, revenue: cell.revenue, orders: cell.orders, expenses: cell.expenses ?? 0, profit: cell.profit ?? (cell.revenue - (cell.expenses ?? 0)) })}
                        className={`relative h-10 rounded-md flex items-center justify-center text-[10px] font-medium ${bg}`}
                        style={{ opacity }}
                        title={cell ? `${cell.date} \nRevenue: $${Math.round(cell.revenue)}\nOrders: ${cell.orders}` : 'No data'}
                      >
                        {cell && <span className="text-white mix-blend-overlay">{Math.round(value)}</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-3 w-3 rounded-sm bg-muted/25" />
              <div className="h-3 w-3 rounded-sm bg-primary/40" />
              <div className="h-3 w-3 rounded-sm bg-primary/70" />
              <div className="h-3 w-3 rounded-sm bg-primary" />
              <span className="text-[10px] text-muted-foreground">Low → High {mode}</span>
            </div>
            {selected && (
              <div className="mt-3 p-3 rounded-md border border-border/50 bg-background/80 backdrop-blur-sm text-xs space-y-1">
                <div className="flex justify-between"><span className="font-semibold">{selected.date}</span><button onClick={()=>setSelected(null)} className="text-muted-foreground hover:text-foreground">Close</button></div>
                <div>Revenue: <span className="font-mono">${selected.revenue.toFixed(2)}</span></div>
                <div>Expenses: <span className="font-mono">${selected.expenses.toFixed(2)}</span></div>
                <div>Profit: <span className="font-mono">${selected.profit.toFixed(2)}</span></div>
                <div>Orders: <span className="font-mono">{selected.orders}</span></div>
                <div className="text-muted-foreground">Click another day to update.</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesHeatmap;
