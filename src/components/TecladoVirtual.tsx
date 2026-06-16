import { useState } from 'react'
import { Delete, CornerDownLeft, ArrowBigUp } from 'lucide-react'
import { useTeclado } from '../contexts/TecladoContext'
import { digitarTextoSistema, apagarCaractereSistema } from '../services/tecladoSistema'

const LINHA_ACENTOS = ['á', 'é', 'í', 'ó', 'ú', 'ã', 'õ', 'â', 'ê', 'ô', 'ç', 'ü']
const LINHA_1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
const LINHA_2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']
const LINHA_3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm']
const LINHA_NUMERICA = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

export function TecladoVirtual() {
  const { campoAtivo, fecharTeclado } = useTeclado()
  const [maiusculas, setMaiusculas] = useState(false)

  if (!campoAtivo) return null

  const { valor, aoAlterar, tipo, modo } = campoAtivo

  function inserir(char: string) {
    if (modo === 'sistema') {
      digitarTextoSistema(char)
      return
    }
    aoAlterar(valor + char)
  }

  function apagar() {
    if (modo === 'sistema') {
      apagarCaractereSistema()
      return
    }
    aoAlterar(valor.slice(0, -1))
  }

  function tecla(char: string, key?: string) {
    const texto = maiusculas ? char.toUpperCase() : char
    return (
      <button key={key ?? char} type="button" className="teclado-tecla" onClick={() => inserir(texto)}>
        {texto}
      </button>
    )
  }

  return (
    <div className="teclado-virtual-overlay">
      <div className="teclado-virtual" onMouseDown={(e) => e.preventDefault()}>
        {tipo === 'numerico' ? (
          <div className="teclado-linha teclado-linha--numerica">
            {LINHA_NUMERICA.map((n) => tecla(n))}
            <button type="button" className="teclado-tecla teclado-tecla--especial" onClick={() => inserir(',')}>
              ,
            </button>
            <button type="button" className="teclado-tecla teclado-tecla--especial" onClick={apagar} aria-label="Apagar">
              <Delete size={20} />
            </button>
          </div>
        ) : (
          <>
            <div className="teclado-linha">{LINHA_NUMERICA.map((n) => tecla(n))}</div>
            <div className="teclado-linha">{LINHA_ACENTOS.map((c) => tecla(c))}</div>
            <div className="teclado-linha">{LINHA_1.map((c) => tecla(c))}</div>
            <div className="teclado-linha">{LINHA_2.map((c) => tecla(c))}</div>
            <div className="teclado-linha">
              <button
                type="button"
                className={`teclado-tecla teclado-tecla--especial${maiusculas ? ' teclado-tecla--ativa' : ''}`}
                onClick={() => setMaiusculas((m) => !m)}
                aria-label="Maiúsculas"
              >
                <ArrowBigUp size={20} />
              </button>
              {LINHA_3.map((c) => tecla(c))}
              <button type="button" className="teclado-tecla teclado-tecla--especial" onClick={apagar} aria-label="Apagar">
                <Delete size={20} />
              </button>
            </div>
            <div className="teclado-linha">
              <button type="button" className="teclado-tecla teclado-tecla--espaco" onClick={() => inserir(' ')}>
                espaço
              </button>
            </div>
          </>
        )}
        <button type="button" className="teclado-tecla teclado-tecla--concluir" onClick={fecharTeclado}>
          <CornerDownLeft size={18} />
          <span>Concluído</span>
        </button>
      </div>
    </div>
  )
}
