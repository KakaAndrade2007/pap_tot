import { ChevronLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { obterDiasReservaveisComEmenta } from '../../lib/ementasDisplay'

interface CalendarioViewProps {
  ementas: any[]
  onBack: () => void
  onDiaClick: (iso: string) => void
}

const DIAS_POR_PAGINA = 7

export function CalendarioView({ ementas, onBack, onDiaClick }: CalendarioViewProps) {
  const diasReservaveis = useMemo(
    () => obterDiasReservaveisComEmenta(Array.isArray(ementas) ? ementas : []),
    [ementas]
  )
  const [pagina, setPagina] = useState(1)

  const totalPaginas = Math.ceil(diasReservaveis.length / DIAS_POR_PAGINA)
  const paginaAtual = Math.min(pagina, totalPaginas || 1)
  const diasVisiveis = diasReservaveis.slice((paginaAtual - 1) * DIAS_POR_PAGINA, paginaAtual * DIAS_POR_PAGINA)

  return (
    <div className="view-container">
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ChevronLeft />
      </button>

      {diasReservaveis.length === 0 ? (
        <p className="sem-faturas">Não há dias com ementa disponível para reservar.</p>
      ) : (
        <>
          <div className="calendario-grid calendario-grid--dias-ementa">
            {diasVisiveis.map((dia) => (
              <button
                key={dia.iso}
                type="button"
                className="dia-btn"
                onClick={() => onDiaClick(dia.iso)}
                title={dia.rotulo}
              >
                {dia.dia}
                <span>{dia.mesLabel}</span>
              </button>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="historico-paginacao">
              <button
                type="button"
                className="paginacao-btn paginacao-seta"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
                aria-label="Página anterior"
              >
                ‹
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`paginacao-btn${paginaAtual === num ? ' paginacao-ativa' : ''}`}
                  onClick={() => setPagina(num)}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                className="paginacao-btn paginacao-seta"
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
                aria-label="Próxima página"
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
