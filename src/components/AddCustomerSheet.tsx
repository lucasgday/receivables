
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./AuthProvider";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

const customerSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  contact: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export const AddCustomerSheet = ({
  open,
  onOpenChange,
  onCustomerAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerAdded?: () => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      contact: "",
      email: "",
    }
  });

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    
    try {
      // Check for authentication
      if (!user && !import.meta.env.DEV) {
        toast.error("You must be logged in to add customers");
        setIsSubmitting(false);
        navigate("/auth"); // Redirect to auth page
        return;
      }

      // Get the user ID, using a default for development if needed
      const userId = user?.id || (import.meta.env.DEV ? "00000000-0000-0000-0000-000000000000" : null);
      
      if (!userId) {
        toast.error("You must be logged in to add customers");
        setIsSubmitting(false);
        navigate("/auth"); // Redirect to auth page
        return;
      }

      const { error } = await supabase.from("customers").insert({
        name: data.name,
        contact: data.contact || null,
        email: data.email || null,
        user_id: userId,
        status: "Active",
      });

      if (error) {
        console.error("Error adding customer:", error);
        
        if (error.code === "42501") {
          toast.error("Permission denied. Please check if you're properly logged in.");
          // If in production and there's a permission error, attempt to redirect to auth
          if (!import.meta.env.DEV) {
            navigate("/auth");
          }
        } else {
          toast.error(`Failed to add customer: ${error.message}`);
        }
        setIsSubmitting(false);
        return;
      }

      toast.success("Customer added successfully");
      onOpenChange(false);
      form.reset();
      
      if (onCustomerAdded) {
        onCustomerAdded();
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("Failed to add customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Customer</SheetTitle>
          <SheetDescription>
            Add a new customer to your directory.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corp" {...field} />
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
                    <Input placeholder="John Doe" {...field} />
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
                    <Input placeholder="john@acme.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Customer"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
