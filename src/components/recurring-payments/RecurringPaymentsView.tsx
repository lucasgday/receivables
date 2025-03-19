import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/components/AuthProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { AddRecurringPaymentDialog } from "./AddRecurringPaymentDialog";

type RecurringPayment = Tables<"recurring_payments">;
type Customer = Tables<"customers">;

export const RecurringPaymentsView = () => {
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    fetchRecurringPayments();
    fetchCustomers();
  }, [user]);

  const fetchRecurringPayments = async () => {
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("recurring_payments")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;

      setPayments(paymentsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch recurring payments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user?.id)
        .order("name");

      if (customersError) throw customersError;

      setCustomers(customersData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch customers",
        variant: "destructive",
      });
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from("recurring_payments")
        .delete()
        .eq("id", paymentId);

      if (error) throw error;

      setPayments(payments.filter(p => p.id !== paymentId));
      toast({
        title: "Success",
        description: "Recurring payment deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete recurring payment",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recurring Payments</h2>
        <AddRecurringPaymentDialog
          customers={customers}
          onSuccess={fetchRecurringPayments}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => {
            const customer = customers.find(c => c.id === payment.customer_id);
            return (
              <TableRow key={payment.id}>
                <TableCell>{customer?.name}</TableCell>
                <TableCell>
                  {payment.amount} {payment.currency}
                </TableCell>
                <TableCell className="capitalize">{payment.frequency}</TableCell>
                <TableCell>
                  {format(new Date(payment.start_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {payment.end_date
                    ? format(new Date(payment.end_date), "MMM d, yyyy")
                    : "No end date"}
                </TableCell>
                <TableCell>
                  <Badge variant={payment.is_variable ? "secondary" : "default"}>
                    {payment.is_variable ? "Variable" : "Fixed"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePayment(payment.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
