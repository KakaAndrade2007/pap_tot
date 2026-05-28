import { ChevronLeft } from 'lucide-react'
import { useMemo } from 'react'
import { obterDiasReservaveisComEmenta } from '../../lib/ementasDisplay'

interface CalendarioViewProps {
  ementas: any[]
  dataSelecionada: string
  setDataSelecionada: (data: string) => void
  onBack: () => void
  onConfirm: () => void
  isLoading: boolean
}

export function CalendarioView({
  ementas,
  dataSelecionada,
  setDataSelecionada,
  onBack,
  onConfirm,
  isLoading,
}: CalendarioViewProps) {
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
              className={`dia-btn ${dataSelecionada === dia.iso ? 'active' : ''}`}
              onClick={() => setDataSelecionada(dia.iso)}
              title={dia.rotulo}
            >
              {dia.dia}
              <span>{dia.mesLabel}</span>
            </button>
          ))}
        </div>
      )}

      <button
        className="btn-confirmar-reserva"
        disabled={!dataSelecionada || isLoading || diasReservaveis.length === 0}
        onClick={onConfirm}
      >
        {isLoading ? 'A PROCESSAR...' : 'CONFIRMAR RESERVA'}
      </button>
    </div>
  )
}
