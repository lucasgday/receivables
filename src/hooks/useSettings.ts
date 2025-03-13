
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

export interface UserSettings {
  id?: string;
  user_id: string;
  show_currency: boolean;
  show_company: boolean;
  default_currency: string;
  default_company: string | null;
  created_at?: string;
  updated_at?: string;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchSettings = useCallback(async () => {
    if (!user && !import.meta.env.DEV) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user?.id || "00000000-0000-0000-0000-000000000000")
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows found, which is expected for new users
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings for new user
        const defaultSettings: UserSettings = {
          user_id: user?.id || "00000000-0000-0000-0000-000000000000",
          show_currency: true,
          show_company: true,
          default_currency: "USD",
          default_company: null,
        };

        const { data: newSettings, error: insertError } = await supabase
          .from("user_settings")
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newSettings || defaultSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateSettings = async (updatedSettings: Partial<UserSettings>) => {
    if (!settings?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .update(updatedSettings)
        .eq("id", settings.id)
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      toast.success("Settings updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
      return null;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    updateSettings,
    refreshSettings: fetchSettings
  };
};
