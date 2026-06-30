import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const btcpayUrl = Deno.env.get("BTCPAY_URL");
    const btcpayApiKey = Deno.env.get("BTCPAY_API_KEY");
    const btcpayStoreId = Deno.env.get("BTCPAY_STORE_ID");

    if (!btcpayUrl || !btcpayApiKey || !btcpayStoreId) {
      return new Response(
        JSON.stringify({ error: "BTCPay not configured. Add BTCPAY_URL, BTCPAY_API_KEY and BTCPAY_STORE_ID to Edge Function secrets." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { amount, orderId, customerEmail, customerName, redirectUrl, cartItems } = body;

    if (!amount || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: amount, orderId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create invoice via BTCPay Greenfield API
    const invoiceUrl = `${btcpayUrl}/api/v1/stores/${btcpayStoreId}/invoices`;

    const invoicePayload = {
      amount: amount,
      currency: "USD",
      metadata: {
        orderId: orderId,
        customerEmail: customerEmail || null,
        customerName: customerName || null,
        cartItems: cartItems || [],
      },
      checkout: {
        redirectURL: redirectUrl || `${btcpayUrl}/checkout`,
        defaultLanguage: "en",
      },
      receipt: {
        enabled: true,
      },
    };

    const response = await fetch(invoiceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `token ${btcpayApiKey}`,
      },
      body: JSON.stringify(invoicePayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("BTCPay invoice creation failed:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `BTCPay invoice creation failed: ${response.status} ${errorText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const invoice = await response.json();

    return new Response(
      JSON.stringify({
        invoiceId: invoice.id,
        checkoutLink: invoice.checkoutLink,
        status: invoice.status,
        amount: invoice.amount,
        currency: invoice.currency,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("BTCPay invoice error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Invoice creation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
