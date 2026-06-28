// @ts-nocheck — ficheiro Deno; os tipos de URL imports não existem no compilador Node.js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const EMAIL_SUPORTE = 'klikaaki2007@gmail.com'

function escapeHtml(valor: string) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { nome, email, assunto, mensagem } = await req.json()

    if (!nome || !email || !mensagem) {
      return new Response(
        JSON.stringify({ error: "Falta o nome, o email ou a mensagem." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const brevoApiKey = Deno.env.get('BREVO_API_KEY')
    if (!brevoApiKey) {
      return new Response(
        JSON.stringify({ error: "BREVO_API_KEY não está configurada nos secrets da function." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const agora = new Date()
    const dia = agora.toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    const horario = agora.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    const assuntoFinal = (typeof assunto === 'string' && assunto.trim()) || 'Pedido de suporte'

    const nomeSeguro = escapeHtml(nome)
    const emailSeguro = escapeHtml(email)
    const assuntoSeguro = escapeHtml(assuntoFinal)
    const mensagemSegura = escapeHtml(mensagem).replace(/\n/g, '<br/>')

    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'EPBJC', email: 'klikaaki2007@gmail.com' },
        to: [{ email: EMAIL_SUPORTE }],
        replyTo: { name: nome, email },
        subject: `[Suporte EPBJC] ${assuntoFinal}`,
        htmlContent: `
          <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e3efd8; border-radius: 16px; background-color: #ffffff; color: #1f2937;">
            <h2 style="color: #4b7c1d; margin: 0 0 20px 0; font-size: 20px; font-weight: 800;">Novo pedido de suporte</h2>

            <table style="width: 100%; border-collapse: collapse; margin: 0 0 20px 0; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #4b5563; border-bottom: 1px solid #f3f4f6;">Nome:</td>
                <td style="padding: 8px 0; text-align: right; color: #111827; font-weight: 600; border-bottom: 1px solid #f3f4f6;">${nomeSeguro}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #4b5563; border-bottom: 1px solid #f3f4f6;">Email:</td>
                <td style="padding: 8px 0; text-align: right; color: #111827; font-weight: 600; border-bottom: 1px solid #f3f4f6;">${emailSeguro}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #4b5563;">Dia:</td>
                <td style="padding: 8px 0; text-align: right; color: #111827; font-weight: 600;">${dia}, ${horario}</td>
              </tr>
            </table>

            <p style="font-size: 14px; font-weight: 700; color: #1f2937; margin: 0 0 6px 0;">Assunto: ${assuntoSeguro}</p>
            <p style="font-size: 14px; line-height: 1.6; color: #374151; background: #f7fcf3; padding: 14px; border-radius: 10px; border: 1px solid #e3efd8;">${mensagemSegura}</p>

            <div style="text-align: center; margin-top: 28px; border-top: 1px solid #e3efd8; padding-top: 16px;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.5;">Pedido enviado a partir do formulário de suporte do totem EPBJC. Responde diretamente a este email para contactar o remetente.</p>
            </div>
          </div>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const errorBody = await emailResponse.json().catch(() => ({}))
      throw new Error(errorBody.message || `Brevo respondeu com erro HTTP ${emailResponse.status}.`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
