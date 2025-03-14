
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
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash, Edit, FileDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditInvoiceSheet } from "./EditInvoiceSheet";

type Invoice = Tables<"invoices"> & {
  customers: {
    name: string;
  } | null;
  categories: {
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
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

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
          ),
          categories (
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

  useEffect(() => {
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

  const handleDeleteInvoice = async (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoiceId);

      if (error) throw error;

      setInvoices(invoices.filter(inv => inv.id !== invoiceId));
      toast.success("Invoice deleted successfully");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };

  const handleEditInvoice = (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingInvoice(invoice);
    setEditSheetOpen(true);
  };

  const handleGeneratePdf = (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/invoice-pdf/${invoiceId}`, '_blank');
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
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                <TableCell>{invoice.customers?.name || "Unknown"}</TableCell>
                <TableCell>{invoice.categories?.name || "Uncategorized"}</TableCell>
                <TableCell>{formatCurrency(Number(invoice.amount))}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusStyles[invoice.status as keyof typeof statusStyles] || ""}
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {invoice.status === "Paid" && invoice.paid_date
                    ? `Paid on ${formatDate(invoice.paid_date)}`
                    : formatDate(invoice.due_date)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={(e) => handleEditInvoice(invoice, e)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleGeneratePdf(invoice.id, e)}>
                        <FileDown className="h-4 w-4 mr-2" />
                        Generate PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleDeleteInvoice(invoice.id, e)}>
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <EditInvoiceSheet
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
          invoice={editingInvoice}
          onInvoiceUpdated={fetchInvoices}
        />
      </CardContent>
    </Card>
  );
}
