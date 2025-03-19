import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

const roles = [
  { value: "admin", label: "Admin", permissions: ["manage_users", "view_reports", "edit_content"] },
  { value: "editor", label: "Editor", permissions: ["edit_content", "view_reports"] },
  { value: "viewer", label: "Viewer", permissions: ["view_reports"] },
];

export const UsersTab = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roles[0].value);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users_with_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const inviteUser = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    setIsInviting(true);
    try {
      // First, check if the user is already an admin
      const { data: currentUserRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .single();

      if (currentUserRole?.role !== "admin") {
        throw new Error("Only admins can invite users");
      }

      // Invite the user using Supabase Auth
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
      if (inviteError) throw inviteError;

      // Update the user's role
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role })
        .eq("user_id", (await supabase.auth.admin.getUserByEmail(email)).data.user.id);

      if (roleError) throw roleError;

      toast.success("User invited successfully");
      setEmail("");
      setRole(roles[0].value);
      fetchUsers();
    } catch (error: any) {
      console.error("Error inviting user:", error);
      toast.error(error.message || "Failed to invite user");
    } finally {
      setIsInviting(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Check if the current user is an admin
      const { data: currentUserRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .single();

      if (currentUserRole?.role !== "admin") {
        throw new Error("Only admins can update user roles");
      }

      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("User role updated successfully");
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast.error(error.message || "Failed to update user role");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex items-center gap-4">
          <Input
            type="email"
            placeholder="Enter user email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-64"
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={inviteUser} disabled={isInviting}>
            {isInviting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inviting...
              </>
            ) : (
              "Invite User"
            )}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Add user deletion logic here if needed
                      toast.info("User deletion not implemented yet");
                    }}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
