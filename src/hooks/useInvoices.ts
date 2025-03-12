
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

export type Invoice = Tables<"invoices"> & {
  customers: {
    name: string;
  } | null;
};

export const useInvoices = (user: any, activeTab: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = async () => {
    if (!user && !import.meta.env.DEV) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from("invoices")
        .select(`
          *,
          customers (
            name
          )
        `);

      // Filter by status if not 'all'
      if (activeTab !== "all") {
        query = query.eq("status", activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
      }

      const { data, error } = await query;

      if (error) throw error;

      setInvoices(data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
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

  useEffect(() => {
    fetchInvoices();
  }, [user, activeTab]);

  return {
    invoices,
    isLoading,
    handleDeleteInvoice,
  };
};
