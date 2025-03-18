import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

export interface InvoicingCompany {
  id: string;
  name: string;
  payment_template: string;
  default_currency?: string;
  user_id: string;
  created_at?: string;
}

export interface UserSettings {
  id?: string;
  user_id: string;
  show_currency: boolean;
  show_company: boolean;
  default_currency: string;
  default_company: string | null;
  enabled_currencies?: string[];
  companies?: InvoicingCompany[];
  created_at?: string;
  updated_at?: string;
}

// This interface represents what we get directly from the database
interface DatabaseUserSettings {
  id: string;
  user_id: string;
  show_currency: boolean;
  show_company: boolean;
  default_currency: string;
  default_company: string | null;
  created_at: string;
  updated_at: string;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchSettings = useCallback(async () => {
    if (!user && !import.meta.env.DEV) return;

    setIsLoading(true);
    try {
      // Get user settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("user_settings")
        .select()
        .eq("user_id", user?.id || "00000000-0000-0000-0000-000000000000")
        .maybeSingle();

      if (settingsError && settingsError.code !== "PGRST116") {
        throw settingsError;
      }

      // Get companies for the user
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select()
        .eq("user_id", user?.id || "00000000-0000-0000-0000-000000000000");

      if (companiesError) {
        throw companiesError;
      }

      if (settingsData) {
        // Set default enabled currencies since this field isn't in the database yet
        const defaultEnabledCurrencies = ["USD", "EUR", "GBP"];

        setSettings({
          ...settingsData,
          enabled_currencies: defaultEnabledCurrencies,
          companies: companiesData || []
        });
      } else {
        // Create default settings for new user
        const defaultSettings: UserSettings = {
          user_id: user?.id || "00000000-0000-0000-0000-000000000000",
          show_currency: true,
          show_company: true,
          default_currency: "USD",
          default_company: null,
          enabled_currencies: ["USD", "EUR", "GBP"],
          companies: companiesData || [],
        };

        const { data: newSettings, error: insertError } = await supabase
          .from("user_settings")
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) throw insertError;

        setSettings({
          ...newSettings,
          enabled_currencies: ["USD", "EUR", "GBP"], // Add enabled_currencies since it's not in the DB
          companies: companiesData || []
        });
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
      // Create a copy of updatedSettings without companies
      // since this field is managed separately
      const { companies, ...dbUpdateSettings } = updatedSettings;

      const { data, error } = await supabase
        .from("user_settings")
        .update(dbUpdateSettings)
        .eq("id", settings.id)
        .select()
        .single();

      if (error) throw error;

      // Refetch to get updated companies data
      await fetchSettings();
      toast.success("Settings updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
      return null;
    }
  };

  const addCompany = async (company: {
    name: string,
    payment_template: string,
    default_currency?: string
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("companies")
        .insert({
          user_id: user.id,
          name: company.name,
          payment_template: company.payment_template,
          default_currency: company.default_currency || "USD"
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh settings to get the updated companies list
      await fetchSettings();
      toast.success("Company added successfully");
      return data;
    } catch (error) {
      console.error("Error adding company:", error);
      toast.error("Failed to add company");
      return null;
    }
  };

  const updateCompany = async (id: string, updates: {
    name?: string,
    payment_template?: string,
    default_currency?: string
  }) => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Refresh settings to get the updated companies list
      await fetchSettings();
      toast.success("Company updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error("Failed to update company");
      return null;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Refresh settings to get the updated companies list
      await fetchSettings();
      toast.success("Company deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete company");
      return false;
    }
  };

  const updateEnabledCurrencies = async (newCurrencies: string[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_settings")
        .update({ enabled_currencies: newCurrencies })
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state
      setSettings((prev) => (prev ? { ...prev, enabled_currencies: newCurrencies } : prev));
    } catch (error) {
      console.error("Error updating enabled currencies:", error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    updateSettings,
    refreshSettings: fetchSettings,
    addCompany,
    updateCompany,
    deleteCompany,
    updateEnabledCurrencies
  };
};
