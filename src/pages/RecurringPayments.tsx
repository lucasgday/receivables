import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { RecurringPaymentsView } from "@/components/recurring-payments/RecurringPaymentsView";

const RecurringPayments = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-8">
          <SidebarTrigger className="mb-4" />
          <RecurringPaymentsView />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default RecurringPayments;
