import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { EpbjcLogo } from './EpbjcLogo'
import { HomeView } from './dashboard/HomeView'
import { CalendarioView } from './dashboard/CalendarioView'
import { FaturasView } from './dashboard/FaturasView'
import { PagamentoView } from './dashboard/PagamentoView'
import { NoticiasView } from './dashboard/NoticiasView'
import { EmentasView } from './dashboard/EmentasView'

const TIPO_LABELS: Record<string, string> = {
  aluno: 'Aluno',
  professor: 'Professor',
  funcionario: 'Funcionário',
  pessoal_predio: 'Pessoal Prédio',
}

export function Dashboard({
  user,
  reservas,
  noticias,
  ementas,
  onLogout,
  onNovaReserva,
  onAdicionarSaldo,
  isLoading,
  isLoadingNoticias,
  isLoadingEmentas,
}: any) {
  const tipoLabel = TIPO_LABELS[user.tipo] ?? user.tipo
  const [view, setView] = useState<'home' | 'calendario' | 'faturas' | 'pagamento' | 'noticias' | 'ementas'>('home')
  const [dataSelecionada, setDataSelecionada] = useState('')

  return (
    <div className="home-screen">
      <div className={`totem-header${view === 'home' ? ' totem-header--home' : ''}`}>
        <div className="totem-header-start">
          <EpbjcLogo className="school-logo school-logo--header" />
          {view === 'home' && (
            <div className="user-info user-info--home">
              <div className="user-info-home-main">
                <strong className="user-info-nome">{user.nome}</strong>
                <span className="tipo-badge">{tipoLabel}</span>
              </div>
              <div className="user-info-home-saldo">
                <span className="saldo-label">Saldo</span>
                <span className="saldo-badge">{user.saldo.toFixed(2)}€</span>
              </div>
            </div>
          )}
        </div>
        {view === 'noticias' ? (
          <h2 className="header-view-title">Notícias</h2>
        ) : view === 'calendario' ? (
          <h2 className="header-view-title">Reservar almoço</h2>
        ) : view === 'ementas' ? (
          <h2 className="header-view-title">Ementas</h2>
        ) : view === 'faturas' ? (
          <h2 className="header-view-title">Faturas</h2>
        ) : view === 'pagamento' ? (
          <h2 className="header-view-title">Carregar saldo</h2>
        ) : view !== 'home' && (
          <div className="user-info">
            <p className="user-greeting">
              <span className="tipo-badge">{tipoLabel}</span>
              <strong>{user.nome}</strong>
            </p>
            <span className="saldo-badge">{user.saldo.toFixed(2)}€</span>
          </div>
        )}
        <button type="button" className="logout-btn" onClick={onLogout} aria-label="Terminar sessão">
          <LogOut />
        </button>
      </div>

      {view === 'home' && (
        <HomeView
          ementas={Array.isArray(ementas) ? ementas : []}
          isLoadingEmentas={Boolean(isLoadingEmentas)}
          onNavigate={setView}
        />
      )}

      {view === 'calendario' && (
        <CalendarioView
          ementas={Array.isArray(ementas) ? ementas : []}
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

      {view === 'pagamento' && (
        <PagamentoView
          user={user}
          onBack={() => setView('home')}
          onConfirmPagamento={onAdicionarSaldo}
          isLoading={isLoading}
        />
      )}

      {view === 'noticias' && (
        <NoticiasView
          noticias={Array.isArray(noticias) ? noticias : []}
          onBack={() => setView('home')}
          isLoading={Boolean(isLoadingNoticias)}
        />
      )}

      {view === 'ementas' && (
        <EmentasView
          ementas={Array.isArray(ementas) ? ementas : []}
          onBack={() => setView('home')}
          isLoading={Boolean(isLoadingEmentas)}
        />
      )}
    </div>
  )
}