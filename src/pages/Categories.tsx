
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryForm } from "@/components/CategoryForm";
import { CategoryList } from "@/components/CategoryList";

const Categories = () => {
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setEditingCategory(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-8">
          <SidebarTrigger className="mb-4" />
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">Categories</h1>

            <Card>
              <CardHeader>
                <CardTitle>{editingCategory ? "Edit Category" : "Create New Category"}</CardTitle>
                <CardDescription>
                  {editingCategory 
                    ? "Update the selected category" 
                    : "Create categories to organize your invoices"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-8">
                  <CategoryForm 
                    categoryToEdit={editingCategory} 
                    onSuccess={handleSuccess} 
                  />
                  {editingCategory && (
                    <div className="mt-4">
                      <button 
                        onClick={() => setEditingCategory(null)}
                        className="text-sm text-blue-500"
                      >
                        Cancel editing
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Categories</CardTitle>
                <CardDescription>Manage your invoice categories</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryList 
                  onEdit={setEditingCategory} 
                  refreshTrigger={refreshTrigger} 
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Categories;
