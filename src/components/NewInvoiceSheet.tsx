
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { InvoiceForm } from "./InvoiceForm";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      // Generate a new key to force a form reset
      setFormKey(Date.now());
    }
  }, [open]);

  const handleSuccess = () => {
    onInvoiceCreated();
    onOpenChange(false);
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
