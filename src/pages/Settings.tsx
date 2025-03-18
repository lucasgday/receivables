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
import { useSettings, InvoicingCompany } from "@/hooks/useSettings";
import { useTheme } from "next-themes";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UsersTab } from "./UsersTab";

const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "ARS", label: "ARS - Argentine Peso" },
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "CLP", label: "CLP - Chilean Peso" },
  { value: "COP", label: "COP - Colombian Peso" },
  { value: "MXN", label: "MXN - Mexican Peso" },
  { value: "PEN", label: "PEN - Peruvian Sol" },
  { value: "UYU", label: "UYU - Uruguayan Peso" },
];

const Settings = () => {
  const { user } = useAuth();
  const { settings, isLoading, updateSettings, addCompany, updateCompany, deleteCompany, updateEnabledCurrencies } = useSettings();
  const { theme, setTheme } = useTheme();
  const [companyName, setCompanyName] = useState("My Company");
  const [email, setEmail] = useState(user?.email || "");
  const [defaultCompany, setDefaultCompany] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [showCurrency, setShowCurrency] = useState(true);
  const [showCompany, setShowCompany] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyTemplate, setNewCompanyTemplate] = useState("");
  const [newCompanyCurrency, setNewCompanyCurrency] = useState("USD");
  const [editCompanyId, setEditCompanyId] = useState<string | null>(null);
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editCompanyTemplate, setEditCompanyTemplate] = useState("");
  const [editCompanyCurrency, setEditCompanyCurrency] = useState("USD");
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [enabledCurrencies, setEnabledCurrencies] = useState<string[]>(["USD"]);
  const [isCurrencyDialogOpen, setIsCurrencyDialogOpen] = useState(false);

  const [emailTemplates, setEmailTemplates] = useState<{[key: string]: string}>({
    invoice: "Dear {{customer}},\n\nPlease find attached invoice #{{invoice_number}} for {{amount}}.\n\nThank you for your business.\n\nBest regards,\n{{company}}"
  });
  const [currentTemplate, setCurrentTemplate] = useState("invoice");
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (settings) {
      setDefaultCurrency(settings.default_currency || "USD");
      setDefaultCompany(settings.default_company || "");
      setShowCurrency(settings.show_currency);
      setShowCompany(settings.show_company);

      if (settings.enabled_currencies && Array.isArray(settings.enabled_currencies)) {
        setEnabledCurrencies(settings.enabled_currencies);
      }
    }

    setIsDarkMode(theme === "dark");
  }, [settings, theme]);

  const saveGeneralSettings = () => {
    toast.success("Settings saved successfully");
  };

  const saveInvoiceSettings = async () => {
    await updateSettings({
      default_currency: defaultCurrency,
      default_company: defaultCompany,
      show_currency: showCurrency,
      show_company: showCompany
    });
  };

  const saveCurrencySettings = async () => {
    await updateEnabledCurrencies(enabledCurrencies);
    toast.success("Currency settings saved successfully");
  };

  const saveEmailTemplate = () => {
    const updatedTemplates = { ...emailTemplates };
    updatedTemplates[currentTemplate] = emailTemplates[currentTemplate];
    setEmailTemplates(updatedTemplates);
    toast.success("Email template saved successfully");
  };

  const toggleDarkMode = (checked: boolean) => {
    setIsDarkMode(checked);
    setTheme(checked ? "dark" : "light");
  };

  const handleAddCompany = async () => {
    if (newCompanyName.trim() === "") {
      toast.error("Company name cannot be empty");
      return;
    }

    await addCompany({
      name: newCompanyName,
      payment_template: newCompanyTemplate,
      default_currency: newCompanyCurrency
    });

    setNewCompanyName("");
    setNewCompanyTemplate("");
    setNewCompanyCurrency("USD");
    setIsCompanyDialogOpen(false);
  };

  const handleEditCompany = async () => {
    if (!editCompanyId || editCompanyName.trim() === "") {
      toast.error("Company name cannot be empty");
      return;
    }

    await updateCompany(editCompanyId, {
      name: editCompanyName,
      payment_template: editCompanyTemplate,
      default_currency: editCompanyCurrency
    });

    setEditCompanyId(null);
    setEditCompanyName("");
    setEditCompanyTemplate("");
    setEditCompanyCurrency("USD");
    setIsEditDialogOpen(false);
  };

  const startEditCompany = (company: InvoicingCompany) => {
    setEditCompanyId(company.id);
    setEditCompanyName(company.name);
    setEditCompanyTemplate(company.payment_template);
    setEditCompanyCurrency(company.default_currency || "USD");
    setIsEditDialogOpen(true);
  };

  const handleDeleteCompany = async (id: string) => {
    if (confirm("Are you sure you want to delete this company?")) {
      await deleteCompany(id);
    }
  };

  const toggleCurrency = (currency: string) => {
    setEnabledCurrencies(prev => {
      if (prev.includes(currency)) {
        return prev.filter(c => c !== currency);
      } else {
        return [...prev, currency];
      }
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
                <TabsTrigger value="general" onClick={() => setActiveTab("general")}>General</TabsTrigger>
                <TabsTrigger value="account" onClick={() => setActiveTab("account")}>Account</TabsTrigger>
                <TabsTrigger value="users" onClick={() => setActiveTab("users")}>Users</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="invoices">Invoice Settings</TabsTrigger>
                <TabsTrigger value="companies">Companies</TabsTrigger>
                <TabsTrigger value="currencies">Currencies</TabsTrigger>
                <TabsTrigger value="email">Email Templates</TabsTrigger>
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
                        <Switch
                          id="darkMode"
                          checked={isDarkMode}
                          onCheckedChange={toggleDarkMode}
                        />
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

              <TabsContent value="users">
                <UsersTab />
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
                          <Select
                            value={defaultCurrency}
                            onValueChange={setDefaultCurrency}
                          >
                            <SelectTrigger id="defaultCurrency" className="w-full">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {CURRENCIES.filter(c =>
                                enabledCurrencies.includes(c.value)
                              ).map(currency => (
                                <SelectItem key={currency.value} value={currency.value}>
                                  {currency.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsCurrencyDialogOpen(true)}
                            >
                              Manage Available Currencies
                            </Button>
                          </div>
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
                          <Label htmlFor="defaultCompany">Default Company</Label>
                          <Select
                            value={defaultCompany || ""}
                            onValueChange={setDefaultCompany}
                            disabled={!settings?.companies?.length}
                          >
                            <SelectTrigger id="defaultCompany" className="w-full">
                              <SelectValue placeholder="Select a company" />
                            </SelectTrigger>
                            <SelectContent>
                              {settings?.companies?.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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

              <TabsContent value="companies">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Companies</CardTitle>
                      <CardDescription>
                        Manage your invoicing companies
                      </CardDescription>
                    </div>
                    <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Company
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Company</DialogTitle>
                          <DialogDescription>
                            Enter the details for your new invoicing company.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-company-name">Company Name</Label>
                            <Input
                              id="new-company-name"
                              value={newCompanyName}
                              onChange={(e) => setNewCompanyName(e.target.value)}
                              placeholder="Acme Inc."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-company-currency">Default Currency</Label>
                            <Select
                              value={newCompanyCurrency}
                              onValueChange={setNewCompanyCurrency}
                            >
                              <SelectTrigger id="new-company-currency">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent>
                                {CURRENCIES.filter(c =>
                                  enabledCurrencies.includes(c.value)
                                ).map(currency => (
                                  <SelectItem key={currency.value} value={currency.value}>
                                    {currency.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-company-template">Payment Template</Label>
                            <Textarea
                              id="new-company-template"
                              value={newCompanyTemplate}
                              onChange={(e) => setNewCompanyTemplate(e.target.value)}
                              placeholder="Please make payment to..."
                              rows={5}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsCompanyDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddCompany}>Add Company</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-6">Loading companies...</div>
                    ) : settings?.companies && settings.companies.length > 0 ? (
                      <div className="space-y-4">
                        {settings.companies.map((company) => (
                          <div key={company.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-medium">{company.name}</h3>
                                {company.default_currency && (
                                  <p className="text-sm text-muted-foreground">
                                    Default Currency: {company.default_currency}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => startEditCompany(company)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteCompany(company.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {company.payment_template && (
                              <div className="mt-2">
                                <Label className="text-sm text-muted-foreground mb-1">Payment Template</Label>
                                <p className="text-sm whitespace-pre-wrap border rounded-md p-2 bg-muted/30">
                                  {company.payment_template}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-muted-foreground mb-4">No companies added yet</p>
                        <Button onClick={() => setIsCompanyDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Company
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Company</DialogTitle>
                      <DialogDescription>
                        Update the details for your company.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-company-name">Company Name</Label>
                        <Input
                          id="edit-company-name"
                          value={editCompanyName}
                          onChange={(e) => setEditCompanyName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-company-currency">Default Currency</Label>
                        <Select
                          value={editCompanyCurrency}
                          onValueChange={setEditCompanyCurrency}
                        >
                          <SelectTrigger id="edit-company-currency">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.filter(c =>
                              enabledCurrencies.includes(c.value)
                            ).map(currency => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-company-template">Payment Template</Label>
                        <Textarea
                          id="edit-company-template"
                          value={editCompanyTemplate}
                          onChange={(e) => setEditCompanyTemplate(e.target.value)}
                          rows={5}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleEditCompany}>Update Company</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              <TabsContent value="currencies">
                <Card>
                  <CardHeader>
                    <CardTitle>Currency Settings</CardTitle>
                    <CardDescription>
                      Select which currencies are available throughout the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Select the currencies you want to make available for invoices and bank movements.
                        These currencies will be shown in dropdown menus across the application.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {CURRENCIES.map((currency) => (
                          <div
                            key={currency.value}
                            className="flex items-center space-x-2 p-2 border rounded hover:bg-muted/40 cursor-pointer"
                            onClick={() => toggleCurrency(currency.value)}
                          >
                            <Checkbox
                              checked={enabledCurrencies.includes(currency.value)}
                              onCheckedChange={() => toggleCurrency(currency.value)}
                            />
                            <span>{currency.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={saveCurrencySettings}>Save Currency Settings</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Templates</CardTitle>
                    <CardDescription>
                      Customize email templates for different purposes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="templateType">Template Type</Label>
                      <Select
                        value={currentTemplate}
                        onValueChange={(value) => setCurrentTemplate(value)}
                      >
                        <SelectTrigger id="templateType">
                          <SelectValue placeholder="Select template type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="invoice">Invoice Email</SelectItem>
                          <SelectItem value="reminder">Payment Reminder</SelectItem>
                          <SelectItem value="receipt">Payment Receipt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailTemplate">Email Template</Label>
                      <div className="text-xs text-muted-foreground mb-2">
                        Available placeholders: {"{{"} customer {"}}"}, {"{{"} invoice_number {"}}"}, {"{{"} amount {"}}"}, {"{{"} company {"}}"}
                      </div>
                      <Textarea
                        id="emailTemplate"
                        value={emailTemplates[currentTemplate] || ""}
                        onChange={(e) => {
                          const updatedTemplates = { ...emailTemplates };
                          updatedTemplates[currentTemplate] = e.target.value;
                          setEmailTemplates(updatedTemplates);
                        }}
                        rows={8}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={saveEmailTemplate}>Save Template</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <Dialog open={isCurrencyDialogOpen} onOpenChange={setIsCurrencyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Available Currencies</DialogTitle>
            <DialogDescription>
              Select which currencies you want to make available throughout the application.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {CURRENCIES.map((currency) => (
                  <div
                    key={currency.value}
                    className="flex items-center space-x-2 p-2 border rounded hover:bg-muted/40 cursor-pointer"
                    onClick={() => toggleCurrency(currency.value)}
                  >
                    <Checkbox
                      checked={enabledCurrencies.includes(currency.value)}
                      onCheckedChange={() => toggleCurrency(currency.value)}
                    />
                    <span>{currency.label}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCurrencyDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              saveCurrencySettings();
              setIsCurrencyDialogOpen(false);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Settings;
