import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { useFacturante } from "@/hooks/useFacturante";
import { Loader2 } from "lucide-react";

interface InvoiceFormActionsProps {
  invoice?: Tables<"invoices">;
  isLoading: boolean;
  customer?: Tables<"customers">;
}

export const InvoiceFormActions = ({
  invoice,
  isLoading,
  customer,
}: InvoiceFormActionsProps) => {
  const { isGenerating, generateFiscalInvoice } = useFacturante();

  const handleGenerateFiscalInvoice = async () => {
    if (!invoice || !customer) return;
    await generateFiscalInvoice(invoice, customer);
  };

  return (
    <div className="flex justify-end gap-2">
      <Button
        type="submit"
        disabled={isLoading}
        className="w-32"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {invoice ? "Update" : "Create"}
      </Button>

      {invoice && customer && (
        <Button
          type="button"
          variant="outline"
          onClick={handleGenerateFiscalInvoice}
          disabled={isGenerating}
          className="w-48"
        >
          {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Fiscal Invoice
        </Button>
      )}
    </div>
  );
};
