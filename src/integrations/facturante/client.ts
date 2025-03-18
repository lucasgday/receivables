import { Tables } from "../supabase/types";

interface FacturanteConfig {
  apiKey: string;
  apiSecret: string;
  environment: "sandbox" | "production";
}

interface FacturanteCustomer {
  name: string;
  document_type: string;
  document_number: string;
  address?: string;
  email?: string;
}

interface FacturanteInvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
}

interface FacturanteInvoiceRequest {
  customer: FacturanteCustomer;
  items: FacturanteInvoiceItem[];
  invoice_type: string;
  currency: string;
  due_date?: string;
  service_date?: string;
  payment_method?: string;
}

export class FacturanteClient {
  private baseUrl: string;
  private config: FacturanteConfig;

  constructor(config: FacturanteConfig) {
    this.config = config;
    this.baseUrl = config.environment === "production"
      ? "https://www.facturante.com/api/v2"
      : "https://www.facturante.com/api/sandbox/v2";
  }

  private async makeRequest(endpoint: string, method: string, data?: any) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.generateSignature(timestamp, data);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": this.config.apiKey,
        "X-API-SIGNATURE": signature,
        "X-API-TIMESTAMP": timestamp.toString(),
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to make request to Facturante API");
    }

    return response.json();
  }

  private generateSignature(timestamp: number, data?: any): string {
    // TODO: Implement signature generation according to Facturante docs
    // The signature should be a SHA256 HMAC of the timestamp + JSON.stringify(data) using the API secret
    return "";
  }

  private mapCustomerToFacturante(customer: Tables<"customers">): FacturanteCustomer {
    return {
      name: customer.name,
      document_type: customer.tax_id_type || "CUIT", // Default to CUIT, adjust as needed
      document_number: customer.tax_id || "",
      email: customer.email,
      address: customer.address,
    };
  }

  private mapInvoiceToFacturante(
    invoice: Tables<"invoices">,
    customer: Tables<"customers">
  ): FacturanteInvoiceRequest {
    return {
      customer: this.mapCustomerToFacturante(customer),
      items: [{
        description: invoice.notes || "Professional Services",
        quantity: 1,
        unit_price: invoice.amount,
        vat_rate: 21, // Default VAT rate, make configurable if needed
      }],
      invoice_type: "A", // Make configurable based on customer type
      currency: invoice.currency || "ARS",
      due_date: invoice.due_date,
      service_date: invoice.issued_date,
      payment_method: "TRANSFER", // Make configurable
    };
  }

  public async generateInvoice(
    invoice: Tables<"invoices">,
    customer: Tables<"customers">
  ) {
    const invoiceData = this.mapInvoiceToFacturante(invoice, customer);
    return this.makeRequest("/invoices", "POST", invoiceData);
  }

  public async getInvoiceStatus(invoiceId: string) {
    return this.makeRequest(`/invoices/${invoiceId}`, "GET");
  }

  public async getInvoicePdf(invoiceId: string) {
    return this.makeRequest(`/invoices/${invoiceId}/pdf`, "GET");
  }
}
