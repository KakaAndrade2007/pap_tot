import { useState, useMemo } from 'react'
import { ChevronLeft, X, UtensilsCrossed } from 'lucide-react'
import {
  formatarDataEmenta,
  obterDiaEmenta,
  obterImagemEmenta,
  obterPratoEmenta,
  parseDataEmentaParaISO,
} from '../../lib/ementasDisplay'

interface EmentasViewProps {
  ementas: any[]
  onBack: () => void
  isLoading: boolean
}

function formatarLabelDia(raw: string): string {
  const iso = parseDataEmentaParaISO(raw)
  if (iso) {
    return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-PT', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
  }
  return raw
}

export function EmentasView({ ementas, onBack, isLoading }: EmentasViewProps) {
  const [selectedEmenta, setSelectedEmenta] = useState<any | null>(null)
  const [diaFiltro, setDiaFiltro] = useState<string | null>(null)

  const hoje = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  const ementasFuturas = useMemo(
    () => ementas.filter((item) => {
      const raw = obterDiaEmenta(item)
      if (!raw) return false
      const iso = parseDataEmentaParaISO(raw) ?? ''
      return iso >= hoje
    }),
    [ementas, hoje]
  )

  const diasUnicos = useMemo(() => {
    const vistos = new Set<string>()
    const lista: { raw: string; label: string; iso: string }[] = []
    for (const item of ementasFuturas) {
      const raw = obterDiaEmenta(item)
      if (!raw || vistos.has(raw)) continue
      vistos.add(raw)
      const iso = parseDataEmentaParaISO(raw) ?? raw
      lista.push({ raw, label: formatarLabelDia(raw), iso })
    }
    return lista.sort((a, b) => a.iso.localeCompare(b.iso))
  }, [ementasFuturas])

  const ementasFiltradas = useMemo(
    () => diaFiltro ? ementasFuturas.filter((item) => obterDiaEmenta(item) === diaFiltro) : ementasFuturas,
    [ementasFuturas, diaFiltro]
  )

  return (
    <div className="view-container" style={{ position: 'relative' }}>
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ChevronLeft />
      </button>

      {isLoading ? (
        <p className="sem-faturas">A carregar ementas...</p>
      ) : ementasFuturas.length === 0 ? (
        <p className="sem-faturas">Não existem ementas disponíveis.</p>
      ) : (
        <>
          {diasUnicos.length > 1 && (
            <div className="ementas-filtro-scroll">
              <button
                type="button"
                className={`ementas-filtro-chip${diaFiltro === null ? ' ementas-filtro-chip--ativo' : ''}`}
                onClick={() => setDiaFiltro(null)}
              >
                Todos
              </button>
              {diasUnicos.map(({ raw, label }) => (
                <button
                  key={raw}
                  type="button"
                  className={`ementas-filtro-chip${diaFiltro === raw ? ' ementas-filtro-chip--ativo' : ''}`}
                  onClick={() => setDiaFiltro(raw === diaFiltro ? null : raw)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="noticias-scroll">
            {ementasFiltradas.length === 0 ? (
              <p className="sem-faturas">Sem ementas para este dia.</p>
            ) : (
              ementasFiltradas.map((item: any) => {
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
              })
            )}
          </div>
        </>
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
