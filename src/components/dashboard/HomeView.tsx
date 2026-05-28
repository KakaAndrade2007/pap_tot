import { Calendar, Newspaper, Receipt, Wallet } from 'lucide-react'
import { obterDiaEmenta, obterImagemEmenta, obterPratoEmenta } from '../../lib/ementasDisplay'

interface HomeViewProps {
  ementas: any[]
  isLoadingEmentas: boolean
  onNavigate: (view: 'home' | 'calendario' | 'faturas' | 'pagamento' | 'noticias' | 'ementas') => void
}

export function HomeView({ ementas, isLoadingEmentas, onNavigate }: HomeViewProps) {
  const ementasParaLista = Array.isArray(ementas) ? ementas : []
  const ementasCarousel = ementasParaLista.length > 0 ? [...ementasParaLista, ...ementasParaLista] : []

  return (
    <div className="dashboard-content dashboard-home">
      <div className="dashboard-home-grid">
        <aside className="dashboard-col-left">
          <div className="acoes-col-left">
            <button type="button" className="btn-adicionar-saldo btn-adicionar-saldo--home" onClick={() => onNavigate('pagamento')}>
              <Wallet size={22} />
              Adicionar saldo
            </button>
            <button type="button" className="btn-grande-red" onClick={() => onNavigate('calendario')}>
              <Calendar size={40} />
              Reservar almoço
            </button>
            <button type="button" className="btn-grande-red" onClick={() => onNavigate('noticias')}>
              <Newspaper size={40} />
              noticias
            </button>
            <button type="button" className="btn-grande-white" onClick={() => onNavigate('faturas')}>
              <Receipt size={40} />
              Minhas faturas
            </button>
          </div>
        </aside>

        <div className="dashboard-col-right-area">
          <button type="button" className="ementa-semana-titulo" onClick={() => onNavigate('ementas')}>
            Ementa da semana
          </button>
          <section className="dashboard-col-right">
            <div className="ementa-marquee-viewport">
              {isLoadingEmentas ? (
                <p className="sem-faturas">A carregar ementa...</p>
              ) : ementasParaLista.length === 0 ? (
                <p className="sem-faturas">Não existem ementas disponíveis.</p>
              ) : (
                <div className="ementa-marquee-track">
                  {ementasCarousel.map((item, index) => {
                    const dia = obterDiaEmenta(item)
                    const prato = obterPratoEmenta(item)
                    const imagem = obterImagemEmenta(item)

                    return (
                      <article key={`${item?.id ?? prato}-${index}`} className="ementa-dia-card">
                        {imagem ? <img src={imagem} alt={prato} className="ementa-dia-img" /> : null}
                        <div className="ementa-dia-info">
                          {dia ? <span className="ementa-dia-nome">{dia}</span> : null}
                          <p className="ementa-dia-prato">{prato}</p>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
