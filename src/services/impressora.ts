const PRINTER_URL = import.meta.env.VITE_PRINTER_URL || 'http://localhost:9100'

export interface DadosFatura {
  tipo: 'reserva' | 'consumo'
  prato: string
  data: string
  valor: number
  aluno: string
  pin?: string
  estado?: string
}

/** Envia o talão para o print-server local da Pi. Lança erro com mensagem amigável em falha. */
export async function imprimirFatura(dados: DadosFatura): Promise<void> {
  let resposta: Response
  try {
    resposta = await fetch(`${PRINTER_URL}/imprimir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    })
  } catch {
    throw new Error('Impressora indisponível. Verifica se está ligada.')
  }

  if (!resposta.ok) {
    const body = await resposta.json().catch(() => null)
    throw new Error(body?.error || 'Não foi possível imprimir a fatura.')
  }
}
