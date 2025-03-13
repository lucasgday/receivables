
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Link, X } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { LinkInvoiceDialog } from "./LinkInvoiceDialog";

interface BankMovement {
  id: string;
  company_id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  reference: string;
  invoice_id: string | null;
  created_at: string;
  user_id: string;
  invoices?: {
    id: string;
    invoice_number: string;
    amount: number;
    customer_id: string;
    customers: {
      name: string;
    };
  } | null;
}

export function BankMovementsList({ userId, companyId }: { userId?: string; companyId: string | null }) {
  const [movements, setMovements] = useState<BankMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BankMovement>>({});
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<BankMovement | null>(null);

  useEffect(() => {
    fetchMovements();
  }, [userId, companyId]);

  const fetchMovements = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from("bank_movements")
        .select(`
          *,
          invoices(id, invoice_number, amount, customer_id, customers(name))
        `)
        .eq("user_id", userId)
        .order("date", { ascending: false });
      
      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMovements(data as BankMovement[] || []);
    } catch (error) {
      console.error("Error fetching bank movements:", error);
      toast.error("Failed to load bank movements");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (movement: BankMovement) => {
    setEditingId(movement.id);
    setEditForm({
      date: movement.date,
      description: movement.description,
      amount: movement.amount,
      reference: movement.reference,
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    
    try {
      const { error } = await supabase
        .from("bank_movements")
        .update(editForm)
        .eq("id", editingId);
      
      if (error) throw error;
      
      toast.success("Movement updated successfully");
      setEditingId(null);
      fetchMovements();
    } catch (error) {
      console.error("Error updating movement:", error);
      toast.error("Failed to update movement");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this movement?")) return;
    
    try {
      const { error } = await supabase
        .from("bank_movements")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Movement deleted successfully");
      fetchMovements();
    } catch (error) {
      console.error("Error deleting movement:", error);
      toast.error("Failed to delete movement");
    }
  };

  const handleLinkInvoice = (movement: BankMovement) => {
    setSelectedMovement(movement);
    setLinkDialogOpen(true);
  };

  const handleUnlinkInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from("bank_movements")
        .update({ invoice_id: null })
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Invoice unlinked successfully");
      fetchMovements();
    } catch (error) {
      console.error("Error unlinking invoice:", error);
      toast.error("Failed to unlink invoice");
    }
  };

  const onInvoiceLinked = () => {
    setLinkDialogOpen(false);
    fetchMovements();
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading bank movements...</div>;
  }

  if (movements.length === 0) {
    return (
      <div className="text-center py-4">
        No bank movements found. Upload a CSV file to get started.
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Linked Invoice</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>
                {editingId === movement.id ? (
                  <Input
                    type="date"
                    value={editForm.date || ''}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  />
                ) : (
                  format(new Date(movement.date), 'MMM dd, yyyy')
                )}
              </TableCell>
              <TableCell>
                {editingId === movement.id ? (
                  <Input
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                ) : (
                  movement.description
                )}
              </TableCell>
              <TableCell>
                {editingId === movement.id ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.amount || 0}
                    onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                  />
                ) : (
                  `${movement.amount.toFixed(2)} ${movement.currency}`
                )}
              </TableCell>
              <TableCell>
                {editingId === movement.id ? (
                  <Input
                    value={editForm.reference || ''}
                    onChange={(e) => setEditForm({ ...editForm, reference: e.target.value })}
                  />
                ) : (
                  movement.reference
                )}
              </TableCell>
              <TableCell>
                {movement.invoice_id ? (
                  <div className="flex items-center gap-2">
                    <span>{movement.invoices?.invoice_number}</span>
                    <Button size="icon" variant="ghost" onClick={() => handleUnlinkInvoice(movement.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => handleLinkInvoice(movement)}>
                    <Link className="h-4 w-4 mr-2" />
                    Link Invoice
                  </Button>
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingId === movement.id ? (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={handleSave}>Save</Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(movement)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(movement.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <LinkInvoiceDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        movement={selectedMovement}
        onInvoiceLinked={onInvoiceLinked}
      />
    </div>
  );
}
