
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface InvoiceDateFieldsProps {
  form: UseFormReturn<any>;
  showPaymentDate: boolean;
  watchedStatus: string;
}

export const InvoiceDateFields = ({
  form,
  showPaymentDate,
  watchedStatus,
}: InvoiceDateFieldsProps) => {
  return (
    <>
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
      
      {showPaymentDate && (
        <FormField
          control={form.control}
          name="paid_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Date</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  required={watchedStatus === "Paid"}
                  value={field.value || ""} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};
