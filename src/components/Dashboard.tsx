import { Utensils, Calendar as CalendarIcon, LogOut, FileText, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

interface DashboardProps {
  user: any;
  reservas: any[];
  onLogout: () => void;
  onNovaReserva: (data: string) => void;
  isLoading: boolean;
}

export function Dashboard({ user, reservas, onLogout, onNovaReserva, isLoading }: DashboardProps) {
  const [view, setView] = useState<'menu' | 'faturas'>('menu')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])

  return (
    <div className="home-screen">
      <div className="header">
        <div>
          <p>Utilizador: <strong>{user.nome}</strong></p>
          <h1>{view === 'menu' ? 'Painel Principal' : 'Minhas Faturas'}</h1>
        </div>
        <div className="header-btns">
          {view === 'faturas' && (
            <button className="back-view-btn" onClick={() => setView('menu')}><ArrowLeft /> VOLTAR</button>
          )}
          <button className="logout-btn" onClick={onLogout}><LogOut size={30} /></button>
        </div>
      </div>

      <div className="main-grid">
        {/* Lado Esquerdo: Saldo e Navegação */}
        <div className="side-panel">
          <div className="balance-card">
            <span>Saldo Disponível</span>
            <h2>{user.saldo.toFixed(2)}€</h2>
          </div>

          {view === 'menu' ? (
            <button className="fatura-nav-btn" onClick={() => setView('faturas')}>
              <FileText /> VER FATURAS
            </button>
          ) : (
            <div className="info-box">
              <p>As faturas são geradas automaticamente após a confirmação da reserva.</p>
            </div>
          )}
        </div>

        {/* Lado Direito: Conteúdo Dinâmico */}
        <div className="reservas-panel">
          {view === 'menu' ? (
            <>
              <h3><Utensils /> Reservar Almoço</h3>
              <div className="reserva-box-inner">
                <div className="date-field">
                  <label htmlFor="dateInput">
                    <CalendarIcon size={18} />
                    Escolha a data
                  </label>
                  <input
                    type="date"
                    id="dateInput"
                    className="totem-input"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <button
                  className="btn-confirm"
                  disabled={isLoading}
                  onClick={() => onNovaReserva(selectedDate)}
                >
                  {isLoading ? 'A PROCESSAR...' : 'CONFIRMAR (2.50€)'}
                </button>
              </div>
            </>
          ) : (
            <div className="faturas-list">
              <h3>Histórico de Pagamentos</h3>
              {reservas.length === 0 ? (
                <p>Sem faturas disponíveis.</p>
              ) : (
                reservas.map(res => (
                  <div key={res.id} className="fatura-item">
                    <div className="fatura-icon"><FileText size={20} /></div>
                    <div className="fatura-details">
                      <span className="fatura-date">Data: {new Date(res.data_reserva).toLocaleDateString('pt-PT')}</span>
                      <span className="fatura-desc">Serviço: Almoço Escolar</span>
                    </div>
                    <div className="fatura-value">
                      <strong>- 2.50€</strong>
                      <small>PAGO</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}