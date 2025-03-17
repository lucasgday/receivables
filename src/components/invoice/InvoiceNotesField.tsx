
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface InvoiceNotesFieldProps {
  form: UseFormReturn<any>;
}

export const InvoiceNotesField = ({
  form,
}: InvoiceNotesFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Textarea 
              {...field} 
              value={field.value || ""} 
              placeholder="Add any notes or special instructions for this invoice"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
