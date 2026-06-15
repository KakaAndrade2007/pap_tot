import { ChevronLeft } from 'lucide-react'
import { useMemo } from 'react'
import { obterDiasReservaveisComEmenta } from '../../lib/ementasDisplay'

interface CalendarioViewProps {
  ementas: any[]
  onBack: () => void
  onDiaClick: (iso: string) => void
}

export function CalendarioView({ ementas, onBack, onDiaClick }: CalendarioViewProps) {
  const diasReservaveis = useMemo(
    () => obterDiasReservaveisComEmenta(Array.isArray(ementas) ? ementas : []),
    [ementas]
  )

  return (
    <div className="view-container">
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ChevronLeft />
      </button>

      {diasReservaveis.length === 0 ? (
        <p className="sem-faturas">Não há dias com ementa disponível para reservar.</p>
      ) : (
        <div className="calendario-grid calendario-grid--dias-ementa">
          {diasReservaveis.map((dia) => (
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
      )}
    </div>
  )
}
