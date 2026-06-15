import { ChevronLeft } from 'lucide-react'
import { obterDiaEmenta, obterImagemEmenta } from '../../lib/ementasDisplay'

interface EmentaDiaViewProps {
  ementa: any | null
  dataISO: string
  onBack: () => void
  onConfirm: () => void
  isLoading: boolean
}

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
              {carne && (
                <div className="ementa-opcao-item">
                  <span className="ementa-opcao-tipo">Carne</span>
                  <span className="ementa-opcao-desc">{carne}</span>
                </div>
              )}
              {peixe && (
                <div className="ementa-opcao-item">
                  <span className="ementa-opcao-tipo">Peixe</span>
                  <span className="ementa-opcao-desc">{peixe}</span>
                </div>
              )}
              {vegetariano && (
                <div className="ementa-opcao-item">
                  <span className="ementa-opcao-tipo">Vegetariano</span>
                  <span className="ementa-opcao-desc">{vegetariano}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="sem-faturas">Sem opções definidas para este dia.</p>
          )}
        </div>
      )}

      <button
        className="btn-confirmar-reserva"
        disabled={isLoading}
        onClick={onConfirm}
      >
        {isLoading ? 'A PROCESSAR...' : 'CONFIRMAR RESERVA'}
      </button>
    </div>
  )
}
