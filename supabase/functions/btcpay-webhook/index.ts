import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const event = JSON.parse(body);
    console.log("BTCPay webhook event:", event.type, event.invoiceId);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const invoiceId = event.invoiceId || event.data?.id;
    const metadata = event.metadata || event.data?.metadata || {};
    const orderId = metadata.orderId;
    const deliveryStatus = event.deliveryStatus || event.type;
    const status = event.status || event.data?.status;

    // BTCPay webhook event types:
    // InvoiceCreated, InvoiceReceivedPayment, InvoicePaymentSettled,
    // InvoiceProcessing, InvoiceExpired, InvoiceInvalid, InvoiceSettled
    const eventType = event.type || "";

    if (orderId) {
      if (
        eventType.includes("Settled") ||
        eventType.includes("Confirmed") ||
        status === "Settled" ||
        status === "Confirmed"
      ) {
        await supabase
          .from("bookings")
          .update({ status: "confirmed", btcpay_invoice_id: invoiceId })
          .eq("id", orderId);
        console.log("Booking confirmed via BTCPay:", orderId, "Invoice:", invoiceId);
      } else if (
        eventType.includes("Expired") ||
        eventType.includes("Invalid") ||
        status === "Expired" ||
        status === "Invalid"
      ) {
        await supabase
          .from("bookings")
          .update({ status: "cancelled", btcpay_invoice_id: invoiceId })
          .eq("id", orderId);
        console.log("Booking cancelled via BTCPay:", orderId, "Invoice:", invoiceId);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("BTCPay webhook error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Webhook processing failed" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
