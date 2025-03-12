
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useAuth } from "./AuthProvider";
import { useNavigate } from "react-router-dom";

type Invoice = Tables<"invoices">;

export const InvoiceForm = ({
  onSuccess,
  customerId,
  invoice,
}: {
  onSuccess?: () => void;
  customerId?: string;
  invoice?: Invoice;
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const form = useForm<Invoice>({
    defaultValues: invoice || {
      customer_id: customerId,
      status: "Pending",
    },
  });

  const onSubmit = async (data: any) => {
    if (!user && !import.meta.env.DEV) {
      navigate("/auth");
      return;
    }

    try {
      const { error } = invoice
        ? await supabase
            .from("invoices")
            .update({
              amount: data.amount,
              invoice_number: data.invoice_number,
              issued_date: data.issued_date,
              due_date: data.due_date,
              status: data.status,
              notes: data.notes,
            })
            .eq("id", invoice.id)
        : await supabase
            .from("invoices")
            .insert({
              ...data,
              user_id: user?.id || "00000000-0000-0000-0000-000000000000",
            });

      if (error) {
        if (error.code === "42501") {
          // Permission denied error
          navigate("/auth");
          return;
        }
        throw error;
      }

      toast.success(invoice ? "Invoice updated successfully" : "Invoice created successfully");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="invoice_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Number</FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="issued_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} required />
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
                <select
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {invoice ? "Update Invoice" : "Create Invoice"}
        </Button>
      </form>
    </Form>
  );
};
