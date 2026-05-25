import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { HomeView } from './dashboard/HomeView'
import { CalendarioView } from './dashboard/CalendarioView'
import { FaturasView } from './dashboard/FaturasView'

const TIPO_LABELS: Record<string, string> = {
  aluno: 'Aluno',
  professor: 'Professor',
  funcionario: 'Funcionário',
  pessoal_predio: 'Pessoal Prédio',
}

export function Dashboard({ user, reservas, onLogout, onNovaReserva, isLoading }: any) {
  const tipoLabel = TIPO_LABELS[user.tipo] ?? user.tipo
  const [view, setView] = useState<'home' | 'calendario' | 'faturas'>('home')
  const [dataSelecionada, setDataSelecionada] = useState('')

  return (
    <div className="home-screen">
      <div className="totem-header">
        <div className="user-info">
          <p className="user-greeting">
            <span className="tipo-badge">{tipoLabel}</span>
            <strong>{user.nome}</strong>
          </p>
          <span className="saldo-badge">{user.saldo.toFixed(2)}€</span>
        </div>
        <button className="logout-btn" onClick={onLogout}><LogOut /></button>
      </div>

      {view === 'home' && (
        <HomeView onNavigate={setView} />
      )}

      {view === 'calendario' && (
        <CalendarioView
          dataSelecionada={dataSelecionada}
          setDataSelecionada={setDataSelecionada}
          onBack={() => setView('home')}
          isLoading={isLoading}
          onConfirm={() => {
            onNovaReserva(dataSelecionada);
            setView('home');
            setDataSelecionada('');
          }}
        />
      )}

      {view === 'faturas' && (
        <FaturasView reservas={reservas} onBack={() => setView('home')} />
      )}
    </div>
  )
}