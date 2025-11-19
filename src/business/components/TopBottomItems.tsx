import React from 'react';
import { useBusinessData } from '@/business/lib/BusinessDataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Trophy, ArrowDownCircle, Info } from 'lucide-react';

const TopBottomItems: React.FC = () => {
  const { report } = useBusinessData();
  if (!report) return null;

  const top1 = report.top_selling_item;
  const top5 = report.top_5_selling_items || [];
  const bottom5 = report.bottom_5_selling_items || [];
  const tips = report.tips || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Card className="shadow-sm border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Top Selling Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          {top1 ? (
            <div className="space-y-1">
              <div className="text-xl font-bold">{top1.item_name}</div>
              <div className="text-sm text-muted-foreground">Units Sold: {top1.units_sold.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Share: {top1.percentage_of_sales}%</div>
            </div>
          ) : (
            <div className="text-muted-foreground">No data</div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-semibold">Top 5 Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 list-decimal list-inside">
            {top5.length ? top5.map((i, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span>{i.item_name}</span>
                <span className="text-muted-foreground">{i.units_sold} • {i.percentage_of_sales}%</span>
              </li>
            )) : <div className="text-muted-foreground">No data</div>}
          </ol>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
            Bottom 5 Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 list-decimal list-inside">
            {bottom5.length ? bottom5.map((i, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span>{i.item_name}</span>
                <span className="text-muted-foreground">{i.units_sold} • {i.percentage_of_sales}%</span>
              </li>
            )) : <div className="text-muted-foreground">No data</div>}
          </ol>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50 rounded-2xl overflow-hidden lg:col-span-3">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tips.length ? (
            <ul className="space-y-3">
              {tips.map((t, idx) => (
                <li key={idx} className="text-sm">
                  <div className="font-medium">{t.tip_title}</div>
                  <div className="text-muted-foreground">{t.tip_description}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground">No tips available.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopBottomItems;
