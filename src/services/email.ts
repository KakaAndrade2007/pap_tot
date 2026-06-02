export const EmailService = { 
  async enviarFatura(nome: string, email: string, dataReserva: string) {
    const apiKey = import.meta.env.VITE_RESEND_API_KEY;
    const totalAmount = "2.50€";

    if (!apiKey) {
      console.error("Erro: VITE_RESEND_API_KEY não está definida no ficheiro .env");
      throw new Error("Chave API do Resend não configurada.");
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'EPBJC <onboarding@resend.dev>',
        to: [email],
        subject: 'Compra realizada com sucesso! - EPBJC',
        html: `
          <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #fee2e2; border-radius: 16px; background-color: #ffffff; color: #1f2937; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #dc2626; padding-bottom: 20px;">
              <div style="display: inline-block; background-color: #fef2f2; border-radius: 50%; padding: 15px; margin-bottom: 10px;">
                <span style="color: #dc2626; font-size: 32px; font-weight: bold; line-height: 1;">✓</span>
              </div>
              <h2 style="color: #dc2626; margin: 0; font-size: 26px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Compra realizada com sucesso!</h2>
              <p style="color: #ef4444; margin: 5px 0 0 0; font-size: 14px; font-weight: 600;">EPBJC - Fatura Digital</p>
            </div>
            
            <div style="background-color: #fef2f2; border-radius: 12px; padding: 22px; margin-bottom: 30px; border-left: 5px solid #dc2626;">
              <p style="margin: 0 0 8px 0; font-size: 16px; line-height: 1.5; color: #991b1b;">Olá, <strong>${nome}</strong>,</p>
              <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.5;">Confirmamos a recepção do seu pagamento relativo à reserva efetuada para o dia <strong>${dataReserva}</strong>. O seu recibo detalhado encontra-se abaixo.</p>
            </div>
            
            <h3 style="color: #dc2626; font-size: 15px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; border-bottom: 1px solid #fee2e2; padding-bottom: 5px;">Recibo de Transação</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
              <tr>
                <td style="padding: 12px 0; color: #4b5563; border-bottom: 1px solid #f3f4f6;"><strong>Serviço / Reserva:</strong></td>
                <td style="padding: 12px 0; text-align: right; color: #111827; font-weight: 600; border-bottom: 1px solid #f3f4f6;">Reserva para ${dataReserva}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #4b5563; border-bottom: 1px solid #f3f4f6;"><strong>Método de Pagamento:</strong></td>
                <td style="padding: 12px 0; text-align: right; color: #111827; border-bottom: 1px solid #f3f4f6;">Online (Stripe)</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #4b5563; border-bottom: 1px solid #f3f4f6;"><strong>Data da Compra:</strong></td>
                <td style="padding: 12px 0; text-align: right; color: #111827; border-bottom: 1px solid #f3f4f6;">${new Date().toLocaleDateString()}</td>
              </tr>
              <tr style="background-color: #fef2f2;">
                <td style="padding: 14px 10px; color: #991b1b; font-weight: bold; border-top: 2px solid #fee2e2; border-bottom: 2px solid #fee2e2; border-radius: 6px 0 0 6px;">Total Pago:</td>
                <td style="padding: 14px 10px; text-align: right; color: #dc2626; font-weight: 800; font-size: 20px; border-top: 2px solid #fee2e2; border-bottom: 2px solid #fee2e2; border-radius: 0 6px 6px 0;">\${totalAmount}</td>
              </tr>
            </table>
            
            <div style="text-align: center; margin-top: 35px; border-top: 1px solid #fee2e2; padding-top: 20px;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.5;">Este é um documento digital emitido eletronicamente pela EPBJC. Guarde este comprovativo.<br>Por favor, não responda a este e-mail automático.</p>
            </div>
          </div>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erro na resposta do Resend:", errorData);
      throw new Error(errorData.message || 'Falha ao enviar email através do Resend.');
    }

    return response.json();
  }
};
