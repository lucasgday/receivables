import React, { useState } from "react";
import { FileText, MoreHorizontal, Trash, Edit, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { EditInvoiceSheet } from "./EditInvoiceSheet";
import { useSettings } from "@/hooks/useSettings";

type Invoice = Tables<"invoices"> & {
  customers: {
    name: string;
  } | null;
  categories: {
    name: string;
  } | null;
};

interface InvoiceListProps {
  invoices: Invoice[];
  isLoading: boolean;
  handleDeleteInvoice: (invoiceId: string, e: React.MouseEvent) => Promise<void>;
  refreshInvoices: () => void;
}

export const InvoiceList = ({
  invoices,
  isLoading,
  handleDeleteInvoice,
  refreshInvoices
}: InvoiceListProps) => {
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const { settings } = useSettings();

  const formatCurrency = (amount: number, currency?: string) => {
    const currencyCode = currency || "USD";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
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
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading invoices...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No invoices found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{invoice.invoice_number}</h3>
              <p className="text-sm text-muted-foreground">{invoice.customers?.name || "Unknown customer"}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {invoice.invoicing_company && (
                  <span>From: {invoice.invoicing_company}</span>
                )}
                {invoice.categories?.name && (
                  <>
                    <span>•</span>
                    <span>{invoice.categories.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-sm font-medium">Amount</p>
              <p className="text-sm text-muted-foreground">
                {settings?.show_currency
                  ? formatCurrency(Number(invoice.amount), invoice.currency)
                  : formatCurrency(Number(invoice.amount))
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Date</p>
              <p className="text-sm text-muted-foreground">{formatDate(invoice.issued_date)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Due Date</p>
              <p className="text-sm text-muted-foreground">{formatDate(invoice.due_date)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  invoice.status === "Paid" || invoice.status === "paid"
                    ? "default"
                    : invoice.status === "Pending" || invoice.status === "pending"
                    ? "secondary"
                    : "destructive"
                }
              >
                {invoice.status}
              </Badge>
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
            </div>
          </div>
        </div>
      ))}

      <EditInvoiceSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        invoice={editingInvoice}
        onInvoiceUpdated={refreshInvoices}
      />
    </div>
  );
}
