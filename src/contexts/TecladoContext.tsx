import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react'

export type TipoTeclado = 'texto' | 'numerico'

interface CampoAtivo {
  valor: string
  aoAlterar: (valor: string) => void
  tipo: TipoTeclado
  /** 'sistema': campo fora do nosso controlo (ex.: iframe da Stripe) — as teclas são
   * simuladas a nível do sistema operativo em vez de atualizar o valor diretamente. */
  modo?: 'sistema'
}

interface TecladoContextValue {
  campoAtivo: CampoAtivo | null
  registrarCampo: (campo: CampoAtivo) => void
  abrirTecladoSistema: (tipo: TipoTeclado) => void
  fecharTeclado: () => void
}

const TecladoContext = createContext<TecladoContextValue | null>(null)

export function TecladoProvider({ children }: { children: ReactNode }) {
  const [campoAtivo, setCampoAtivo] = useState<CampoAtivo | null>(null)

  const registrarCampo = useCallback((campo: CampoAtivo) => setCampoAtivo(campo), [])
  const abrirTecladoSistema = useCallback(
    (tipo: TipoTeclado) => setCampoAtivo({ valor: '', aoAlterar: () => {}, tipo, modo: 'sistema' }),
    []
  )
  const fecharTeclado = useCallback(() => setCampoAtivo(null), [])

  return (
    <TecladoContext.Provider value={{ campoAtivo, registrarCampo, abrirTecladoSistema, fecharTeclado }}>
      {children}
    </TecladoContext.Provider>
  )
}

export function useTeclado() {
  const ctx = useContext(TecladoContext)
  if (!ctx) throw new Error('useTeclado deve ser usado dentro de TecladoProvider')
  return ctx
}

/** Liga um <input> controlado ao teclado virtual: dá-lhe onFocus/onBlur prontos a usar. */
export function useCampoComTeclado(valor: string, aoAlterar: (v: string) => void, tipo: TipoTeclado = 'texto') {
  const { registrarCampo } = useTeclado()
  const ativoRef = useRef(false)

  useEffect(() => {
    if (ativoRef.current) registrarCampo({ valor, aoAlterar, tipo })
  }, [valor, aoAlterar, tipo, registrarCampo])

  return {
    onFocus: () => {
      ativoRef.current = true
      registrarCampo({ valor, aoAlterar, tipo })
    },
    onBlur: () => {
      ativoRef.current = false
    },
  }
}
