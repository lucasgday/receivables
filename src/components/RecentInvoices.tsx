
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type Invoice = Tables<"invoices"> & {
  customers: {
    name: string;
  } | null;
};

const statusStyles = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
  Paid: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Overdue: "bg-red-100 text-red-800",
};

export function RecentInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user && !import.meta.env.DEV) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select(`
            *,
            customers (
              name
            )
          `)
          .order("issued_date", { ascending: false })
          .limit(5);

        if (error) throw error;

        setInvoices(data || []);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to load recent invoices");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">Loading invoices...</div>
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">No invoices found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                <TableCell>{invoice.customers?.name || "Unknown"}</TableCell>
                <TableCell>{formatCurrency(Number(invoice.amount))}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusStyles[invoice.status as keyof typeof statusStyles] || ""}
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(invoice.issued_date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
