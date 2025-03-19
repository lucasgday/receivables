import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/components/AuthProvider";

type EmailInvoice = Tables<"invoices"> & {
  customer: {
    name: string;
    email: string;
  };
};

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
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        customer:customers (
          name,
          email
        )
      `)
      .eq("user_id", userId)
      .eq("status", "Pending");

    if (error) throw error;
    return data || [];
  },

  async sendBulkEmails(invoices: EmailInvoice[]): Promise<any[]> {
    const results = [];
    for (const invoice of invoices) {
      if (invoice.customer?.email) {
        try {
          const result = await this.sendInvoiceEmail(invoice.id);
          results.push(result);
        } catch (error) {
          console.error(`Failed to send email for invoice ${invoice.id}:`, error);
          results.push({ error, invoiceId: invoice.id });
        }
      }
    }
    return results;
  },

  async sendInvoiceEmail(invoiceId: string): Promise<any> {
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select(`
        *,
        customer:customers (
          name,
          email
        )
      `)
      .eq("id", invoiceId)
      .single();

    if (error) throw error;
    if (!invoice || !invoice.customer?.email) {
      throw new Error("Invoice or customer email not found");
    }

    // Here you would implement your email sending logic
    // For now, we'll just return a success response
    return {
      success: true,
      invoiceId,
      customerEmail: invoice.customer.email,
    };
  },

  async sendCustomerEmail(
    customer: { name: string; email: string },
    invoices: EmailInvoice[]
  ): Promise<any> {
    // Here you would implement your email sending logic
    // For now, we'll just return a success response
    return {
      success: true,
      customerEmail: customer.email,
      invoiceCount: invoices.length,
    };
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
