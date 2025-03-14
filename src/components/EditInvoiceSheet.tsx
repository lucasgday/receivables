
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { InvoiceForm } from "./InvoiceForm";
import { Tables } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";

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
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-xl w-full">
        <SheetHeader>
          <SheetTitle>Edit Invoice</SheetTitle>
          <SheetDescription>
            Update the invoice details below.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          {open && (
            invoice ? (
              <InvoiceForm 
                invoice={invoice} 
                onSuccess={() => {
                  onInvoiceUpdated();
                  onOpenChange(false);
                }}
              />
            ) : (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
