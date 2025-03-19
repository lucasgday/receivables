import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const contractSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  start_date: z.string(),
  end_date: z.string().optional(),
  file_url: z.string().optional(),
});

const recurringPaymentSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  frequency: z.enum(["monthly", "quarterly", "yearly"]),
  start_date: z.string(),
  end_date: z.string().optional(),
  is_variable: z.boolean().default(false),
});

interface InvoiceContractSectionProps {
  customerId: string;
  onContractAdded?: (contract: Tables<"contracts">) => void;
}

export const InvoiceContractSection = ({
  customerId,
  onContractAdded,
}: InvoiceContractSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const contractForm = useForm<z.infer<typeof contractSchema>>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      name: "",
      description: "",
      start_date: new Date().toISOString().split("T")[0],
      is_variable: false,
    },
  });

  const paymentForm = useForm<z.infer<typeof recurringPaymentSchema>>({
    resolver: zodResolver(recurringPaymentSchema),
    defaultValues: {
      amount: 0,
      currency: "USD",
      frequency: "monthly",
      start_date: new Date().toISOString().split("T")[0],
      is_variable: false,
    },
  });

  const onSubmitContract = async (data: z.infer<typeof contractSchema>) => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data: contract, error } = await supabase
        .from("contracts")
        .insert({
          ...data,
          customer_id: customerId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contract added successfully",
      });

      if (onContractAdded) {
        onContractAdded(contract);
      }

      setIsOpen(false);
      contractForm.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add contract",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPayment = async (data: z.infer<typeof recurringPaymentSchema>) => {
    if (!user) return;
    setIsLoading(true);

    try {
      // First create the recurring payment
      const { data: payment, error: paymentError } = await supabase
        .from("recurring_payments")
        .insert({
          ...data,
          customer_id: customerId,
          user_id: user.id,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // If it's a variable payment, create the first payment
      if (data.is_variable) {
        const { error: variableError } = await supabase
          .from("variable_payments")
          .insert({
            recurring_payment_id: payment.id,
            amount: data.amount,
            due_date: data.start_date,
          });

        if (variableError) throw variableError;
      }

      toast({
        title: "Success",
        description: "Recurring payment added successfully",
      });

      setIsOpen(false);
      paymentForm.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add recurring payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Contracts & Recurring Payments</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add Contract</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contract</DialogTitle>
            </DialogHeader>
            <Form {...contractForm}>
              <form onSubmit={contractForm.handleSubmit(onSubmitContract)} className="space-y-4">
                <FormField
                  control={contractForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contractForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contractForm.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contractForm.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  Add Contract
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Add recurring payment form */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Add Recurring Payment</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Recurring Payment</DialogTitle>
          </DialogHeader>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)} className="space-y-4">
              <FormField
                control={paymentForm.control}
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="is_variable"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                    <FormLabel>Variable Amount</FormLabel>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                Add Recurring Payment
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
