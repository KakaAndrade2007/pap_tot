// @ts-nocheck — ficheiro Deno; os tipos de URL imports não existem no compilador Node.js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
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

    // Usa service role key para contornar o RLS ao consultar a tabela perfis
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from('perfis')
      .select('id, saldo')
      .eq('id', userId)
      .single()

    if (perfilError || !perfil) {
      return new Response(
        JSON.stringify({ error: "Aluno não encontrado na base de dados." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

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
