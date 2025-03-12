import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RequireAuth from "./components/RequireAuth";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./components/AuthProvider";
import Invoices from "./pages/Invoices";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";

// Import the new Categories page
import Categories from "./pages/Categories";

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/invoices" element={<RequireAuth><Invoices /></RequireAuth>} />
            <Route path="/categories" element={<RequireAuth><Categories /></RequireAuth>} />
            <Route path="/customers" element={<RequireAuth><Customers /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
