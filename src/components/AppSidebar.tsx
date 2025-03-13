
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "./AuthProvider";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  Home, 
  Settings, 
  FileText, 
  Users, 
  LogOut, 
  FolderInput,
  FolderKanban,
  CreditCard
} from "lucide-react";

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <Sidebar className="border-r hidden @sidebar:flex flex-col flex-grow">
      <div className="p-3 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <FolderInput className="w-6 h-6" />
          <span>Invoicer</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-2">
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-md ${
            pathname === "/" ? "bg-accent" : "hover:bg-muted"
          }`}
        >
          <Home size={18} />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/invoices"
          className={`flex items-center gap-3 px-3 py-2 rounded-md ${
            pathname === "/invoices" ? "bg-accent" : "hover:bg-muted"
          }`}
        >
          <FileText size={18} />
          <span>Invoices</span>
        </Link>
        <Link
          to="/categories"
          className={`flex items-center gap-3 px-3 py-2 rounded-md ${
            pathname === "/categories" ? "bg-accent" : "hover:bg-muted"
          }`}
        >
          <FolderKanban size={18} />
          <span>Categories</span>
        </Link>
        <Link
          to="/customers"
          className={`flex items-center gap-3 px-3 py-2 rounded-md ${
            pathname === "/customers" ? "bg-accent" : "hover:bg-muted"
          }`}
        >
          <Users size={18} />
          <span>Customers</span>
        </Link>
        <Link
          to="/bank-reconciliation"
          className={`flex items-center gap-3 px-3 py-2 rounded-md ${
            pathname === "/bank-reconciliation" ? "bg-accent" : "hover:bg-muted"
          }`}
        >
          <CreditCard size={18} />
          <span>Bank Movements</span>
        </Link>
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-md ${
            pathname === "/settings" ? "bg-accent" : "hover:bg-muted"
          }`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </nav>

      <div className="p-3 flex-shrink-0 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Avatar className="size-7">
                <AvatarImage src={user?.email ? undefined : ""} />
                <AvatarFallback>{user?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left leading-none">
                <span className="font-medium">{user?.email || "User"}</span>
                <span className="text-muted-foreground text-sm">{user?.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}
            className="text-destructive focus:text-destructive"
            >
              Sign out
              <LogOut className="ml-auto h-4 w-4" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Sidebar>
  );
}
