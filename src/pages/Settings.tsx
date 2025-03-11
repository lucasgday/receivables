
import { useState } from "react";
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

const Settings = () => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState("My Company");
  const [email, setEmail] = useState(user?.email || "");
  
  const saveGeneralSettings = () => {
    toast.success("Settings saved successfully");
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
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="automaticReminders">Automatic Reminders</Label>
                        <p className="text-sm text-muted-foreground">Send automatic reminders for overdue invoices</p>
                      </div>
                      <Switch id="automaticReminders" defaultChecked />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => toast.success("Invoice settings saved")}>Save Settings</Button>
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
