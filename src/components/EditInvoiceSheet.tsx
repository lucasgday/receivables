
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { InvoiceForm } from "./InvoiceForm";
import { Tables } from "@/integrations/supabase/types";

type Invoice = Tables<"invoices">;

interface EditInvoiceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceUpdated: () => void;
  invoice: Invoice | null;
}

export function EditInvoiceSheet({ 
  open, 
  onOpenChange, 
  onInvoiceUpdated, 
  invoice 
}: EditInvoiceSheetProps) {
  if (!invoice) return null;
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Invoice</SheetTitle>
          <SheetDescription>
            Update the invoice details below.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <InvoiceForm 
            invoice={invoice} 
            onSuccess={() => {
              onInvoiceUpdated();
              onOpenChange(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
