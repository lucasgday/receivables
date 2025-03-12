
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
import { Plus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { InvoiceList } from "@/components/InvoiceList";
import { InvoiceFilter } from "@/components/InvoiceFilter";
import { useInvoices } from "@/hooks/useInvoices";
import { NewInvoiceSheet } from "@/components/NewInvoiceSheet";

const Invoices = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const { user } = useAuth();
  
  const { invoices, isLoading, handleDeleteInvoice, refreshInvoices } = useInvoices(user, activeTab);

  // Filter invoices based on search query
  const filteredInvoices = invoices.filter((invoice) => {
    const searchTerms = [
      invoice.invoice_number,
      invoice.customers?.name,
      invoice.status,
    ];
    
    return searchTerms.some(term => 
      term && term.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-8">
          <SidebarTrigger className="mb-4" />
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Invoices</h1>
              <Button onClick={() => setNewInvoiceOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Invoice Management</CardTitle>
                    <CardDescription>Manage and track your invoices</CardDescription>
                  </div>
                  <InvoiceFilter
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <InvoiceList 
                  invoices={filteredInvoices} 
                  isLoading={isLoading} 
                  handleDeleteInvoice={handleDeleteInvoice}
                  refreshInvoices={refreshInvoices} 
                />
              </CardContent>
            </Card>
          </div>
        </main>

        <NewInvoiceSheet 
          open={newInvoiceOpen}
          onOpenChange={setNewInvoiceOpen}
          onInvoiceCreated={refreshInvoices}
        />
      </div>
    </SidebarProvider>
  );
};

export default Invoices;
