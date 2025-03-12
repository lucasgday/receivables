
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { FileText, Plus, Trash } from "lucide-react";
import { Badge } from "./ui/badge";

type Customer = Tables<"customers">;
type Invoice = Tables<"invoices">;

export const CustomerDetails = ({
  customer,
  open,
  onOpenChange,
  onCustomerUpdate,
}: {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerUpdate?: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const form = useForm<Customer>({
    defaultValues: customer || undefined,
  });

  // Update form values when customer changes
  useState(() => {
    if (customer) {
      form.reset(customer);
    }
  });

  // Fetch customer's invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!customer) return;
      
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("customer_id", customer.id)
          .order("issued_date", { ascending: false });

        if (error) throw error;
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to load invoices");
      } finally {
        setIsLoadingInvoices(false);
      }
    };

    fetchInvoices();
  }, [customer]);

  const onSubmit = async (data: Customer) => {
    if (!customer) return;
    
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          name: data.name,
          contact: data.contact,
          email: data.email,
          status: data.status,
        })
        .eq("id", customer.id);

      if (error) throw error;

      toast.success("Customer updated successfully");
      setIsEditing(false);
      if (onCustomerUpdate) {
        onCustomerUpdate();
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Failed to update customer");
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoiceId);

      if (error) throw error;

      setInvoices(invoices.filter(inv => inv.id !== invoiceId));
      toast.success("Invoice deleted successfully");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (!customer) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex justify-between items-center">
            <span>Customer Details</span>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel Edit" : "Edit"}
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="mt-6">Save Changes</Button>
              </form>
            </Form>
          ) : (
            <>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Company Name</h3>
                  <p className="mt-1">{customer.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Contact Person</h3>
                  <p className="mt-1">{customer.contact}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="mt-1">{customer.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <p className="mt-1">{customer.status || "Active"}</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Invoices</h3>
                {isLoadingInvoices ? (
                  <p className="text-muted-foreground">Loading invoices...</p>
                ) : invoices.length === 0 ? (
                  <p className="text-muted-foreground">No invoices found</p>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{invoice.invoice_number}</h3>
                            <p className="text-sm text-muted-foreground">Due: {formatDate(invoice.due_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">Amount</p>
                            <p className="text-sm text-muted-foreground">{formatCurrency(Number(invoice.amount))}</p>
                          </div>
                          <Badge
                            variant={
                              invoice.status === "Paid" || invoice.status === "paid"
                                ? "default"
                                : invoice.status === "Pending" || invoice.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {invoice.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteInvoice(invoice.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
