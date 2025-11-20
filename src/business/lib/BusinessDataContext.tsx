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
  report: RestaurantReportData | null;
  loadRestaurantReport: (r: RestaurantReportData) => void;
  clearReport: () => void;
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
  const [report, setReport] = useState<RestaurantReportData | null>(null);
  const [reportSessionId, setReportSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const rawReport = localStorage.getItem('business_report');
      if (rawReport) {
        const parsed = JSON.parse(rawReport) as RestaurantReportEnvelope | RestaurantReportData;
        const data = (isEnvelope(parsed) ? parsed.restaurant_report : parsed) as RestaurantReportData;
        if (data) {
          setReport(data);
          const mapped = mapReportToRows(data);
          setRows(mapped);
          return;
        }
      }
      const raw = localStorage.getItem('business_sales_rows');
      if (raw) setRows(JSON.parse(raw));
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

  const loadRestaurantReport = (data: RestaurantReportData) => {
    setReport(data);
    const mapped = mapReportToRows(data);
    setRows(mapped);
    try {
      localStorage.setItem('business_report', JSON.stringify(data));
      localStorage.removeItem('business_sales_rows');
    } catch {}
  };

  const clearReport = () => {
    setReport(null);
    try {
      localStorage.removeItem('business_report');
    } catch {}
  };

  return (
    <BusinessDataContext.Provider value={{ rows, setRows, report, loadRestaurantReport, clearReport, totalRevenue, revenueByDate, dailyFinancials, itemsSoldAggregate, ragSearch }}>
      {children}
    </BusinessDataContext.Provider>
  );
};

// ===== New report types & helpers =====

export type RestaurantReportEnvelope = { restaurant_report: RestaurantReportData };

export type RestaurantReportData = {
  metadata?: {
    month?: string; // YYYY-MM
    restaurant_name?: string;
  };
  top_selling_item?: {
    item_name: string;
    units_sold: number;
    percentage_of_sales: number;
  };
  top_5_selling_items?: { item_name: string; units_sold: number; percentage_of_sales: number }[];
  bottom_5_selling_items?: { item_name: string; units_sold: number; percentage_of_sales: number }[];
  menu_items?: { item_name: string; category: string; price: number }[];
  daily_sales_summary?: {
    date: string; // YYYY-MM-DD
    day_of_week?: string;
    week_number?: number;
    number_of_sales: number;
    units_sold?: number;
    total_sales_amount: number;
  }[];
  total_month_sales?: { number_of_sales: number; units_sold?: number; total_sales_amount: number };
  expenses_over_time?: { date: string; expense_category?: string; amount: number }[];
  revenue_over_time?: { date: string; revenue: number }[];
  profit_over_time?: { date: string; profit: number }[];
  sales_percentages_by_item?: { item_name: string; percentage_of_total_sales: number }[];
  tips?: { tip_title: string; tip_description: string }[];
};

function isEnvelope(v: any): v is RestaurantReportEnvelope {
  return v && typeof v === 'object' && 'restaurant_report' in v;
}

function mapReportToRows(rr: RestaurantReportData): SalesRow[] {
  const byDate: Record<string, SalesRow> = {};
  // seed from daily sales summary
  (rr.daily_sales_summary || []).forEach((d) => {
    const date = d.date;
    if (!byDate[date]) byDate[date] = { date, revenue: 0, orders: 0, expenses: 0, profit: 0 };
    byDate[date].revenue += Number(d.total_sales_amount || 0);
    byDate[date].orders = (byDate[date].orders || 0) + Number(d.number_of_sales || 0);
  });
  // merge revenue_over_time (authoritative if present)
  (rr.revenue_over_time || []).forEach((r) => {
    const date = r.date;
    if (!byDate[date]) byDate[date] = { date, revenue: 0 } as SalesRow;
    byDate[date].revenue = Number(r.revenue || 0);
  });
  // merge expenses
  (rr.expenses_over_time || []).forEach((e) => {
    const date = e.date;
    if (!byDate[date]) byDate[date] = { date, revenue: 0 } as SalesRow;
    byDate[date].expenses = (byDate[date].expenses || 0) + Number(e.amount || 0);
  });
  // merge profit
  (rr.profit_over_time || []).forEach((p) => {
    const date = p.date;
    if (!byDate[date]) byDate[date] = { date, revenue: 0 } as SalesRow;
    byDate[date].profit = Number(p.profit || 0);
  });
  // derive missing profit
  Object.values(byDate).forEach((r) => {
    if (r.profit === undefined || r.profit === null) {
      const rev = Number(r.revenue || 0);
      const exp = Number(r.expenses || 0);
      r.profit = rev - exp;
    }
  });
  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
}

function loadRestaurantReport(this: void, _r: RestaurantReportData) {
  // placeholder to satisfy TS when referencing in context value; actual impl replaced below
}

function clearReport(this: void) {
  // placeholder to satisfy TS when referencing in context value; actual impl replaced below
}
