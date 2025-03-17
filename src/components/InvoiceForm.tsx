
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

type Invoice = Tables<"invoices">;

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
  const { 
    form, 
    customers, 
    categories, 
    isLoadingCustomers, 
    isLoadingCategories,
    showPaymentDate,
    watchedStatus
  } = useInvoiceForm(invoice, customerId, onSuccess);

  const onSubmit = async (data: any) => {
    // Handle empty paid_date when status is not Paid
    if (data.status !== "Paid") {
      data.paid_date = null;
    }
    
    // Handle no-category selection
    if (data.category_id === "no-category" || data.category_id === "") {
      data.category_id = null;
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
          enabledCurrencies={settings?.enabled_currencies}
        />
        
        <InvoiceDateFields 
          form={form}
          showPaymentDate={showPaymentDate}
          watchedStatus={watchedStatus}
        />
        
        <InvoiceStatusField form={form} />
        
        <InvoiceNotesField form={form} />
        
        <InvoiceFormActions 
          invoice={invoice}
          isLoading={isLoading}
        />
      </form>
    </Form>
  );
};
