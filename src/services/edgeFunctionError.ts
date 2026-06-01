import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js'

/** Mensagem legível quando `functions.invoke` falha (inclui corpo JSON da Edge Function). */
export async function mensagemErroEdgeFunction(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = (await error.context.json()) as { error?: string; message?: string }
      if (typeof body?.error === 'string' && body.error.trim()) return body.error
      if (typeof body?.message === 'string' && body.message.trim()) return body.message
    } catch {
      /* corpo não é JSON */
    }
    return `Servidor respondeu com erro HTTP ${error.context.status}.`
  }

  if (error instanceof FunctionsRelayError) {
    return error.message || 'Erro de relay na Edge Function.'
  }

  if (error instanceof FunctionsFetchError) {
    return error.message || 'Não foi possível contactar a Edge Function.'
  }

  if (error instanceof Error) return error.message
  return String(error)
}
