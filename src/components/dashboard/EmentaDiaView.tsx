import { ChevronLeft } from 'lucide-react'
import { obterDiaEmenta, obterImagemEmenta } from '../../lib/ementasDisplay'

interface EmentaDiaViewProps {
  ementa: any | null
  dataISO: string
  onBack: () => void
  onConfirm: (tipo: string) => void
  isLoading: boolean
}

const CUSTO = 2.50

export function EmentaDiaView({ ementa, dataISO, onBack, onConfirm, isLoading }: EmentaDiaViewProps) {
  const dia = ementa ? obterDiaEmenta(ementa) : ''
  const imagem = ementa ? obterImagemEmenta(ementa) : ''

  const dataFormatada = dataISO
    ? new Date(`${dataISO}T12:00:00`).toLocaleDateString('pt-PT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : ''

  const carne = (ementa?.carne ?? '').toString().trim()
  const peixe = (ementa?.peixe ?? '').toString().trim()
  const vegetariano = (ementa?.vegetariano ?? '').toString().trim()
  const temOpcoes = carne || peixe || vegetariano

  const opcoes = [
    { tipo: 'carne', rotulo: 'Carne', desc: carne },
    { tipo: 'peixe', rotulo: 'Peixe', desc: peixe },
    { tipo: 'vegetariano', rotulo: 'Vegetariano', desc: vegetariano },
  ].filter((o) => o.desc)

  return (
    <div className="view-container">
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ChevronLeft />
      </button>

      <div className="ementa-dia-header">
        <span className="ementa-dia-data-label">{dataFormatada}</span>
        {dia && <span className="ementa-dia-rotulo">{dia}</span>}
      </div>

      {!ementa ? (
        <p className="sem-faturas">Não há ementa disponível para este dia.</p>
      ) : (
        <div className="ementa-dia-opcoes">
          {imagem && (
            <img src={imagem} alt={dia || 'Ementa'} className="ementa-card-img" />
          )}

          {temOpcoes ? (
            <div className="ementa-opcoes-lista">
              {opcoes.map(({ tipo, rotulo, desc }) => (
                <div key={tipo} className="ementa-opcao-item">
                  <div className="ementa-opcao-text">
                    <span className="ementa-opcao-tipo">{rotulo}</span>
                    <span className="ementa-opcao-desc">{desc}</span>
                  </div>
                  <button
                    className="btn-comprar-opcao"
                    disabled={isLoading}
                    onClick={() => onConfirm(tipo)}
                  >
                    {isLoading ? '…' : (
                      <>
                        <span className="btn-comprar-opcao-label">Comprar</span>
                        <span className="btn-comprar-opcao-preco">{CUSTO.toFixed(2)}€</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="sem-faturas">Sem opções definidas para este dia.</p>
          )}
        </div>
      )}
    </div>
  )
}
