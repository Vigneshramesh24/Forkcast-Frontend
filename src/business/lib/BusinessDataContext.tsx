import React, { createContext, useContext, useState, useEffect } from 'react';

export type ItemSale = {
  name: string;
  quantity: number;
  revenue?: number; // optional per-item revenue
  cost?: number; // optional cost for profit calculations
};

export type SalesRow = {
  date: string; // ISO date (YYYY-MM-DD)
  revenue: number;
  orders?: number;
  expenses?: number; // total expenses for that day
  profit?: number; // if missing we derive profit = revenue - expenses
  items?: ItemSale[]; // breakdown of items sold that day
  [key: string]: any;
};

type BusinessDataContextType = {
  rows: SalesRow[];
  setRows: (r: SalesRow[]) => void;
  totalRevenue: () => number;
  revenueByDate: () => { date: string; revenue: number }[];
  dailyFinancials: () => { date: string; revenue: number; expenses: number; profit: number; orders: number }[];
  itemsSoldAggregate: () => { name: string; quantity: number; revenue: number }[];
  ragSearch: (query: string) => SalesRow[];
};

const BusinessDataContext = createContext<BusinessDataContextType | null>(null);

export const useBusinessData = () => {
  const ctx = useContext(BusinessDataContext);
  if (!ctx) throw new Error('useBusinessData must be used within BusinessDataProvider');
  return ctx;
};

export const BusinessDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rows, setRows] = useState<SalesRow[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('business_sales_rows');
      if (raw) setRows(JSON.parse(raw));
      else {
        // generate mock data for current month (synthetic) if none present
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const mock: SalesRow[] = [];
        const itemNames = ['pizza','burger','salad','sushi','taco'];
        for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(year, month, d);
          const iso = date.toISOString().slice(0,10);
          const base = 500 + Math.random()*500; // revenue base
          const items = itemNames.map(n => ({
            name: n,
            quantity: Math.floor(Math.random()*20),
            revenue: Math.round((50 + Math.random()*100) * 100)/100,
            cost: Math.round((20 + Math.random()*40) * 100)/100,
          }));
          const revenue = Math.round((base + items.reduce((s,i)=>s+i.revenue*i.quantity,0)) * 100)/100;
          const expenses = Math.round((revenue * (0.45 + Math.random()*0.1)) * 100)/100;
          const orders = items.reduce((s,i)=>s+i.quantity,0);
          mock.push({ date: iso, revenue, expenses, profit: revenue-expenses, orders, items });
        }
        setRows(mock);
      }
    } catch (e) {}
  }, []);

  // Optional Supabase fetch merge (idempotent) - call manually from components if needed
  const refreshFromSupabase = async () => {
    try {
      // dynamic import to avoid SSR issues
      const { supabase } = await import('@/shared/integrations/supabase/client');
      // Table not yet defined in types; skip if not present by querying an existing table (restaurants) as placeholder
      const { data, error } = await supabase
        .from('restaurants')
        .select('id,created_at');
      if (error || !data) return;
      // Placeholder: merge no-op; reserved for future once table exists
      const incoming: SalesRow[] = [];
      // merge, preferring supabase rows
      const mergedMap: Record<string, SalesRow> = {};
      [...rows, ...incoming].forEach(r => { mergedMap[r.date] = { ...mergedMap[r.date], ...r }; });
      const merged = Object.values(mergedMap).sort((a,b)=>a.date.localeCompare(b.date));
      setRows(merged);
      localStorage.setItem('business_sales_rows', JSON.stringify(merged));
    } catch (e) {}
  };

  const totalRevenue = () => rows.reduce((s, r) => s + (r.revenue || 0), 0);

  const revenueByDate = () => {
    const map: Record<string, number> = {};
    rows.forEach((r) => {
      const d = r.date;
      map[d] = (map[d] || 0) + (r.revenue || 0);
    });
    return Object.keys(map)
      .sort()
      .map((d) => ({ date: d, revenue: map[d] }));
  };

  // Build a daily array (fills missing days of current month with zeros)
  const dailyFinancials = () => {
    if (rows.length === 0) return [];
    const dates = rows.map(r => r.date).filter(Boolean);
    const month = dates[0].slice(0,7); // YYYY-MM
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10); const m = parseInt(monthStr, 10) - 1;
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const map: Record<string, { revenue: number; expenses: number; profit: number; orders: number }> = {};
    rows.forEach(r => {
      const key = r.date;
      if (!map[key]) map[key] = { revenue: 0, expenses: 0, profit: 0, orders: 0 };
      map[key].revenue += r.revenue || 0;
      map[key].expenses += r.expenses || 0;
      const derivedProfit = r.profit !== undefined ? r.profit : (r.revenue || 0) - (r.expenses || 0);
      map[key].profit += derivedProfit;
      map[key].orders += r.orders || 0;
    });
    const out: { date: string; revenue: number; expenses: number; profit: number; orders: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${yearStr}-${monthStr}-${String(d).padStart(2,'0')}`;
      const v = map[iso] || { revenue: 0, expenses: 0, profit: 0, orders: 0 };
      out.push({ date: iso, ...v });
    }
    return out;
  };

  const itemsSoldAggregate = () => {
    const rollup: Record<string, { quantity: number; revenue: number }> = {};
    rows.forEach(r => {
      (r.items || []).forEach(item => {
        const key = item.name.trim().toLowerCase();
        if (!rollup[key]) rollup[key] = { quantity: 0, revenue: 0 };
        rollup[key].quantity += item.quantity || 0;
        rollup[key].revenue += item.revenue || 0;
      });
    });
    return Object.entries(rollup).map(([k,v]) => ({ name: k, quantity: v.quantity, revenue: v.revenue }));
  };

  const ragSearch = (query: string) => {
    const q = query.toLowerCase();
    // find rows that match any string field
    return rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  };

  return (
    <BusinessDataContext.Provider value={{ rows, setRows, totalRevenue, revenueByDate, dailyFinancials, itemsSoldAggregate, ragSearch }}>
      {children}
    </BusinessDataContext.Provider>
  );
};
