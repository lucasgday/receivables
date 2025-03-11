
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
import { FileText, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for invoices
const mockInvoices = [
  {
    id: 1,
    invoiceNumber: "INV-001",
    customer: "Acme Corp",
    amount: "$5,000",
    issueDate: "2023-06-01",
    dueDate: "2023-07-01",
    status: "Paid",
  },
  {
    id: 2,
    invoiceNumber: "INV-002",
    customer: "TechStart Inc",
    amount: "$3,200",
    issueDate: "2023-06-15",
    dueDate: "2023-07-15",
    status: "Pending",
  },
  {
    id: 3,
    invoiceNumber: "INV-003",
    customer: "Global Solutions",
    amount: "$7,500",
    issueDate: "2023-06-20",
    dueDate: "2023-07-20",
    status: "Overdue",
  },
];

const Invoices = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter invoices based on search query and active tab
  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch = 
      invoice.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && invoice.status.toLowerCase() === activeTab.toLowerCase();
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
              <Button>
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
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Tabs defaultValue="all" className="mt-6" onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="paid">Paid</TabsTrigger>
                    <TabsTrigger value="overdue">Overdue</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                            <p className="text-sm text-muted-foreground">{invoice.customer}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="text-sm font-medium">Amount</p>
                            <p className="text-sm text-muted-foreground">{invoice.amount}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Due Date</p>
                            <p className="text-sm text-muted-foreground">{invoice.dueDate}</p>
                          </div>
                          <div>
                            <Badge
                              variant={
                                invoice.status === "Paid"
                                  ? "default"
                                  : invoice.status === "Pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No invoices found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Invoices;
