
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useInvoices } from "@/hooks/useInvoices";
import { useAuth } from "@/components/AuthProvider";
import { InvoiceList } from "@/components/InvoiceList";
import { NewInvoiceSheet } from "@/components/NewInvoiceSheet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CustomerInvoicesProps {
  customerId: string;
}

export function CustomerInvoices({ customerId }: CustomerInvoicesProps) {
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const { user } = useAuth();
  const { invoices, isLoading, handleDeleteInvoice, refreshInvoices } = useInvoices(user, "all", customerId);

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Customer Invoices</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setNewInvoiceOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Invoice
        </Button>
      </CardHeader>
      <CardContent>
        <InvoiceList 
          invoices={invoices} 
          isLoading={isLoading} 
          handleDeleteInvoice={handleDeleteInvoice}
        />
      </CardContent>

      <NewInvoiceSheet
        open={newInvoiceOpen}
        onOpenChange={setNewInvoiceOpen}
        onInvoiceCreated={refreshInvoices}
        customerId={customerId}
      />
    </Card>
  );
}
