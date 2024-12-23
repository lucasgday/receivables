import { User } from "lucide-react";

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

export const CustomerList = () => {
  return (
    <div className="space-y-4">
      {mockCustomers.map((customer) => (
        <div
          key={customer.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
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