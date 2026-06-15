import { useState, type ReactNode } from 'react'
import { LogOut, Menu, X, Home, Newspaper, UtensilsCrossed, Calendar, Receipt, Wallet } from 'lucide-react'
import { EpbjcLogo } from './EpbjcLogo'
import { HomeView } from './dashboard/HomeView'
import { CalendarioView } from './dashboard/CalendarioView'
import { EmentaDiaView } from './dashboard/EmentaDiaView'
import { FaturasView } from './dashboard/FaturasView'
import { PagamentoView } from './dashboard/PagamentoView'
import { NoticiasView } from './dashboard/NoticiasView'
import { EmentasView } from './dashboard/EmentasView'
import { parseDataEmentaParaISO } from '../lib/ementasDisplay'

const TIPO_LABELS: Record<string, string> = {
  aluno: 'Aluno',
  professor: 'Professor',
  funcionario: 'Funcionário',
  pessoal_predio: 'Pessoal Prédio',
}

type DashView = 'home' | 'calendario' | 'ementa-dia' | 'faturas' | 'pagamento' | 'noticias' | 'ementas'

function encontrarEmentaParaData(ementas: any[], iso: string): any | null {
  const hoje = new Date()
  for (const item of ementas) {
    if (!item || typeof item !== 'object') continue
    const textos = [item.data, item.data_ementa, item.dia, item.dia_semana].filter(
      (v: unknown): v is string => typeof v === 'string' && (v as string).trim().length > 0
    )
    for (const texto of textos) {
      if (parseDataEmentaParaISO(texto, hoje) === iso) return item
    }
  }
  return null
}

export function Dashboard({
  user,
  reservas,
  historico,
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
  const [view, setView] = useState<DashView>('home')
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function navigate(dest: DashView) {
    setView(dest)
    setSidebarOpen(false)
  }

  const ementasDia = Array.isArray(ementas) ? ementas : []
  const ementaParaDia = dataSelecionada ? encontrarEmentaParaData(ementasDia, dataSelecionada) : null

  function handleDiaClick(iso: string) {
    setDataSelecionada(iso)
    setView('ementa-dia')
  }

  function handleConfirmarReserva(tipo: string) {
    onNovaReserva(dataSelecionada, tipo)
    setView('home')
    setDataSelecionada('')
  }

  const VIEW_TITLES: Partial<Record<DashView, string>> = {
    noticias: 'Notícias',
    calendario: 'Reservar almoço',
    'ementa-dia': 'Reservar almoço',
    ementas: 'Ementas',
    faturas: 'Histórico de Reservas',
    pagamento: 'Carregar saldo',
  }

  const NAV_ITEMS: { label: string; dest: DashView; icon: ReactNode }[] = [
    { label: 'Início', dest: 'home', icon: <Home size={22} /> },
    { label: 'Notícias', dest: 'noticias', icon: <Newspaper size={22} /> },
    { label: 'Ementas', dest: 'ementas', icon: <UtensilsCrossed size={22} /> },
    { label: 'Reservar almoço', dest: 'calendario', icon: <Calendar size={22} /> },
    { label: 'Histórico', dest: 'faturas', icon: <Receipt size={22} /> },
    { label: 'Carregar saldo', dest: 'pagamento', icon: <Wallet size={22} /> },
  ]

  return (
    <div className="home-screen">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar drawer */}
      <aside className={`sidebar-drawer${sidebarOpen ? ' sidebar-drawer--open' : ''}`}>
        <div className="sidebar-header">
          <EpbjcLogo className="school-logo school-logo--header" />
          <div className="sidebar-user">
            <strong className="sidebar-user-nome">{user.nome}</strong>
            <span className="tipo-badge">{tipoLabel}</span>
            <span className="saldo-badge sidebar-saldo">{user.saldo.toFixed(2)}€</span>
          </div>
          <button type="button" className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu">
            <X size={26} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ label, dest, icon }) => (
            <button
              key={dest}
              type="button"
              className={`sidebar-nav-item${view === dest ? ' sidebar-nav-item--active' : ''}`}
              onClick={() => navigate(dest)}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button type="button" className="sidebar-logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          <span>Terminar sessão</span>
        </button>
      </aside>

      <div className={`totem-header${view === 'home' ? ' totem-header--home' : ''}`}>
        {view === 'home' ? (
          <div className="totem-header-start">
            <EpbjcLogo className="school-logo school-logo--header" />
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
          </div>
        ) : (
          <>
            {VIEW_TITLES[view] && <h2 className="header-view-title">{VIEW_TITLES[view]}</h2>}
            <button type="button" className="logout-btn" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
              <Menu />
            </button>
          </>
        )}
      </div>

      {view === 'home' && (
        <HomeView
          ementas={ementasDia}
          isLoadingEmentas={Boolean(isLoadingEmentas)}
          ultimaNoticia={Array.isArray(noticias) && noticias.length > 0 ? noticias[0] : null}
          onNavigate={navigate}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      )}

      {view === 'calendario' && (
        <CalendarioView
          ementas={ementasDia}
          onBack={() => navigate('home')}
          onDiaClick={handleDiaClick}
        />
      )}

      {view === 'ementa-dia' && (
        <EmentaDiaView
          ementa={ementaParaDia}
          dataISO={dataSelecionada}
          onBack={() => setView('calendario')}
          onConfirm={handleConfirmarReserva}
          isLoading={isLoading}
        />
      )}

      {view === 'faturas' && (
        <FaturasView historico={historico} reservas={reservas} onBack={() => navigate('home')} />
      )}

      {view === 'pagamento' && (
        <PagamentoView
          user={user}
          onBack={() => navigate('home')}
          onConfirmPagamento={onAdicionarSaldo}
          isLoading={isLoading}
        />
      )}

      {view === 'noticias' && (
        <NoticiasView
          noticias={Array.isArray(noticias) ? noticias : []}
          onBack={() => navigate('home')}
          isLoading={Boolean(isLoadingNoticias)}
        />
      )}

      {view === 'ementas' && (
        <EmentasView
          ementas={ementasDia}
          onBack={() => navigate('home')}
          isLoading={Boolean(isLoadingEmentas)}
        />
      )}
    </div>
  )
}
