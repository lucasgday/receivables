
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/useSettings";
import { useForm } from "react-hook-form";

type Invoice = Tables<"invoices">;
type Customer = Tables<"customers">;

export const useInvoiceForm = (
  invoice?: Invoice,
  customerId?: string,
  onSuccess?: () => void
) => {
  const { settings } = useSettings();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showPaymentDate, setShowPaymentDate] = useState(invoice?.status === "Paid" || false);

  const defaultValues = invoice || {
    customer_id: customerId || "",
    status: "Pending",
    amount: 0,
    issued_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    invoice_number: `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    notes: "",
    category_id: "",
    paid_date: "",
    currency: settings?.default_currency || "USD",
    invoicing_company: settings?.default_company || "",
  };

  // Convert paid_date to string format for the form
  if (invoice?.paid_date) {
    defaultValues.paid_date = new Date(invoice.paid_date).toISOString().split('T')[0];
  }

  const form = useForm<any>({
    defaultValues,
  });

  // Watch the status field to show/hide payment date
  const watchedStatus = form.watch("status");
  
  useEffect(() => {
    setShowPaymentDate(watchedStatus === "Paid");
    
    // If status is set to Paid and there's no paid_date, set it to today
    if (watchedStatus === "Paid" && !form.getValues("paid_date")) {
      form.setValue("paid_date", new Date().toISOString().split('T')[0]);
    }
  }, [watchedStatus, form]);

  // Set default values from settings when settings loaded
  useEffect(() => {
    if (settings && !invoice) {
      form.setValue("currency", settings.default_currency || "USD");
      form.setValue("invoicing_company", settings.default_company || "");
    }
  }, [settings, form, invoice]);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .eq("status", "Active");

        if (error) throw error;
        setCustomers(data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCustomers();
    fetchCategories();
  }, []);

  return {
    form,
    customers,
    categories,
    isLoadingCustomers,
    isLoadingCategories,
    showPaymentDate,
    watchedStatus
  };
};
