
import { User, MoreHorizontal, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Tables } from "@/integrations/supabase/types";

type Customer = Tables<"customers">;

export const CustomerList = ({
  onCustomerClick,
  searchQuery,
  refreshTrigger,
}: {
  onCustomerClick: (customer: Customer) => void;
  searchQuery?: string;
  refreshTrigger?: number;
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<"name" | "status">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { user } = useAuth();

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user && !import.meta.env.DEV) return;

      setIsLoading(true);
      try {
        let query = supabase.from("customers").select("*");

        // Add search query if provided
        if (searchQuery) {
          query = query.or(
            `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,contact.ilike.%${searchQuery}%`
          );
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setCustomers(data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Failed to load customers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [user, searchQuery, refreshTrigger]);

  const handleSort = (field: "name" | "status") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDeleteCustomer = async (customerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerId);

      if (error) {
        throw error;
      }

      // Remove the customer from the state
      setCustomers(customers.filter(c => c.id !== customerId));
      toast.success("Customer deleted successfully");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete customer");
    }
  };

  const sortCustomers = (customerList: Customer[]) => {
    return [...customerList].sort((a, b) => {
      // Default values for null fields
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";
      
      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  };

  const sortedCustomers = sortCustomers(customers);

  if (isLoading) {
    return <div className="py-8 text-center">Loading customers...</div>;
  }

  if (sortedCustomers.length === 0) {
    return <div className="py-8 text-center">No customers found</div>;
  }

  return (
    <div className="space-y-4">
      {sortedCustomers.map((customer) => (
        <div
          key={customer.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => onCustomerClick(customer)}
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">{customer.contact}</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground">{customer.status || "Active"}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={(e) => handleDeleteCustomer(customer.id, e)}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};
