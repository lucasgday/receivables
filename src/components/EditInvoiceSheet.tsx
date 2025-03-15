
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { InvoiceForm } from "./InvoiceForm";
import { Tables } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
  const [formKey, setFormKey] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);
  
  // Reset form when new invoice is loaded or sheet opens
  useEffect(() => {
    if (open && invoice) {
      // Reset any previous errors
      setError(null);
      setFormKey(Date.now());
    }
  }, [invoice, open]);

  const handleSuccess = () => {
    try {
      onInvoiceUpdated();
      onOpenChange(false);
    } catch (err) {
      console.error("Error in handleSuccess:", err);
      setError("An error occurred after updating the invoice");
      toast.error("An unexpected error occurred");
    }
  };

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
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {open && (
            invoice ? (
              <InvoiceForm 
                key={formKey}
                invoice={invoice} 
                onSuccess={handleSuccess}
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
