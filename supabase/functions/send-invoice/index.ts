import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend"

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apiKey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { emailTo, totalAmount } = await req.json()

    const data = await resend.emails.send({
      // OBRIGATÓRIO EM MODO DE TESTE: Manter o @resend.dev
      from: 'Reserva Sucesso <klikaaki2007@gmail.com>', 
      to: [emailTo], // Lembra-te de passar o TEU email de registo no Frontend
      subject: 'Compra Realizada com Sucesso! 🎉',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 40px 10px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border-top: 6px solid #DC2626;">
            
            <!-- Cabeçalho -->
            <div style="padding: 30px; text-align: center; background-color: #ffffff;">
              <div style="background-color: #FEE2E2; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                <span style="font-size: 30px; color: #DC2626; line-height: 60px;">✓</span>
              </div>
              <h2 style="color: #DC2626; margin: 0; font-size: 24px; font-weight: 700;">Compra realizada com sucesso!</h2>
              <p style="color: #4B5563; margin-top: 5px; font-size: 16px;">A tua reserva está confirmada.</p>
            </div>

            <!-- Detalhes da Fatura -->
            <div style="padding: 0 30px 30px 30px;">
              <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px;">
                <h3 style="color: #1F2937; margin-top: 0; margin-bottom: 15px; font-size: 16px; border-bottom: 1px solid #E5E7EB; padding-bottom: 10px;">Resumo da Reserva</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4B5563; font-size: 14px;">Data da Compra:</td>
                    <td style="padding: 8px 0; color: #1F2937; font-weight: 600; font-size: 14px; text-align: right;">${new Date().toLocaleDateString('pt-PT')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4B5563; font-size: 14px;">Estado do Pagamento:</td>
                    <td style="padding: 8px 0; color: #059669; font-weight: 600; font-size: 14px; text-align: right;">Confirmado</td>
                  </tr>
                  <tr style="border-top: 1px dashed #E5E7EB;">
                    <td style="padding: 15px 0 0 0; color: #1F2937; font-weight: 700; font-size: 16px;">Valor Pago:</td>
                    <td style="padding: 15px 0 0 0; color: #DC2626; font-weight: 700; font-size: 20px; text-align: right;">${Number(totalAmount).toFixed(2)}€</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Rodapé -->
            <div style="background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">Este é um email automático referente à tua compra no Totem de Autoatendimento.</p>
            </div>

          </div>
        </div>
      `,
    })

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})