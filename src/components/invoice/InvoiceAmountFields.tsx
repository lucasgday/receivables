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
import { useSettings } from "@/hooks/useSettings";
import { useEffect, useState } from "react";

interface InvoiceAmountFieldsProps {
  form: UseFormReturn<any>;
  showCurrency: boolean;
  invoiceCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

const DEFAULT_CURRENCIES = ["USD"];

export const InvoiceAmountFields = ({
  form,
  showCurrency,
  invoiceCurrency,
  onCurrencyChange,
}: InvoiceAmountFieldsProps) => {
  const { settings, isLoading } = useSettings();
  const [enabledCurrencies, setEnabledCurrencies] = useState<string[]>(DEFAULT_CURRENCIES);

  useEffect(() => {
    if (settings?.enabled_currencies && settings.enabled_currencies.length > 0) {
      setEnabledCurrencies(settings.enabled_currencies);
    }
  }, [settings]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
            <FormItem className="w-48">
              <FormLabel>Currency</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  onCurrencyChange(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {enabledCurrencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
