
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
  const [hasCustomers, setHasCustomers] = useState(true);

  // Check if user has any customers
  useEffect(() => {
    if (user) {
      const checkUserData = async () => {
        try {
          const { data, error } = await supabase
            .from('customers')
            .select('count')
            .single();
          
          if (error) throw error;
          
          // If count is 0, show onboarding
          if (!data || data.count === 0) {
            setHasCustomers(false);
            setShowOnboarding(true);
          }
        } catch (error) {
          console.error("Error checking user data:", error);
          // If there's an error (likely no customers table yet), show onboarding
          setShowOnboarding(true);
        }
      };
      
      checkUserData();
    }
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
                value={hasCustomers ? "$24,500" : "$0"}
                description={hasCustomers ? "+20.1% from last month" : "Add your first customer"}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <StatsCard
                title="Open Invoices"
                value={hasCustomers ? "12" : "0"}
                description={hasCustomers ? "4 overdue" : "Create your first invoice"}
                icon={<FileText className="h-4 w-4" />}
              />
              <StatsCard
                title="Active Customers"
                value={hasCustomers ? "48" : "0"}
                description={hasCustomers ? "+2 this month" : "Add your first customer"}
                icon={<Users className="h-4 w-4" />}
              />
              <StatsCard
                title="Collection Rate"
                value={hasCustomers ? "92%" : "0%"}
                description={hasCustomers ? "+5% from last month" : "Track your first payment"}
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
