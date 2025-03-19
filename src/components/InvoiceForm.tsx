import { Form } from "@/components/ui/form";
import { Tables } from "@/integrations/supabase/types";
import { useInvoiceActions } from "@/hooks/useInvoiceActions";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { useSettings } from "@/hooks/useSettings";
import { InvoiceBasicDetails } from "./invoice/InvoiceBasicDetails";
import { InvoiceCategoryField } from "./invoice/InvoiceCategoryField";
import { InvoiceAmountFields } from "./invoice/InvoiceAmountFields";
import { InvoiceDateFields } from "./invoice/InvoiceDateFields";
import { InvoiceStatusField } from "./invoice/InvoiceStatusField";
import { InvoiceNotesField } from "./invoice/InvoiceNotesField";
import { InvoiceFormActions } from "./invoice/InvoiceFormActions";
import { InvoiceContractSection } from "./invoice/InvoiceContractSection";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

type Invoice = Tables<"invoices">;

const invoiceSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  category_id: z.string().nullable(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  due_date: z.string().min(1, "Due date is required"),
  issued_date: z.string().min(1, "Issue date is required"),
  invoice_number: z.string().min(1, "Invoice number is required"),
  invoicing_company: z.string().nullable(),
  notes: z.string().nullable(),
  paid_date: z.string().nullable(),
  status: z.string().min(1, "Status is required"),
  user_id: z.string().min(1, "User ID is required"),
});

export const InvoiceForm = ({
  onSuccess,
  customerId,
  invoice,
}: {
  onSuccess?: (invoice: Invoice) => void;
  customerId?: string;
  invoice?: Invoice;
}) => {
  const { createInvoice, updateInvoice, isLoading } = useInvoiceActions();
  const { settings, incrementInvoiceNumber } = useSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    form,
    customers,
    categories,
    isLoadingCustomers,
    isLoadingCategories,
    showPaymentDate,
    watchedStatus
  } = useInvoiceForm(invoice, customerId, () => {
    if (onSuccess && invoice) {
      onSuccess(invoice);
    }
  });

  const [selectedCurrency, setSelectedCurrency] = useState(settings?.default_currency || "USD");
  const [formIsLoading, setFormIsLoading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
  };

  const onSubmit = async (data: z.infer<typeof invoiceSchema>) => {
    if (!user) return;
    setFormIsLoading(true);

    try {
      if (invoice) {
        // Update existing invoice
        const { data: updatedInvoice, error } = await supabase
          .from("invoices")
          .update({
            ...data,
            user_id: user.id,
          })
          .eq("id", invoice.id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Success",
          description: "Invoice updated successfully",
        });

        if (onSuccess) {
          onSuccess(updatedInvoice);
        }
      } else {
        // Create new invoice
        const nextNumber = await incrementInvoiceNumber();
        if (!nextNumber) {
          throw new Error("Failed to generate invoice number");
        }

        // Format the invoice number (e.g., "INV-0001")
        const formattedNumber = `INV-${String(nextNumber).padStart(4, "0")}`;

        const { data: newInvoice, error } = await supabase
          .from("invoices")
          .insert({
            ...data,
            user_id: user.id,
            invoice_number: formattedNumber,
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Success",
          description: "Invoice created successfully",
        });

        if (onSuccess) {
          onSuccess(newInvoice);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || (invoice ? "Failed to update invoice" : "Failed to create invoice"),
        variant: "destructive",
      });
    } finally {
      setFormIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <InvoiceBasicDetails
          form={form}
          customerId={customerId}
          customers={customers}
          isLoadingCustomers={isLoadingCustomers}
          showCompany={settings?.show_company || false}
          companies={settings?.companies || []}
        />

        <InvoiceCategoryField
          form={form}
          categories={categories}
          isLoadingCategories={isLoadingCategories}
        />

        <InvoiceAmountFields
          form={form}
          showCurrency={settings?.show_currency || false}
          invoiceCurrency={selectedCurrency}
          onCurrencyChange={handleCurrencyChange}
        />

        <InvoiceDateFields
          form={form}
          showPaymentDate={showPaymentDate}
          watchedStatus={watchedStatus}
        />

        <InvoiceStatusField form={form} />

        <InvoiceNotesField form={form} />

        {customerId && (
          <InvoiceContractSection
            customerId={customerId}
            onContractAdded={() => {
              toast({
                title: "Success",
                description: "Contract added successfully",
              });
            }}
          />
        )}

        <InvoiceFormActions
          invoice={invoice}
          isLoading={formIsLoading}
          customer={customers.find(c => c.id === form.getValues("customer_id"))}
        />
      </form>
    </Form>
  );
};
