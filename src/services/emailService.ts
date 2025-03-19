import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/components/AuthProvider";

interface EmailInvoice {
  invoice: Tables<"invoices">;
  customer: Tables<"customers">;
  pdfUrl?: string;
}

type Invoice = Tables<"invoices">;
type Customer = Tables<"customers">;

interface EmailTemplate {
  subject: string;
  body: string;
}

const getEmailTemplate = (invoice: Invoice, customer: Customer): EmailTemplate => {
  return {
    subject: `Invoice ${invoice.invoice_number} from ${customer.name}`,
    body: `
Dear ${customer.name},

Please find attached invoice ${invoice.invoice_number} for ${invoice.amount} ${invoice.currency}.

Due Date: ${new Date(invoice.due_date).toLocaleDateString()}
Amount: ${invoice.amount} ${invoice.currency}

${invoice.notes ? `Notes: ${invoice.notes}` : ""}

Thank you for your business.

Best regards,
${invoice.invoicing_company || "Your Company"}
    `.trim(),
  };
};

export const emailService = {
  async getCurrentMonthInvoices(userId: string): Promise<EmailInvoice[]> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const { data: invoices, error } = await supabase
      .from("invoices")
      .select(`
        *,
        customers (
          *
        )
      `)
      .eq("user_id", userId)
      .gte("issued_date", startOfMonth.toISOString())
      .lte("issued_date", endOfMonth.toISOString());

    if (error) throw error;
    return invoices || [];
  },

  async sendBulkEmails(invoices: EmailInvoice[]) {
    // Group invoices by customer
    const customerInvoices = invoices.reduce((acc, invoice) => {
      const customerId = invoice.customer.id;
      if (!acc[customerId]) {
        acc[customerId] = {
          customer: invoice.customer,
          invoices: [],
        };
      }
      acc[customerId].invoices.push(invoice);
      return acc;
    }, {} as Record<string, { customer: Tables<"customers">; invoices: EmailInvoice[] }>);

    // Send emails to each customer
    const emailPromises = Object.values(customerInvoices).map(({ customer, invoices }) =>
      this.sendCustomerEmail(customer, invoices)
    );

    return Promise.all(emailPromises);
  },

  async sendCustomerEmail(
    customer: Tables<"customers">,
    invoices: EmailInvoice[]
  ) {
    // TODO: Implement email sending logic
    // This could use a service like SendGrid, AWS SES, or any other email service
    console.log(`Sending email to ${customer.email} with ${invoices.length} invoices`);
  },
};

export const sendInvoiceEmail = async (invoice: Invoice, customer: Customer) => {
  try {
    const template = getEmailTemplate(invoice, customer);

    // Call Supabase Edge Function to send email
    const { data, error } = await supabase.functions.invoke('send-invoice-email', {
      body: {
        to: customer.email,
        subject: template.subject,
        body: template.body,
        invoiceId: invoice.id,
      },
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending invoice email:', error);
    return { success: false, error: error.message };
  }
};
