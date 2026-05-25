import { useState } from 'react'
import { ChevronLeft, Check } from 'lucide-react'

interface FaturasViewProps {
  reservas: any[]
  onBack: () => void
}

export function FaturasView({ reservas, onBack }: FaturasViewProps) {
  // Mantemos apenas 'atuais' e 'anteriores' como abas oficiais
  const [subViewFaturas, setSubViewFaturas] = useState<'atuais' | 'anteriores'>('atuais')
  
  const hojeStr = new Date().toISOString().split('T')[0]
  
  // Filtros de datas baseados no dia de hoje
  const faturasAtuais = reservas.filter((r: any) => r.data_reserva >= hojeStr)
  const faturasAnteriores = reservas.filter((r: any) => r.data_reserva < hojeStr)

  return (
    <div className="view-container">
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ChevronLeft />
      </button>
      
      {/* Abas de Navegação Ajustadas */}
      <div className="faturas-tabs">
        <button 
          className={`tab-btn ${subViewFaturas === 'atuais' ? 'tab-active' : ''}`} 
          onClick={() => setSubViewFaturas('atuais')}
        >
          Atuais
        </button>
        <button 
          className={`tab-btn ${subViewFaturas === 'anteriores' ? 'tab-active' : ''}`} 
          onClick={() => setSubViewFaturas('anteriores')}
        >
          Anteriores
        </button>
      </div>

      {/* Lista de Reservas com Scroll */}
      <div className="faturas-scroll">
        {subViewFaturas === 'atuais' ? (
          faturasAtuais.length === 0 ? (
            <p className="sem-faturas">Nenhuma reserva ativa para os próximos dias.</p>
          ) : (
            faturasAtuais.map((r: any) => (
              <div key={r.id} className="fatura-card">
                <Check color="#f40808" />
                <div className="fatura-info">
                  <p>Almoço Agendado</p>
                  <span>{new Date(r.data_reserva).toLocaleDateString('pt-PT')}</span>
                </div>
                <strong>2.50€</strong>
              </div>
            ))
          )
        ) : (
          faturasAnteriores.length === 0 ? (
            <p className="sem-faturas">Nenhum histórico de refeições anteriores.</p>
          ) : (
            faturasAnteriores.map((r: any) => (
              <div key={r.id} className="fatura-card" style={{ opacity: 0.6 }}>
                <Check color="#999" />
                <div className="fatura-info">
                  <p>Almoço Consumido</p>
                  <span>{new Date(r.data_reserva).toLocaleDateString('pt-PT')}</span>
                </div>
                <strong>2.50€</strong>
              </div>
            ))
          )
        )}
      </div>
    </div>
  )
}