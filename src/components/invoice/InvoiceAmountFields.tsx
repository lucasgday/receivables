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

export const InvoiceAmountFields = ({
  form,
  showCurrency,
  invoiceCurrency,
  onCurrencyChange,
}: InvoiceAmountFieldsProps) => {
  const { settings, isLoading, updateEnabledCurrencies } = useSettings();
  const [enabledCurrencies, setEnabledCurrencies] = useState<string[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);

  useEffect(() => {
    if (settings && settings.enabled_currencies) {
      setEnabledCurrencies(settings.enabled_currencies);
      setSelectedCurrencies(settings.enabled_currencies);
    }
  }, [settings]);

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrencies((prev) => {
      const isSelected = prev.includes(currency);
      if (isSelected) {
        return prev.filter((c) => c !== currency);
      } else {
        return [...prev, currency];
      }
    });
  };

  const handleCurrencyToggle = (currency: string) => {
    onCurrencyChange(currency);
  };

  const saveCurrencies = async () => {
    await updateEnabledCurrencies(selectedCurrencies);
  };

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
            <FormItem className="w-24">
              <FormLabel>Currency</FormLabel>
              <div>
                {enabledCurrencies.map((currency) => (
                  <div key={currency}>
                    <input
                      type="radio"
                      id={currency}
                      name="currency"
                      value={currency}
                      checked={invoiceCurrency === currency}
                      onChange={() => handleCurrencyToggle(currency)}
                    />
                    <label htmlFor={currency}>{currency}</label>
                  </div>
                ))}
              </div>
              <button onClick={saveCurrencies}>Save Currencies</button>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
