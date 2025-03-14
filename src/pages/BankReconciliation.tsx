
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BankMovementsList } from "@/components/BankMovementsList";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/useSettings";
import { UploadCsv } from "@/components/UploadCsv";
import { toast } from "sonner";

// Define all supported currencies
const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "MXN", label: "MXN - Mexican Peso" },
  { value: "NZD", label: "NZD - New Zealand Dollar" },
  { value: "SGD", label: "SGD - Singapore Dollar" },
  { value: "HKD", label: "HKD - Hong Kong Dollar" },
  { value: "SEK", label: "SEK - Swedish Krona" },
  { value: "NOK", label: "NOK - Norwegian Krone" },
  { value: "DKK", label: "DKK - Danish Krone" },
  { value: "PLN", label: "PLN - Polish Zloty" },
  { value: "ZAR", label: "ZAR - South African Rand" },
  { value: "RUB", label: "RUB - Russian Ruble" },
];

const BankReconciliation = () => {
  const { user } = useAuth();
  const { settings, isLoading: isLoadingSettings } = useSettings();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [isImporting, setIsImporting] = useState(false);
  
  useEffect(() => {
    if (settings?.companies && settings.companies.length > 0) {
      const defaultCompany = settings.companies.find(c => c.id === settings.default_company);
      if (defaultCompany) {
        setSelectedCompany(defaultCompany.id);
      } else {
        setSelectedCompany(settings.companies[0].id);
      }
    }
    
    // Set default currency from settings if available
    if (settings?.default_currency) {
      setCurrency(settings.default_currency);
    }
  }, [settings]);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-8">
          <SidebarTrigger className="mb-4" />
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Bank Reconciliation</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Import Bank Movements</CardTitle>
                <CardDescription>
                  Upload CSV file with bank movements to reconcile with invoices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Invoicing Company</Label>
                    <Select
                      disabled={isLoadingSettings || !settings?.companies?.length}
                      value={selectedCompany || ""}
                      onValueChange={setSelectedCompany}
                    >
                      <SelectTrigger id="company">
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                      <SelectContent>
                        {settings?.companies?.length > 0 ? (
                          settings.companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-companies" disabled>
                            No companies available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {!settings?.companies?.length && !isLoadingSettings && (
                      <p className="text-sm text-red-500">
                        Please add a company in{" "}
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-sm" 
                          onClick={() => window.location.href = "/settings"}
                        >
                          Settings
                        </Button>
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[240px]">
                        {CURRENCIES.map(currency => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {settings?.companies?.length > 0 ? (
                  <UploadCsv 
                    companyId={selectedCompany}
                    currency={currency}
                    onImportStart={() => setIsImporting(true)}
                    onImportComplete={() => setIsImporting(false)}
                  />
                ) : (
                  <div className="text-center py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <p className="text-muted-foreground">
                      You need to add at least one company in Settings before you can upload bank movements.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4" 
                      onClick={() => window.location.href = "/settings"}
                    >
                      Go to Settings
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bank Movements</CardTitle>
                <CardDescription>
                  View and manage your bank movements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BankMovementsList userId={user?.id} companyId={selectedCompany} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default BankReconciliation;
