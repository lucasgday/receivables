import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { CustomerList } from "@/components/CustomerList";

const Customers = () => {
  return (
    <div className="min-h-screen flex w-full">
      <main className="flex-1 p-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Customers</h1>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              <UserPlus className="h-4 w-4" />
              Add Customer
            </button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Directory</CardTitle>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <CustomerList />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Customers;