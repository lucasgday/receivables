import { useState } from "react";
import { FacturanteClient } from "@/integrations/facturante/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

const facturanteClient = new FacturanteClient({
  apiKey: import.meta.env.VITE_FACTURANTE_API_KEY || "",
  apiSecret: import.meta.env.VITE_FACTURANTE_API_SECRET || "",
  environment: import.meta.env.VITE_FACTURANTE_ENVIRONMENT as "sandbox" | "production" || "sandbox",
});

export const useFacturante = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [fiscalInvoiceId, setFiscalInvoiceId] = useState<string | null>(null);

  const generateFiscalInvoice = async (
    invoice: Tables<"invoices">,
    customer: Tables<"customers">
  ) => {
    setIsGenerating(true);
    try {
      const result = await facturanteClient.generateInvoice(invoice, customer);
      setFiscalInvoiceId(result.id);
      toast.success("Fiscal invoice generated successfully");
      return result;
    } catch (error: any) {
      console.error("Error generating fiscal invoice:", error);
      toast.error(error.message || "Failed to generate fiscal invoice");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const getFiscalInvoiceStatus = async (invoiceId: string) => {
    try {
      return await facturanteClient.getInvoiceStatus(invoiceId);
    } catch (error: any) {
      console.error("Error getting fiscal invoice status:", error);
      toast.error(error.message || "Failed to get fiscal invoice status");
      return null;
    }
  };

  const downloadFiscalInvoicePdf = async (invoiceId: string) => {
    try {
      const result = await facturanteClient.getInvoicePdf(invoiceId);
      // Create a blob from the PDF data and download it
      const blob = new Blob([result], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fiscal-invoice-${invoiceId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error downloading fiscal invoice PDF:", error);
      toast.error(error.message || "Failed to download fiscal invoice PDF");
    }
  };

  return {
    isGenerating,
    fiscalInvoiceId,
    generateFiscalInvoice,
    getFiscalInvoiceStatus,
    downloadFiscalInvoicePdf,
  };
};
