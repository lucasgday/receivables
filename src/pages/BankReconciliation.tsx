
import { useState } from "react";
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

const BankReconciliation = () => {
  const { user } = useAuth();
  const { settings, isLoading: isLoadingSettings } = useSettings();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [isImporting, setIsImporting] = useState(false);
  
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
                        {settings?.companies?.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <UploadCsv 
                  companyId={selectedCompany}
                  currency={currency}
                  onImportStart={() => setIsImporting(true)}
                  onImportComplete={() => setIsImporting(false)}
                />
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
