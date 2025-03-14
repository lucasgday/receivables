
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Printer, Mail } from "lucide-react";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/hooks/useSettings";

type Invoice = Tables<"invoices"> & {
  customers: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  } | null;
  categories: {
    name: string;
  } | null;
};

export const InvoicePDF = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select(`
            *,
            customers (
              name,
              email,
              address,
              city,
              state,
              zip,
              phone
            ),
            categories (
              name
            )
          `)
          .eq("id", id)
          .single();

        if (error) throw error;

        setInvoice(data);
        
        // Pre-populate email fields if customer has an email
        if (data.customers?.email) {
          setEmailTo(data.customers.email);
          setEmailSubject(`Invoice #${data.invoice_number} from ${data.invoicing_company || 'us'}`);
          
          // Generate default email body
          const amount = formatCurrency(Number(data.amount), data.currency || "USD");
          const company = data.invoicing_company || settings?.default_company || "us";
          setEmailBody(
            `Dear ${data.customers.name},\n\nPlease find attached invoice #${data.invoice_number} for ${amount}.\n\nThank you for your business.\n\nBest regards,\n${company}`
          );
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [id, settings]);

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const generatePDF = () => {
    const element = document.getElementById("invoice-pdf");
    const opt = {
      margin: 10,
      filename: `invoice_${invoice?.invoice_number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };
  
  const sendInvoiceEmail = async () => {
    if (!invoice) return;
    
    setIsSending(true);
    try {
      // Generate PDF
      const element = document.getElementById("invoice-pdf");
      const opt = {
        margin: 10,
        filename: `invoice_${invoice?.invoice_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // In a real application, you would:
      // 1. Send the PDF to a backend service
      // 2. Have the backend service send the email with the PDF attached
      
      // For now, we'll simulate a successful email send
      setTimeout(() => {
        setIsSending(false);
        setIsEmailDialogOpen(false);
        toast.success(`Invoice sent to ${emailTo}`);
      }, 1500);
      
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.error("Failed to send invoice");
      setIsSending(false);
    }
  };
  
  const openEmailDialog = () => {
    if (!invoice?.customers?.email) {
      toast.warning("Customer has no email address");
      return;
    }
    setIsEmailDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <p className="text-center">Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <p className="text-center">Invoice not found</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Invoice PDF</h1>
        <div className="flex gap-4">
          <Button onClick={generatePDF} variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={() => window.print()} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={openEmailDialog} variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Email Invoice
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none" id="invoice-pdf">
        <CardHeader className="border-b">
          <div className="flex justify-between">
            <div>
              <CardTitle className="text-2xl">INVOICE</CardTitle>
              <p className="text-muted-foreground">#{invoice.invoice_number}</p>
            </div>
            {invoice.invoicing_company && (
              <div className="text-right">
                <h2 className="font-bold">{invoice.invoicing_company}</h2>
                {/* You could include company details here from settings */}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <p className="font-medium">{invoice.customers?.name}</p>
              {invoice.customers?.address && (
                <p className="text-sm text-muted-foreground">{invoice.customers.address}</p>
              )}
              {(invoice.customers?.city || invoice.customers?.state || invoice.customers?.zip) && (
                <p className="text-sm text-muted-foreground">
                  {[
                    invoice.customers.city,
                    invoice.customers.state,
                    invoice.customers.zip
                  ].filter(Boolean).join(", ")}
                </p>
              )}
              {invoice.customers?.phone && (
                <p className="text-sm text-muted-foreground">Phone: {invoice.customers.phone}</p>
              )}
              {invoice.customers?.email && (
                <p className="text-sm text-muted-foreground">Email: {invoice.customers.email}</p>
              )}
            </div>
            <div className="text-right">
              <div className="grid grid-cols-2 gap-1 text-sm">
                <p className="font-medium">Invoice Date:</p>
                <p>{formatDate(invoice.issued_date)}</p>
                
                <p className="font-medium">Due Date:</p>
                <p>{formatDate(invoice.due_date)}</p>
                
                <p className="font-medium">Status:</p>
                <p>{invoice.status}</p>
                
                {invoice.status === "Paid" && invoice.paid_date && (
                  <>
                    <p className="font-medium">Paid On:</p>
                    <p>{formatDate(invoice.paid_date)}</p>
                  </>
                )}
                
                {invoice.categories?.name && (
                  <>
                    <p className="font-medium">Category:</p>
                    <p>{invoice.categories.name}</p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Description</th>
                    <th className="text-right p-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">Invoice {invoice.invoice_number}</p>
                        {invoice.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{invoice.notes}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      {formatCurrency(Number(invoice.amount), invoice.currency || "USD")}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-muted">
                  <tr>
                    <th className="text-right p-3">Total:</th>
                    <th className="text-right p-3 font-bold">
                      {formatCurrency(Number(invoice.amount), invoice.currency || "USD")}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="font-semibold mb-2">Payment Information:</h3>
            <p className="text-sm">
              Please include the invoice number ({invoice.invoice_number}) with your payment.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t flex flex-col items-start">
          <p className="text-sm text-muted-foreground mt-4">
            Thank you for your business!
          </p>
        </CardFooter>
      </Card>
      
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email Invoice</DialogTitle>
            <DialogDescription>
              Send this invoice via email to your customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-to">To</Label>
              <Input
                id="email-to"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-body">Message</Label>
              <Textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>Cancel</Button>
            <Button onClick={sendInvoiceEmail} disabled={isSending}>
              {isSending ? "Sending..." : "Send Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
