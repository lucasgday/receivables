import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

export type Invoice = Tables<"invoices"> & {
  customers: {
    name: string;
  } | null;
  categories: {
    name: string;
  } | null;
};

export type SortField = "created_at" | "due_date" | "amount" | "customer_name" | "currency" | "invoicing_company";
export type SortOrder = "asc" | "desc";

interface InvoiceFilters {
  searchQuery: string;
  status: string;
  customerId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
}

export const useInvoices = (
  user: any,
  filters: InvoiceFilters,
  sortField: SortField = "created_at",
  sortOrder: SortOrder = "desc"
) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    if (!user && !import.meta.env.DEV) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from("invoices")
        .select(`
          *,
          customers (
            name
          ),
          categories (
            name
          )
        `);

      // Apply filters
      if (filters.status !== "all" && filters.status !== "overdue") {
        query = query.eq("status", filters.status.charAt(0).toUpperCase() + filters.status.slice(1));
      }

      if (filters.customerId) {
        query = query.eq("customer_id", filters.customerId);
      }

      if (filters.dateRange) {
        query = query
          .gte("created_at", filters.dateRange.start.toISOString())
          .lte("created_at", filters.dateRange.end.toISOString());
      }

      if (filters.amountRange) {
        query = query
          .gte("amount", filters.amountRange.min)
          .lte("amount", filters.amountRange.max);
      }

      // Apply sorting
      if (sortField === "customer_name") {
        query = query.order("customers(name)", { ascending: sortOrder === "asc" });
      } else {
        query = query.order(sortField, { ascending: sortOrder === "asc" });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process invoices to determine overdue status
      const processedInvoices = (data || []).map(invoice => {
        const today = new Date();
        const dueDate = new Date(invoice.due_date);

        // Mark as overdue if due date is in the past, regardless of status
        if (dueDate < today) {
          return {
            ...invoice,
            status: "Overdue"
          };
        }
        return invoice;
      });

      // Apply search filter
      let filteredInvoices = processedInvoices;
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        filteredInvoices = processedInvoices.filter(invoice =>
          invoice.invoice_number.toLowerCase().includes(searchLower) ||
          invoice.customers?.name.toLowerCase().includes(searchLower) ||
          invoice.amount.toString().includes(searchLower) ||
          invoice.currency.toLowerCase().includes(searchLower) ||
          invoice.invoicing_company.toLowerCase().includes(searchLower)
        );
      }

      // Filter by overdue status if selected
      if (filters.status === "overdue") {
        filteredInvoices = filteredInvoices.filter(invoice => invoice.status === "Overdue");
      }

      setInvoices(filteredInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  }, [user, filters, sortField, sortOrder]);

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

  const refreshInvoices = () => {
    fetchInvoices();
  };

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    isLoading,
    handleDeleteInvoice,
    refreshInvoices,
  };
};
