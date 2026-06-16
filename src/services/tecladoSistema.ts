const PRINTER_URL = import.meta.env.VITE_PRINTER_URL || 'http://localhost:9100'

async function chamarTecla(body: Record<string, string>) {
  try {
    await fetch(`${PRINTER_URL}/tecla`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    // silencioso — campo continua usável manualmente se o sistema não responder
  }
}

/** Simula uma tecla física a nível do sistema (via wtype na Pi). Para campos que a app não controla, como o iframe da Stripe. */
export function digitarTextoSistema(texto: string) {
  return chamarTecla({ acao: 'inserir', texto })
}

export function apagarCaractereSistema() {
  return chamarTecla({ acao: 'apagar' })
}
