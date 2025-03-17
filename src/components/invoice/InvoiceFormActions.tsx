import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";

type Invoice = Tables<"invoices">;

export const InvoiceFormActions = ({
  invoice,
  isLoading,
}: {
  invoice?: Invoice;
  isLoading: boolean;
}) => {
  return (
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
  );
};
