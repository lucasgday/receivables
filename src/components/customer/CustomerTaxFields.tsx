import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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
import { UseFormReturn } from "react-hook-form";

interface CustomerTaxFieldsProps {
  form: UseFormReturn<any>;
}

export const CustomerTaxFields = ({ form }: CustomerTaxFieldsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="tax_id_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tax ID Type</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || "CUIT"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select tax ID type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="CUIT">CUIT</SelectItem>
                <SelectItem value="CUIL">CUIL</SelectItem>
                <SelectItem value="DNI">DNI</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tax_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tax ID</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter tax ID number"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
