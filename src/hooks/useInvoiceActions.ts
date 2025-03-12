
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

export const useInvoiceActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const createInvoice = async (invoiceData: any) => {
    if (!user && !import.meta.env.DEV) {
      toast.error("You must be logged in to create an invoice");
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .insert({
          ...invoiceData,
          user_id: user?.id || "00000000-0000-0000-0000-000000000000",
        })
        .select('*')
        .single();

      if (error) throw error;

      toast.success("Invoice created successfully");
      return data;
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateInvoice = async (invoiceId: string, invoiceData: any) => {
    if (!user && !import.meta.env.DEV) {
      toast.error("You must be logged in to update an invoice");
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .update(invoiceData)
        .eq("id", invoiceId)
        .select('*')
        .single();

      if (error) throw error;

      toast.success("Invoice updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createInvoice,
    updateInvoice,
    isLoading
  };
};
