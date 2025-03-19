import React, { useState } from "react";
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
import { Plus, Loader2, Repeat, Send } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { InvoiceList } from "@/components/InvoiceList";
import { InvoiceFilter } from "@/components/InvoiceFilter";
import { useInvoices, SortField, SortOrder } from "@/hooks/useInvoices";
import { NewInvoiceSheet } from "@/components/NewInvoiceSheet";
import { emailService } from "@/services/emailService";
import { toast } from "sonner";
import { AddRecurringPaymentDialog } from "@/components/recurring-payments/AddRecurringPaymentDialog";
import { useCustomers } from "@/hooks/useCustomers";

const Invoices = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [recurringPaymentOpen, setRecurringPaymentOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const { user } = useAuth();
  const { customers, isLoading: customersLoading } = useCustomers();

  const { invoices, isLoading, handleDeleteInvoice, refreshInvoices } = useInvoices(
    user,
    {
      searchQuery,
      status: activeTab,
    },
    sortField,
    sortOrder
  );

  const handleSendMonthlyInvoices = async () => {
    try {
      const currentMonthInvoices = await emailService.getCurrentMonthInvoices();
      await emailService.sendBulkEmails(currentMonthInvoices);
      toast.success("Monthly invoices sent successfully");
      refreshInvoices();
    } catch (error) {
      console.error("Error sending monthly invoices:", error);
      toast.error("Failed to send monthly invoices");
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <main className="flex-1 p-8">
          <SidebarTrigger className="mb-4" />
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Invoices</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSendMonthlyInvoices}
                  disabled={customersLoading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Monthly Invoices
                </Button>
                <Button variant="outline" onClick={() => setRecurringPaymentOpen(true)}>
                  <Repeat className="h-4 w-4 mr-2" />
                  New Recurring Payment
                </Button>
                <Button onClick={() => setNewInvoiceOpen(true)} disabled={customersLoading}>
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
                    sortField={sortField}
                    setSortField={setSortField}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <InvoiceList
                  invoices={invoices}
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

        <AddRecurringPaymentDialog
          open={recurringPaymentOpen}
          onOpenChange={setRecurringPaymentOpen}
          customers={customers}
          onSuccess={refreshInvoices}
        />
      </div>
    </SidebarProvider>
  );
};

export default Invoices;
