
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { CustomerList } from "@/components/CustomerList";
import { AddCustomerSheet } from "@/components/AddCustomerSheet";
import { CustomerDetails } from "@/components/CustomerDetails";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Customers = () => {
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCustomerClick = (customer: any) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  const refreshCustomers = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-8">
          <SidebarTrigger className="mb-4" />
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Customers</h1>
              <Button onClick={() => setAddCustomerOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Customer Directory</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <CustomerList 
                  onCustomerClick={handleCustomerClick} 
                  searchQuery={searchQuery}
                  refreshTrigger={refreshTrigger}
                />
              </CardContent>
            </Card>
          </div>
        </main>

        <AddCustomerSheet
          open={addCustomerOpen}
          onOpenChange={setAddCustomerOpen}
          onCustomerAdded={refreshCustomers}
        />

        <CustomerDetails
          customer={selectedCustomer}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onCustomerUpdate={refreshCustomers}
        />
      </div>
    </SidebarProvider>
  );
};

export default Customers;
