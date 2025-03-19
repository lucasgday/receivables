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

export const useInvoices = (user: any, activeTab: string, customerId?: string) => {
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

      // Filter by status if not 'all'
      if (activeTab !== "all") {
        query = query.eq("status", activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
      }

      // Filter by customer if customerId is provided
      if (customerId) {
        query = query.eq("customer_id", customerId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process invoices to determine overdue status
      const processedInvoices = (data || []).map(invoice => {
        const today = new Date();
        const dueDate = new Date(invoice.due_date);

        // If invoice is not paid and due date is in the past, mark as overdue
        if (invoice.status !== "Paid" && dueDate < today) {
          return {
            ...invoice,
            status: "Overdue"
          };
        }
        return invoice;
      });

      setInvoices(processedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  }, [user, activeTab, customerId]);

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
