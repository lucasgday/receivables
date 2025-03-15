
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tables } from "@/integrations/supabase/types";
import { useInvoiceActions } from "@/hooks/useInvoiceActions";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/hooks/useSettings";

type Invoice = Tables<"invoices">;
type Customer = Tables<"customers">;

export const InvoiceForm = ({
  onSuccess,
  customerId,
  invoice,
}: {
  onSuccess?: () => void;
  customerId?: string;
  invoice?: Invoice;
}) => {
  const { createInvoice, updateInvoice, isLoading } = useInvoiceActions();
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

  const onSubmit = async (data: any) => {
    // Handle empty paid_date when status is not Paid
    if (data.status !== "Paid") {
      data.paid_date = null;
    }
    
    let result;
    if (invoice) {
      result = await updateInvoice(invoice.id, data);
    } else {
      result = await createInvoice(data);
    }
    
    if (result && onSuccess) {
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="invoice_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Number</FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {!customerId && (
          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select
                  disabled={isLoadingCustomers}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {settings?.show_company && (
          <FormField
            control={form.control}
            name="invoicing_company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoicing Company</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your Company Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                disabled={isLoadingCategories}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no-category">No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {settings?.show_currency && (
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem className="w-24">
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="USD" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        <FormField
          control={form.control}
          name="issued_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {showPaymentDate && (
          <FormField
            control={form.control}
            name="paid_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    required={watchedStatus === "Paid"}
                    value={field.value || ""} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading 
              ? (invoice ? "Updating Invoice..." : "Creating Invoice...") 
              : (invoice ? "Update Invoice" : "Create Invoice")}
          </Button>
          
          {invoice && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => window.open(`/invoice-pdf/${invoice.id}`, '_blank')}
            >
              Generate PDF
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
