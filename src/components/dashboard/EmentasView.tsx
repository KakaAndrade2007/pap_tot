import { useState } from 'react'
import { ChevronLeft, X, UtensilsCrossed } from 'lucide-react'
import {
  formatarDataEmenta,
  obterDiaEmenta,
  obterImagemEmenta,
  obterPratoEmenta,
} from '../../lib/ementasDisplay'

interface EmentasViewProps {
  ementas: any[]
  onBack: () => void
  isLoading: boolean
}

export function EmentasView({ ementas, onBack, isLoading }: EmentasViewProps) {
  const [selectedEmenta, setSelectedEmenta] = useState<any | null>(null)

  return (
    <div className="view-container" style={{ position: 'relative' }}>
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ChevronLeft />
      </button>

      {isLoading ? (
        <p className="sem-faturas">A carregar ementas...</p>
      ) : ementas.length === 0 ? (
        <p className="sem-faturas">Não existem ementas disponíveis.</p>
      ) : (
        <div className="noticias-scroll">
          {ementas.map((item: any) => {
            const dia = obterDiaEmenta(item)
            const prato = obterPratoEmenta(item)
            const dataExtra = formatarDataEmenta(item)
            const imagem = obterImagemEmenta(item)

            return (
              <article
                key={item?.id ?? `${dia}-${prato}`}
                className="noticia-card"
                onClick={() => setSelectedEmenta(item)}
                style={{ cursor: 'pointer' }}
              >
                <div className="noticia-card-topo">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UtensilsCrossed size={20} />
                    <span>{dia || 'Ementa'}</span>
                  </div>
                  {dataExtra ? <span>{dataExtra}</span> : null}
                </div>
                <h3 className="ementa-pratos-texto">{prato}</h3>
                {imagem ? <img src={imagem} alt={dia || 'Ementa'} className="ementa-card-img" /> : null}
              </article>
            )
          })}
        </div>
      )}

      {selectedEmenta && (
        <div className="noticia-modal-overlay" onClick={() => setSelectedEmenta(null)}>
          <div className="noticia-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="noticia-modal-close"
              onClick={() => setSelectedEmenta(null)}
              aria-label="Fechar"
            >
              <X size={24} />
            </button>

            <div className="noticia-modal-body">
              {obterImagemEmenta(selectedEmenta) && (
                <div className="noticia-modal-imagem-container">
                  <img
                    src={obterImagemEmenta(selectedEmenta)}
                    alt={obterDiaEmenta(selectedEmenta) || 'Ementa'}
                  />
                </div>
              )}

              <div className="noticia-modal-info">
                <div className="noticia-modal-meta">
                  <span className="noticia-tipo" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <UtensilsCrossed size={14} />
                    Ementa
                  </span>
                  {formatarDataEmenta(selectedEmenta) && (
                    <span className="noticia-modal-data">{formatarDataEmenta(selectedEmenta)}</span>
                  )}
                </div>

                <h2 className="noticia-modal-titulo">
                  {obterDiaEmenta(selectedEmenta) || 'Ementa'}
                </h2>

                <div className="noticia-modal-descricao" style={{ whiteSpace: 'pre-line' }}>
                  {obterPratoEmenta(selectedEmenta)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
