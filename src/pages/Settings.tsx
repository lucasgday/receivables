
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";

const Settings = () => {
  const { user } = useAuth();
  const { settings, isLoading, updateSettings } = useSettings();
  const [companyName, setCompanyName] = useState("My Company");
  const [email, setEmail] = useState(user?.email || "");
  const [defaultCompany, setDefaultCompany] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [showCurrency, setShowCurrency] = useState(true);
  const [showCompany, setShowCompany] = useState(true);
  
  useEffect(() => {
    if (settings) {
      setDefaultCurrency(settings.default_currency || "USD");
      setDefaultCompany(settings.default_company || "");
      setShowCurrency(settings.show_currency);
      setShowCompany(settings.show_company);
    }
  }, [settings]);

  const saveGeneralSettings = () => {
    toast.success("Settings saved successfully");
  };

  const saveInvoiceSettings = async () => {
    await updateSettings({
      default_currency: defaultCurrency,
      default_company: defaultCompany,
      show_currency: showCurrency,
      show_company: showCompany,
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-8">
          <SidebarTrigger className="mb-4" />
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">Settings</h1>

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="invoices">Invoice Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>
                      Manage your company and application preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input 
                        id="companyName" 
                        value={companyName} 
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Theme Preferences</h3>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="darkMode">Dark Mode</Label>
                        <Switch id="darkMode" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={saveGeneralSettings}>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account details and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" value="********" readOnly />
                      <p className="text-sm text-muted-foreground">
                        To change your password, log out and use the password reset option
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => toast.success("Account updated")}>Update Account</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose what notifications you receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Payment Notifications</h4>
                          <p className="text-sm text-muted-foreground">Receive notifications when payments are received</p>
                        </div>
                        <Switch id="paymentNotifications" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Overdue Invoice Reminders</h4>
                          <p className="text-sm text-muted-foreground">Get alerted when invoices become overdue</p>
                        </div>
                        <Switch id="overdueNotifications" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">System Updates</h4>
                          <p className="text-sm text-muted-foreground">Receive notifications about system updates and new features</p>
                        </div>
                        <Switch id="systemUpdates" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => toast.success("Notification preferences saved")}>Save Preferences</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="invoices">
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Settings</CardTitle>
                    <CardDescription>
                      Customize your invoice preferences and defaults
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="paymentTerms">Default Payment Terms (days)</Label>
                      <Input id="paymentTerms" type="number" defaultValue={30} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                      <Input id="invoicePrefix" defaultValue="INV-" />
                    </div>
                    
                    <div className="space-y-4 mt-6">
                      <h3 className="text-lg font-medium">Invoice Fields</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="showCurrency">Show Currency</Label>
                          <p className="text-sm text-muted-foreground">Display currency on invoices</p>
                        </div>
                        <Switch 
                          id="showCurrency" 
                          checked={showCurrency}
                          onCheckedChange={setShowCurrency}
                        />
                      </div>
                      
                      {showCurrency && (
                        <div className="space-y-2 pl-6 border-l-2 border-muted ml-2">
                          <Label htmlFor="defaultCurrency">Default Currency</Label>
                          <Input 
                            id="defaultCurrency" 
                            value={defaultCurrency}
                            onChange={(e) => setDefaultCurrency(e.target.value)}
                            placeholder="USD"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="showCompany">Show Invoicing Company</Label>
                          <p className="text-sm text-muted-foreground">Display your company name on invoices</p>
                        </div>
                        <Switch 
                          id="showCompany" 
                          checked={showCompany}
                          onCheckedChange={setShowCompany}
                        />
                      </div>
                      
                      {showCompany && (
                        <div className="space-y-2 pl-6 border-l-2 border-muted ml-2">
                          <Label htmlFor="defaultCompany">Default Company Name</Label>
                          <Input 
                            id="defaultCompany"
                            value={defaultCompany}
                            onChange={(e) => setDefaultCompany(e.target.value)}
                            placeholder="Your Company Name"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="automaticReminders">Automatic Reminders</Label>
                        <p className="text-sm text-muted-foreground">Send automatic reminders for overdue invoices</p>
                      </div>
                      <Switch id="automaticReminders" defaultChecked />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={saveInvoiceSettings}>Save Settings</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
