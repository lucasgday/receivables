import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import sgMail from 'https://esm.sh/@sendgrid/mail@7.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, body, invoiceId } = await req.json();

    // Initialize SendGrid with API key
    sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY') || '');

    // Get invoice PDF URL from Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select('pdf_url')
      .eq('id', invoiceId)
      .single();

    if (invoiceError) throw invoiceError;

    // Prepare email with attachment if PDF exists
    const msg = {
      to,
      from: Deno.env.get('SENDGRID_FROM_EMAIL') || '',
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
      attachments: invoice.pdf_url ? [
        {
          content: invoice.pdf_url,
          filename: `invoice-${invoiceId}.pdf`,
        },
      ] : undefined,
    };

    // Send email
    await sgMail.send(msg);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
