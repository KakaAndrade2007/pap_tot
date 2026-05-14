import { Utensils, Calendar as CalendarIcon, LogOut } from 'lucide-react'

interface DashboardProps {
  user: any;
  reservas: any[];
  onLogout: () => void;
  onNovaReserva: (data: string) => void;
  isLoading: boolean; // Adicionado aqui
}

export function Dashboard({ user, reservas, onLogout, onNovaReserva, isLoading }: DashboardProps) {
  return (
    <div className="home-screen">
      <div className="header">
        <div>
          <p>Bem-vindo,</p>
          <h1>{user.nome}!</h1>
        </div>
        <button className="logout-btn" onClick={onLogout}><LogOut size={30}/></button>
      </div>
      
      <div className="main-grid">
        <div className="side-panel">
          <div className="balance-card">
            <span>Saldo Atual</span>
            <h2>{user.saldo.toFixed(2)}€</h2>
          </div>
          
          <div className="reserva-box">
            <h3><Utensils /> Reservar Almoço</h3>
            <input 
              type="date" 
              id="dateInput" 
              className="totem-input"
              defaultValue={new Date().toISOString().split('T')[0]}
              min={new Date().toISOString().split('T')[0]} 
            />
            <button 
              className="btn-confirm" 
              disabled={isLoading}
              onClick={() => {
                const val = (document.getElementById('dateInput') as HTMLInputElement).value;
                onNovaReserva(val);
              }}
            >
              {isLoading ? 'A PROCESSAR...' : 'CONFIRMAR (2.50€)'}
            </button>
          </div>
        </div>

        <div className="reservas-panel">
          <h3><CalendarIcon /> Meus Almoços</h3>
          <div className="reservas-list">
            {reservas.length === 0 ? (
              <p>Nenhuma reserva para exibir.</p>
            ) : (
              reservas.map(res => (
                <div key={res.id} className="reserva-card">
                  <span>{new Date(res.data_reserva).toLocaleDateString('pt-PT')}</span>
                  <span className="status-tag">CONFIRMADO</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}