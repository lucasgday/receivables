
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { InvoiceForm } from "./InvoiceForm";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface NewInvoiceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceCreated: () => void;
  customerId?: string;
  isLoading?: boolean;
}

export function NewInvoiceSheet({ 
  open, 
  onOpenChange, 
  onInvoiceCreated, 
  customerId,
  isLoading = false
}: NewInvoiceSheetProps) {
  const [formKey, setFormKey] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      // Reset any previous errors
      setError(null);
      // Generate a new key to force a form reset
      setFormKey(Date.now());
    }
  }, [open]);

  const handleSuccess = () => {
    try {
      onInvoiceCreated();
      onOpenChange(false);
    } catch (err) {
      console.error("Error in handleSuccess:", err);
      setError("An error occurred after creating the invoice");
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-xl w-full">
        <SheetHeader>
          <SheetTitle>Create New Invoice</SheetTitle>
          <SheetDescription>
            Fill out the form below to create a new invoice.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : open && (
            <InvoiceForm 
              key={formKey}
              customerId={customerId} 
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
