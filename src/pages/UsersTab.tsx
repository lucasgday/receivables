import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; // Ensure this points to the button file
import { Input } from "@/components/ui/input"; // Correctly point to the Input component
import { Select, SelectItem } from "@/components/ui/select"; // Correctly point to the Select component
import { toast } from "sonner"; // For notifications
import { supabase } from "@/integrations/supabase/client"; // Ensure you have the correct import

const roles = [
  { value: "admin", label: "Admin", permissions: ["manage_users", "view_reports", "edit_content"] },
  { value: "editor", label: "Editor", permissions: ["edit_content", "view_reports"] },
  { value: "viewer", label: "Viewer", permissions: ["view_reports"] },
];

export const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roles[0].value); // Default to the first role

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data);
      }
    };

    fetchUsers();
  }, []);

  const inviteUser = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      const selectedRole = roles.find((r) => r.value === role);
      // Log the permissions for debugging (optional)
      console.log("Inviting user with permissions:", selectedRole?.permissions);

      const { error } = await supabase
        .from("users") // Assuming you have a users table
        .insert([{ email, role }]); // Save the role in the database

      if (error) throw error;

      toast.success("User invited successfully");
      setEmail(""); // Clear the input
      setRole(roles[0].value); // Reset role to default
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error("Failed to invite user");
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      toast.success("User role updated successfully");
      // Optionally, refresh the user list or update the state
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Invite New User</h2>
      <div className="space-y-4">
        <Input
          type="email"
          placeholder="Enter user email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Select
          value={role}
          onValueChange={setRole}
        >
          {roles.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </Select>
        <Button onClick={inviteUser}>Invite User</Button>
      </div>

      <h2 className="text-2xl font-bold mt-6">Existing Users</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <span>{user.email}</span>
            <Select
              value={user.role}
              onValueChange={(newRole) => updateUserRole(user.id, newRole)}
            >
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
};
