import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { RequireAuth } from "./components/RequireAuth";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./components/AuthProvider";
import Invoices from "./pages/Invoices";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import Categories from "./pages/Categories";
import { InvoicePDF } from "./components/InvoicePDF";
import BankReconciliation from "./pages/BankReconciliation";
import RecurringPayments from "./pages/RecurringPayments";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <Toaster />
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/invoices" element={<RequireAuth><Invoices /></RequireAuth>} />
              <Route path="/categories" element={<RequireAuth><Categories /></RequireAuth>} />
              <Route path="/customers" element={<RequireAuth><Customers /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
              <Route path="/bank-reconciliation" element={<RequireAuth><BankReconciliation /></RequireAuth>} />
              <Route path="/recurring-payments" element={<RequireAuth><RecurringPayments /></RequireAuth>} />
              <Route path="/invoice-pdf/:id" element={<RequireAuth><InvoicePDF /></RequireAuth>} />
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
