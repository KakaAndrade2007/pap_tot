import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.0.0?target=deno"

// Cabeçalhos de segurança (CORS) para que o teu Site, App e Totem consigam falar com a API
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apiKey, content-type',
}

serve(async (req) => {
  // Trata o pedido inicial de validação do navegador (Preflight Request)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Vai buscar a chave secreta do Stripe guardada em segurança no Supabase
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) throw new Error("A chave secreta do Stripe não foi configurada.")

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(), // Obrigatório para rodar em Edge Functions
    })

    // 2. Receber os dados que o teu Totem/Site/App enviaram (valor e o ID do Aluno)
    const { valor, userId } = await req.json()

    if (!valor || !userId) {
      throw new Error("Faltam dados obrigatórios: valor ou userId.")
    }

    // 3. Criar a intenção de pagamento no Stripe (Multiplicado por 100 porque o Stripe conta em cêntimos)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(valor * 100),
      currency: 'eur',
      metadata: { userId: userId.toString() },
    })

    // 4. Responder ao teu Frontend com o "Client Secret" (o código que autoriza o cartão)
    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  }
})