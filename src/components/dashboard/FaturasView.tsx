import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'

interface HistoricoItem {
  prato: string
  data_refeicao: string
  valor: number
  pin: string
  comprado_em: string
}

interface ReservaItem {
  id: string
  data_reserva: string
  tipo_refeicao: string
  created_at: string
}

interface FaturasViewProps {
  historico: HistoricoItem[]
  reservas: ReservaItem[]
  onBack: () => void
}

const PRATO_LABEL: Record<string, string> = {
  carne: 'Carne',
  peixe: 'Peixe',
  vegetariano: 'Vegetariano',
}

function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatarData(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function FaturasView({ historico, reservas, onBack }: FaturasViewProps) {
  const [filtroReservas, setFiltroReservas] = useState<'proximas' | 'anteriores'>('proximas')
  const temDados = reservas.length > 0 || historico.length > 0

  const hoje = new Date().toISOString().split('T')[0]
  const reservasProximas = reservas.filter((r) => r.data_reserva >= hoje)
  const reservasAnteriores = reservas.filter((r) => r.data_reserva < hoje)
  const reservasFiltradas = filtroReservas === 'proximas' ? reservasProximas : reservasAnteriores

  return (
    <div className="view-container">
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ChevronLeft />
      </button>

      {!temDados ? (
        <p className="sem-faturas">Ainda não tens registos de almoços.</p>
      ) : (
        <div className="historico-scroll">
          {reservas.length > 0 && (
            <>
              <p className="historico-secao-titulo">Reservas</p>
              <div className="faturas-tabs" style={{ marginBottom: '16px' }}>
                <button
                  type="button"
                  className={`tab-btn${filtroReservas === 'proximas' ? ' tab-active' : ''}`}
                  onClick={() => setFiltroReservas('proximas')}
                >
                  Próximas
                </button>
                <button
                  type="button"
                  className={`tab-btn${filtroReservas === 'anteriores' ? ' tab-active' : ''}`}
                  onClick={() => setFiltroReservas('anteriores')}
                >
                  Anteriores
                </button>
              </div>
              {reservasFiltradas.length === 0 ? (
                <p className="sem-faturas" style={{ marginBottom: '16px' }}>
                  {filtroReservas === 'proximas' ? 'Sem reservas futuras.' : 'Sem reservas anteriores.'}
                </p>
              ) : (
                reservasFiltradas.map((item) => (
                  <div key={item.id} className="historico-card">
                    <div className="historico-card-topo">
                      <span className="historico-prato">
                        {PRATO_LABEL[item.tipo_refeicao] ?? item.tipo_refeicao}
                      </span>
                      <span className="historico-valor">2.50€</span>
                    </div>
                    <div className="historico-card-corpo">
                      <div className="historico-linha">
                        <span className="historico-label">Data</span>
                        <span className="historico-valor-texto">{formatarData(item.data_reserva)}</span>
                      </div>
                      <div className="historico-linha">
                        <span className="historico-label">Reservado em</span>
                        <span className="historico-valor-texto">{formatarDataHora(item.created_at)}</span>
                      </div>
                      <div className="historico-linha">
                        <span className="historico-label">Estado</span>
                        <span className="historico-pin">Reservado</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {historico.length > 0 && (
            <>
              <p className="historico-secao-titulo">Almoços consumidos</p>
              {historico.map((item, i) => (
                <div key={i} className="historico-card">
                  <div className="historico-card-topo">
                    <span className="historico-prato">
                      {PRATO_LABEL[item.prato] ?? item.prato}
                    </span>
                    <span className="historico-valor">{Number(item.valor).toFixed(2)}€</span>
                  </div>
                  <div className="historico-card-corpo">
                    <div className="historico-linha">
                      <span className="historico-label">Refeição</span>
                      <span className="historico-valor-texto">{item.data_refeicao}</span>
                    </div>
                    <div className="historico-linha">
                      <span className="historico-label">Comprado em</span>
                      <span className="historico-valor-texto">{formatarDataHora(item.comprado_em)}</span>
                    </div>
                    <div className="historico-linha">
                      <span className="historico-label">PIN</span>
                      <span className="historico-pin">{item.pin}</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
