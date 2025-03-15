
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";

type Customer = Tables<"customers">;

interface InvoiceBasicDetailsProps {
  form: UseFormReturn<any>;
  customerId?: string;
  customers: Customer[];
  isLoadingCustomers: boolean;
  showCompany: boolean;
}

export const InvoiceBasicDetails = ({
  form,
  customerId,
  customers,
  isLoadingCustomers,
  showCompany,
}: InvoiceBasicDetailsProps) => {
  return (
    <>
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
      
      {!customerId && (
        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select
                disabled={isLoadingCustomers}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {showCompany && (
        <FormField
          control={form.control}
          name="invoicing_company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoicing Company</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your Company Name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};
