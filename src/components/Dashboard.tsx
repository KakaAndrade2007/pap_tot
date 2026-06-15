import { useState } from 'react'
import { LogOut } from 'lucide-react'
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
        {VIEW_TITLES[view] ? (
          <h2 className="header-view-title">{VIEW_TITLES[view]}</h2>
        ) : view !== 'home' ? (
          <div className="user-info">
            <p className="user-greeting">
              <span className="tipo-badge">{tipoLabel}</span>
              <strong>{user.nome}</strong>
            </p>
            <span className="saldo-badge">{user.saldo.toFixed(2)}€</span>
          </div>
        ) : null}
        <button type="button" className="logout-btn" onClick={onLogout} aria-label="Terminar sessão">
          <LogOut />
        </button>
      </div>

      {view === 'home' && (
        <HomeView
          ementas={ementasDia}
          isLoadingEmentas={Boolean(isLoadingEmentas)}
          onNavigate={setView}
        />
      )}

      {view === 'calendario' && (
        <CalendarioView
          ementas={ementasDia}
          onBack={() => setView('home')}
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
        <FaturasView historico={historico} onBack={() => setView('home')} />
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
          ementas={ementasDia}
          onBack={() => setView('home')}
          isLoading={Boolean(isLoadingEmentas)}
        />
      )}
    </div>
  )
}
