
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

export function CategoryForm({ 
  onSuccess, 
  categoryToEdit 
}: { 
  onSuccess?: () => void;
  categoryToEdit?: any;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm({
    defaultValues: categoryToEdit || {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: any) => {
    if (!user && !import.meta.env.DEV) {
      toast.error("You must be logged in to create a category");
      return;
    }

    setIsLoading(true);
    try {
      if (categoryToEdit) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update({
            ...data,
            user_id: user?.id || "00000000-0000-0000-0000-000000000000"
          })
          .eq("id", categoryToEdit.id);
        
        if (error) throw error;
      } else {
        // Insert new category
        const { error } = await supabase
          .from("categories")
          .insert({
            ...data,
            user_id: user?.id || "00000000-0000-0000-0000-000000000000"
          });
        
        if (error) throw error;
      }

      toast.success(`Category ${categoryToEdit ? "updated" : "created"} successfully`);
      if (onSuccess) onSuccess();
      if (!categoryToEdit) form.reset();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(`Failed to ${categoryToEdit ? "update" : "create"} category`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : categoryToEdit ? "Update Category" : "Create Category"}
        </Button>
      </form>
    </Form>
  );
}
