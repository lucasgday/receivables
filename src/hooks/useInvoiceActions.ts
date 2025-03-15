
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

    if (!invoiceData.customer_id) {
      toast.error("Customer is required");
      return null;
    }

    setIsLoading(true);
    try {
      // Handle empty category selection
      if (invoiceData.category_id === "no-category" || invoiceData.category_id === "") {
        invoiceData.category_id = null;
      }

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
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast.error(error.message || "Failed to create invoice");
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

    if (!invoiceId) {
      toast.error("Invoice ID is required");
      return null;
    }

    setIsLoading(true);
    try {
      // Handle empty category selection
      if (invoiceData.category_id === "no-category" || invoiceData.category_id === "") {
        invoiceData.category_id = null;
      }

      const { data, error } = await supabase
        .from("invoices")
        .update(invoiceData)
        .eq("id", invoiceId)
        .select('*')
        .single();

      if (error) throw error;

      toast.success("Invoice updated successfully");
      return data;
    } catch (error: any) {
      console.error("Error updating invoice:", error);
      toast.error(error.message || "Failed to update invoice");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getInvoice = async (invoiceId: string) => {
    if (!invoiceId) {
      toast.error("Invoice ID is required");
      return null;
    }

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
        .eq("id", invoiceId)
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error("Error fetching invoice:", error);
      toast.error(error.message || "Failed to fetch invoice");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createInvoice,
    updateInvoice,
    getInvoice,
    isLoading
  };
};
