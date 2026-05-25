import { Calendar, Receipt, Wallet } from 'lucide-react'

interface HomeViewProps {
  tipoLabel: string
  nome: string
  saldo: number
  onNavigate: (view: 'home' | 'calendario' | 'faturas') => void
  onAdicionarSaldo?: () => void
}

const EMENTA_SEMANA = [
  { dia: 'Segunda', prato: 'Bacalhau à Brás', img: 'https://images.unsplash.com/photo-1626509135521-e941198f395b?q=80&w=400' },
  { dia: 'Terça', prato: 'Rojões à Minhota', img: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=400' },
  { dia: 'Quarta', prato: 'Massa de Atum', img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=400' },
  { dia: 'Quinta', prato: 'Francesinha', img: 'https://images.unsplash.com/photo-1604908176997-4313979c1f1c?q=80&w=400' },
  { dia: 'Sexta', prato: 'Arroz de Pato', img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=400' },
]

export function HomeView({ tipoLabel, nome, saldo, onNavigate, onAdicionarSaldo }: HomeViewProps) {
  const handleAdicionarSaldo = () => {
    if (onAdicionarSaldo) {
      onAdicionarSaldo()
      return
    }
    alert('Adicionar saldo — funcionalidade em breve.')
  }

  return (
    <div className="dashboard-content dashboard-home">
      <div className="dashboard-home-grid">
        <aside className="dashboard-col-left">
          <section className="user-panel-home">
            <span className="tipo-badge">{tipoLabel}</span>
            <h2 className="user-panel-nome">{nome}</h2>
            <div className="user-panel-saldo-row">
              <span className="saldo-label">Saldo</span>
              <span className="saldo-badge">{saldo.toFixed(2)}€</span>
            </div>
            <button type="button" className="btn-adicionar-saldo" onClick={handleAdicionarSaldo}>
              <Wallet size={22} />
              Adicionar saldo
            </button>
          </section>

          <div className="acoes-col-left">
            <button type="button" className="btn-grande-red" onClick={() => onNavigate('calendario')}>
              <Calendar size={40} />
              Reservar almoço
            </button>
            <button type="button" className="btn-grande-white" onClick={() => onNavigate('faturas')}>
              <Receipt size={40} />
              Minhas faturas
            </button>
          </div>
        </aside>

        <div className="dashboard-col-right-area">
          <h3 className="ementa-semana-titulo">Ementa da semana</h3>
          <section className="dashboard-col-right">
            <div className="ementa-marquee-viewport">
              <div className="ementa-marquee-track">
                {[...EMENTA_SEMANA, ...EMENTA_SEMANA].map((item, index) => (
                  <article key={`${item.dia}-${index}`} className="ementa-dia-card">
                    <img src={item.img} alt={item.prato} className="ementa-dia-img" />
                    <div className="ementa-dia-info">
                      <span className="ementa-dia-nome">{item.dia}</span>
                      <p className="ementa-dia-prato">{item.prato}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
