import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { StatsCard } from "@/components/StatsCard";
import { RecentInvoices } from "@/components/RecentInvoices";
import { OverviewChart } from "@/components/OverviewChart";
import { ArrowUpRight, DollarSign, FileText, Users } from "lucide-react";

const Index = () => {
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
                value="$24,500"
                description="+20.1% from last month"
                icon={<DollarSign className="h-4 w-4" />}
              />
              <StatsCard
                title="Open Invoices"
                value="12"
                description="4 overdue"
                icon={<FileText className="h-4 w-4" />}
              />
              <StatsCard
                title="Active Customers"
                value="48"
                description="+2 this month"
                icon={<Users className="h-4 w-4" />}
              />
              <StatsCard
                title="Collection Rate"
                value="92%"
                description="+5% from last month"
                icon={<ArrowUpRight className="h-4 w-4" />}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <OverviewChart />
            </div>

            <RecentInvoices />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;