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
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { InvoiceList } from "@/components/InvoiceList";
import { InvoiceFilter } from "@/components/InvoiceFilter";
import { useInvoices } from "@/hooks/useInvoices";
import { NewInvoiceSheet } from "@/components/NewInvoiceSheet";
import { emailService } from "@/services/emailService";
import { useToast } from "@/components/ui/use-toast";

const Invoices = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSendingEmails, setIsSendingEmails] = useState(false);

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

  const handleSendBulkEmails = async () => {
    if (!user) return;
    setIsSendingEmails(true);

    try {
      const invoices = await emailService.getCurrentMonthInvoices(user.id);
      if (invoices.length === 0) {
        toast({
          title: "No invoices",
          description: "No invoices found for the current month",
        });
        return;
      }

      await emailService.sendBulkEmails(invoices);
      toast({
        title: "Success",
        description: "Emails sent successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send emails",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-8">
          <SidebarTrigger className="mb-4" />
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Invoices</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSendBulkEmails}
                  disabled={isSendingEmails}
                >
                  {isSendingEmails && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Monthly Invoices
                </Button>
                <Button onClick={() => setNewInvoiceOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
              </div>
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
