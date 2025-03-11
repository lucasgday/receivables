
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { StatsCard } from "@/components/StatsCard";
import { RecentInvoices } from "@/components/RecentInvoices";
import { OverviewChart } from "@/components/OverviewChart";
import { ArrowUpRight, DollarSign, FileText, Users } from "lucide-react";
import { Onboarding } from "@/components/Onboarding";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

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

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user && !import.meta.env.DEV) return;

      try {
        // Get active customers count
        const { data: customers, error: customersError } = await supabase
          .from("customers")
          .select("id")
          .eq("status", "Active");

        if (customersError) throw customersError;

        // Get invoices
        const { data: invoices, error: invoicesError } = await supabase
          .from("invoices")
          .select("*");

        if (invoicesError) throw invoicesError;

        // Calculate total receivables (sum of unpaid invoices)
        const unpaidInvoices = invoices.filter(
          (inv) => inv.status !== "Paid" && inv.status !== "paid"
        );
        const totalReceivables = unpaidInvoices.reduce(
          (sum, inv) => sum + Number(inv.amount),
          0
        );

        // Calculate open invoices count
        const openInvoices = unpaidInvoices.length;

        // Calculate collection rate (paid invoices / total invoices)
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

        // Show onboarding if no customers
        if (customers.length === 0) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // If there's an error, show onboarding
        setShowOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-8">
          <SidebarTrigger className="mb-4" />
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Receivables"
                value={isLoading ? "Loading..." : `$${dashboardData.totalReceivables.toLocaleString()}`}
                description={
                  dashboardData.totalReceivables === 0 && !isLoading
                    ? "Add your first invoice"
                    : "Unpaid invoices"
                }
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
                icon={<ArrowUpRight className="h-4 w-4" />}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <OverviewChart />
            </div>

            <RecentInvoices />
          </div>
        </main>
        
        {showOnboarding && (
          <Onboarding onComplete={() => setShowOnboarding(false)} />
        )}
      </div>
    </SidebarProvider>
  );
};

export default Index;
