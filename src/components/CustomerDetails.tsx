import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type Customer = {
  id: number;
  name: string;
  contact: string;
  email: string;
  status: string;
  outstanding: string;
};

export const CustomerDetails = ({
  customer,
  open,
  onOpenChange,
}: {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<Customer>({
    defaultValues: customer || undefined,
  });

  const onSubmit = (data: Customer) => {
    console.log("Updated customer:", data);
    // Here you would typically update the customer data
    setIsEditing(false);
  };

  if (!customer) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex justify-between items-center">
            <span>Customer Details</span>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel Edit" : "Edit"}
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="mt-6">Save Changes</Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Company Name</h3>
                <p className="mt-1">{customer.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Contact Person</h3>
                <p className="mt-1">{customer.contact}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p className="mt-1">{customer.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <p className="mt-1">{customer.status}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Outstanding Balance</h3>
                <p className="mt-1">{customer.outstanding}</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};