
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InvoiceCategoryFieldProps {
  form: UseFormReturn<any>;
  categories: any[];
  isLoadingCategories: boolean;
}

export const InvoiceCategoryField = ({
  form,
  categories,
  isLoadingCategories,
}: InvoiceCategoryFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="category_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <Select
            disabled={isLoadingCategories}
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a category (optional)" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="no-category">No category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
