
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";

export function OverviewChart() {
  const [data, setData] = useState<{ month: string; amount: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRevenueData = async () => {
      if (!user && !import.meta.env.DEV) return;

      try {
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        const { data: invoices, error } = await supabase
          .from("invoices")
          .select("amount, issued_date")
          .gte("issued_date", sixMonthsAgo.toISOString())
          .order("issued_date", { ascending: true });

        if (error) throw error;

        // Group invoices by month and sum amounts
        const monthlyRevenue = invoices.reduce((acc: Record<string, number>, invoice) => {
          const date = new Date(invoice.issued_date);
          const monthKey = date.toLocaleString('en-US', { month: 'short' });
          acc[monthKey] = (acc[monthKey] || 0) + Number(invoice.amount);
          return acc;
        }, {});

        // Convert to array format required by chart
        const chartData = Object.entries(monthlyRevenue).map(([month, amount]) => ({
          month,
          amount,
        }));

        setData(chartData);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenueData();
  }, [user]);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Loading revenue data...
            </div>
          ) : data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No revenue data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#0ea5e9"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
