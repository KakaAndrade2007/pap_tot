import { ChevronLeft } from 'lucide-react'
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
  return (
    <div className="view-container">
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
              <article key={item?.id ?? `${dia}-${prato}`} className="noticia-card">
                <div className="noticia-card-topo">
                  <span>{dia || 'Ementa'}</span>
                  {dataExtra ? <span>{dataExtra}</span> : null}
                </div>
                <h3 className="ementa-pratos-texto">{prato}</h3>
                {imagem ? <img src={imagem} alt={dia || 'Ementa'} className="ementa-card-img" /> : null}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
