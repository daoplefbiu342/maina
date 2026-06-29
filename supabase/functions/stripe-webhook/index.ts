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
    const oxapayApiKey = Deno.env.get("OXAPAY_API_KEY");
    const oxapayMerchantId = Deno.env.get("OXAPAY_MERCHANT_ID");

    if (!oxapayApiKey) {
      return new Response(
        JSON.stringify({ error: "Oxapay not configured. Add OXAPAY_API_KEY to Edge Function secrets." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.text();
    const event = JSON.parse(body);
    console.log("Oxapay webhook event:", event.type || event.status);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Oxapay webhook structure:
    // https://oxapay.com/api/webhook
    // Event types: payment_success, payment_failed, refund, etc.
    const status = event.status || event.type;
    const orderId = event.order_id || event.track_id || event.metadata?.booking_id;

    switch (status) {
      case "success":
      case "payment_success":
      case "confirmed": {
        const bookingId = orderId || event.metadata?.booking_id;
        if (bookingId) {
          await supabase
            .from("bookings")
            .update({ status: "confirmed" })
            .eq("id", bookingId);
          console.log("Booking confirmed via Oxapay:", bookingId);
        }
        break;
      }

      case "failed":
      case "payment_failed":
      case "cancelled": {
        const bookingId = orderId || event.metadata?.booking_id;
        if (bookingId) {
          await supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("id", bookingId);
          console.log("Booking cancelled via Oxapay:", bookingId);
        }
        break;
      }

      case "refunded": {
        const bookingId = orderId || event.metadata?.booking_id;
        if (bookingId) {
          await supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("id", bookingId);
          console.log("Booking refunded via Oxapay:", bookingId);
        }
        break;
      }

      default:
        console.log("Unhandled Oxapay event status:", status);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Oxapay webhook error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Webhook processing failed" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
