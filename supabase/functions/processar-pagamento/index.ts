import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

// 1. Criamos os cabeçalhos de CORS para permitir que o teu Totem (React) consiga falar com a API
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // 2. Responde imediatamente aos pedidos de verificação (OPTIONS) do navegador
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { valor, userId } = await req.json()

    if (!valor || !userId) {
      return new Response(
        JSON.stringify({ error: "Falta o valor ou o userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Criar o Payment Intent no Stripe (o valor vem em cêntimos, ex: 10€ = 1000)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(valor * 100),
      currency: 'eur',
      metadata: { userId: userId },
      payment_method_types: ['card'],
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})