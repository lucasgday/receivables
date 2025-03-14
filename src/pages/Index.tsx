
import { useState, useEffect, useCallback } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { StatsCard } from "@/components/StatsCard";
import { RecentInvoices } from "@/components/RecentInvoices";
import { OverviewChart } from "@/components/OverviewChart";
import { ArrowUpRight, DollarSign, FileText, Users } from "lucide-react";
import { Onboarding } from "@/components/Onboarding";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AddCustomerSheet } from "@/components/AddCustomerSheet";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalReceivables: 0,
    openInvoices: 0,
    activeCustomers: 0,
    collectionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    if (!user && !import.meta.env.DEV) return;

    setIsLoading(true);
    try {
      const { data: customers, error: customersError } = await supabase
        .from("customers")
        .select("id")
        .eq("status", "Active");

      if (customersError) throw customersError;

      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select("*");

      if (invoicesError) throw invoicesError;

      const unpaidInvoices = invoices.filter(
        (inv) => inv.status !== "Paid" && inv.status !== "paid"
      );
      const totalReceivables = unpaidInvoices.reduce(
        (sum, inv) => sum + Number(inv.amount),
        0
      );

      const openInvoices = unpaidInvoices.length;

      const paidInvoices = invoices.filter(
        (inv) => inv.status === "Paid" || inv.status === "paid"
      );
      const collectionRate = invoices.length > 0
        ? Math.round((paidInvoices.length / invoices.length) * 100)
        : 0;

      setDashboardData({
        totalReceivables,
        openInvoices,
        activeCustomers: customers.length,
        collectionRate,
      });

      if (customers.length === 0) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-8">
          <SidebarTrigger className="mb-4" />
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <div className="space-x-2">
                <Button onClick={() => setAddCustomerOpen(true)}>
                  Add Customer
                </Button>
                <Button onClick={() => navigate("/invoices")}>
                  New Invoice
                </Button>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Receivables"
                value={isLoading ? "Loading..." : `$${dashboardData.totalReceivables.toLocaleString()}`}
                description={
                  dashboardData.totalReceivables === 0 && !isLoading
                    ? "Add your first invoice"
                    : "Unpaid invoices"
                }
                linkTo={dashboardData.totalReceivables === 0 ? "/invoices" : undefined}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <StatsCard
                title="Open Invoices"
                value={isLoading ? "Loading..." : dashboardData.openInvoices.toString()}
                description={
                  dashboardData.openInvoices === 0 && !isLoading
                    ? "Create your first invoice"
                    : "Awaiting payment"
                }
                linkTo={dashboardData.openInvoices === 0 ? "/invoices" : undefined}
                icon={<FileText className="h-4 w-4" />}
              />
              <StatsCard
                title="Active Customers"
                value={isLoading ? "Loading..." : dashboardData.activeCustomers.toString()}
                description={
                  dashboardData.activeCustomers === 0 && !isLoading
                    ? "Add your first customer"
                    : "Customers in your database"
                }
                linkTo={dashboardData.activeCustomers === 0 ? "/customers" : undefined}
                icon={<Users className="h-4 w-4" />}
              />
              <StatsCard
                title="Collection Rate"
                value={isLoading ? "Loading..." : `${dashboardData.collectionRate}%`}
                description={
                  dashboardData.collectionRate === 0 && !isLoading
                    ? "Track your first payment"
                    : "Of invoices paid"
                }
                linkTo={dashboardData.collectionRate === 0 ? "/invoices" : undefined}
                icon={<ArrowUpRight className="h-4 w-4" />}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <OverviewChart />
            </div>

            <RecentInvoices />
          </div>
        </main>
        
        <AddCustomerSheet
          open={addCustomerOpen}
          onOpenChange={setAddCustomerOpen}
          onCustomerAdded={() => {
            setAddCustomerOpen(false);
            fetchDashboardData();
          }}
        />
        
        {showOnboarding && (
          <Onboarding onComplete={() => setShowOnboarding(false)} />
        )}
      </div>
    </SidebarProvider>
  );
};

export default Index;
