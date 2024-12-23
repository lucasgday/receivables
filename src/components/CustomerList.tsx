import { User } from "lucide-react";
import { useState } from "react";

const mockCustomers = [
  {
    id: 1,
    name: "Acme Corp",
    contact: "John Doe",
    email: "john@acme.com",
    status: "Active",
    outstanding: "$5,000",
  },
  {
    id: 2,
    name: "TechStart Inc",
    contact: "Jane Smith",
    email: "jane@techstart.com",
    status: "Active",
    outstanding: "$3,200",
  },
  {
    id: 3,
    name: "Global Solutions",
    contact: "Mike Johnson",
    email: "mike@globalsolutions.com",
    status: "Inactive",
    outstanding: "$0",
  },
];

type SortField = "name" | "outstanding" | "status";

export const CustomerList = ({
  onCustomerClick,
}: {
  onCustomerClick: (customer: typeof mockCustomers[0]) => void;
}) => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState("");

  const sortCustomers = (customers: typeof mockCustomers) => {
    return [...customers].sort((a, b) => {
      if (sortField === "outstanding") {
        const aValue = parseFloat(a[sortField].replace("$", "").replace(",", ""));
        const bValue = parseFloat(b[sortField].replace("$", "").replace(",", ""));
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      const aValue = a[sortField];
      const bValue = b[sortField];
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  };

  const filterCustomers = (customers: typeof mockCustomers) => {
    if (!filter) return customers;
    const lowercaseFilter = filter.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(lowercaseFilter) ||
        customer.contact.toLowerCase().includes(lowercaseFilter) ||
        customer.email.toLowerCase().includes(lowercaseFilter)
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedCustomers = sortCustomers(filterCustomers(mockCustomers));

  return (
    <div className="space-y-4">
      {filteredAndSortedCustomers.map((customer) => (
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
              <p className="text-sm font-medium">Outstanding</p>
              <p className="text-sm text-muted-foreground">{customer.outstanding}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground">{customer.status}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};