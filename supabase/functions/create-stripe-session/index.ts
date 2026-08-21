import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, successUrl, cancelUrl } = await req.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: 'STRIPE_SECRET_KEY secret is not set in Supabase.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || "";
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Bestellung mit Artikeln aus der DB laden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found in database.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Artikel für Stripe mappen
    const lineItems = order.order_items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.product_name,
          description: `${item.size_label || ''} Sticker`,
          images: item.preview_image && item.preview_image.startsWith('http') ? [item.preview_image] : [],
        },
        unit_amount: Math.round(parseFloat(item.unit_price) * 100), // Cents
      },
      quantity: item.cart_quantity || 1,
    }));

    // Versandkosten als eigenen Posten hinzufügen (falls > 0)
    if (parseFloat(order.shipping_cost) > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Versand (${order.shipping_method === 'express' ? 'Express' : 'Standard'})`,
          },
          unit_amount: Math.round(parseFloat(order.shipping_cost) * 100),
        },
        quantity: 1,
      });
    }

    // Stripe Checkout Session erstellen
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      client_reference_id: orderId,
      customer_email: order.delivery_email || order.guest_email || undefined,
      success_url: successUrl || `${req.headers.get('origin')}/success.html?order=${order.order_number}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/checkout.html`,
      metadata: {
        orderId: orderId,
        orderNumber: order.order_number,
      },
    });

    // stripe_session_id in der Bestellung speichern
    const { error: updateError } = await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', orderId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ id: session.id, url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
