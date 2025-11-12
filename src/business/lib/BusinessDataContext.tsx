import React, { createContext, useContext, useState, useEffect } from 'react';

export type SalesRow = {
  date: string; // ISO date
  revenue: number;
  orders?: number;
  [key: string]: any;
};

type BusinessDataContextType = {
  rows: SalesRow[];
  setRows: (r: SalesRow[]) => void;
  totalRevenue: () => number;
  revenueByDate: () => { date: string; revenue: number }[];
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
    } catch (e) {}
  }, []);

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

  const ragSearch = (query: string) => {
    const q = query.toLowerCase();
    // find rows that match any string field
    return rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  };

  return (
    <BusinessDataContext.Provider value={{ rows, setRows, totalRevenue, revenueByDate, ragSearch }}>
      {children}
    </BusinessDataContext.Provider>
  );
};
