
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { InvoiceForm } from "./InvoiceForm";

export const AddInvoiceSheet = ({
  open,
  onOpenChange,
  onInvoiceAdded,
  customerId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceAdded?: () => void;
  customerId?: string;
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Create New Invoice</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <InvoiceForm
            customerId={customerId}
            onSuccess={() => {
              onOpenChange(false);
              if (onInvoiceAdded) onInvoiceAdded();
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
