
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  amount: number;
  currency: string;
  status: string;
  issued_date: string;
  customers: {
    name: string;
  };
}

interface BankMovement {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  company_id: string;
  user_id: string;
}

interface LinkInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movement: BankMovement | null;
  onInvoiceLinked: () => void;
}

export function LinkInvoiceDialog({ open, onOpenChange, movement, onInvoiceLinked }: LinkInvoiceDialogProps) {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && movement) {
      fetchInvoices();
    } else {
      setSelectedInvoice(null);
    }
  }, [open, movement]);

  const fetchInvoices = async () => {
    if (!user || !movement) return;

    setIsLoading(true);
    try {
      // Find invoices that are not fully paid and close to the movement amount
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          customer_id,
          amount,
          currency,
          status,
          issued_date,
          customers (name)
        `)
        .eq("user_id", user.id)
        .neq("status", "Paid")
        .order("issued_date", { ascending: false });
      
      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkInvoice = async () => {
    if (!selectedInvoice || !movement) return;
    
    try {
      // Start a transaction
      const { error: movementError } = await supabase
        .from("bank_movements")
        .update({ invoice_id: selectedInvoice })
        .eq("id", movement.id);
      
      if (movementError) throw movementError;
      
      // Update invoice status to Paid
      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({ 
          status: "Paid",
          paid_date: movement.date
        })
        .eq("id", selectedInvoice);
      
      if (invoiceError) throw invoiceError;
      
      toast.success("Invoice linked and marked as paid");
      onInvoiceLinked();
    } catch (error) {
      console.error("Error linking invoice:", error);
      toast.error("Failed to link invoice");
    }
  };

  if (!movement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link Invoice to Bank Movement</DialogTitle>
          <DialogDescription>
            Select an invoice to link to this bank movement. This will mark the invoice as paid.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Movement Details:</h3>
            <p className="text-sm">Date: {new Date(movement.date).toLocaleDateString()}</p>
            <p className="text-sm">Amount: {movement.amount} {movement.currency}</p>
            <p className="text-sm">Description: {movement.description}</p>
            <p className="text-sm">Reference: {movement.reference}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Invoice:</label>
            <Select
              disabled={isLoading || invoices.length === 0}
              value={selectedInvoice || ""}
              onValueChange={setSelectedInvoice}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an invoice" />
              </SelectTrigger>
              <SelectContent>
                {invoices.map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    {invoice.invoice_number} - {invoice.customers.name} - {invoice.amount} {invoice.currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {invoices.length === 0 && !isLoading && (
              <p className="text-sm text-red-500">No unpaid invoices found</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleLinkInvoice} 
            disabled={!selectedInvoice || isLoading}
          >
            Link Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
