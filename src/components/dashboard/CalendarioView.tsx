import { ChevronLeft } from 'lucide-react'

interface CalendarioViewProps {
  dataSelecionada: string
  setDataSelecionada: (data: string) => void
  onBack: () => void
  onConfirm: () => void
  isLoading: boolean
}

export function CalendarioView({ dataSelecionada, setDataSelecionada, onBack, onConfirm, isLoading }: CalendarioViewProps) {
  return (
    <div className="view-container">
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ChevronLeft />
      </button>
      <h2 className="view-title">Escolha o dia</h2>
      
      <div className="calendario-grid">
        {[18, 19, 20, 21, 22].map(dia => (
          <button 
            key={dia} 
            className={`dia-btn ${dataSelecionada === `2026-05-${dia}` ? 'active' : ''}`}
            onClick={() => setDataSelecionada(`2026-05-${dia}`)}
          >
            {dia}
            <span>MAIO</span>
          </button>
        ))}
      </div>

      <button 
        className="btn-confirmar-reserva" 
        disabled={!dataSelecionada || isLoading} 
        onClick={onConfirm}
      >
        {isLoading ? "A PROCESSAR..." : "CONFIRMAR RESERVA"}
      </button>
    </div>
  )
}