
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface InvoiceAmountFieldsProps {
  form: UseFormReturn<any>;
  showCurrency: boolean;
}

export const InvoiceAmountFields = ({
  form,
  showCurrency,
}: InvoiceAmountFieldsProps) => {
  return (
    <div className="flex gap-4">
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem className="flex-1">
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
      
      {showCurrency && (
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem className="w-24">
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input {...field} placeholder="USD" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
