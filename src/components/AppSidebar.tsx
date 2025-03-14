
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeftToLine,
  BarChart3,
  UserCircle,
  LogOut,
  Settings as SettingsIcon,
  FileText,
  Users,
  Tags,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { user, signOut } = useAuth();

  return (
    <Sidebar className="border-r">
      <SidebarHeader>
        <div className="p-4 text-lg font-semibold tracking-tight">
          InvoiceHubster
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-screen">
          <div className="space-y-1 p-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-muted text-muted-foreground"
                )
              }
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink
              to="/invoices"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-muted text-muted-foreground"
                )
              }
            >
              <FileText className="h-4 w-4" />
              Invoices
            </NavLink>
            <NavLink
              to="/customers"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-muted text-muted-foreground"
                )
              }
            >
              <Users className="h-4 w-4" />
              Customers
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-muted text-muted-foreground"
                )
              }
            >
              <Tags className="h-4 w-4" />
              Categories
            </NavLink>
            <NavLink
              to="/bank-reconciliation"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-muted text-muted-foreground"
                )
              }
            >
              <Banknote className="h-4 w-4" />
              Bank Movements
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-muted text-muted-foreground"
                )
              }
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </NavLink>
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 space-y-4">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <UserCircle className="h-8 w-8" />
                <div>
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Logged in</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full flex justify-between items-center"
                onClick={() => signOut()}
              >
                <span>Sign out</span>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="w-full flex justify-between items-center"
              asChild
            >
              <NavLink to="/auth">
                <span>Sign in</span>
                <ArrowLeftToLine className="h-4 w-4" />
              </NavLink>
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
