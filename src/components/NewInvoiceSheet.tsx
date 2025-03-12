
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { InvoiceForm } from "./InvoiceForm";

interface NewInvoiceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceCreated: () => void;
  customerId?: string;
}

export function NewInvoiceSheet({ open, onOpenChange, onInvoiceCreated, customerId }: NewInvoiceSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Invoice</SheetTitle>
          <SheetDescription>
            Fill out the form below to create a new invoice.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <InvoiceForm 
            customerId={customerId} 
            onSuccess={() => {
              onInvoiceCreated();
              onOpenChange(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
