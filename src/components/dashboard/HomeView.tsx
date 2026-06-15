import { Menu, Newspaper, Calendar } from 'lucide-react'
import { obterDiaEmenta, obterImagemEmenta, obterPratoEmenta } from '../../lib/ementasDisplay'

interface HomeViewProps {
  ementas: any[]
  isLoadingEmentas: boolean
  ultimaNoticia: any | null
  onNavigate: (view: 'home' | 'calendario' | 'faturas' | 'pagamento' | 'noticias' | 'ementas') => void
  onOpenSidebar: () => void
}

function formatarData(valor: string | undefined) {
  if (!valor) return ''
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return ''
  return data.toLocaleDateString('pt-PT')
}

export function HomeView({ ementas, isLoadingEmentas, ultimaNoticia, onNavigate, onOpenSidebar }: HomeViewProps) {
  const ementasParaLista = Array.isArray(ementas) ? ementas : []
  const ementasCarousel = ementasParaLista.length > 0 ? [...ementasParaLista, ...ementasParaLista] : []

  const noticiaData = ultimaNoticia
    ? formatarData(ultimaNoticia?.data_publicacao || ultimaNoticia?.created_at)
    : ''
  const noticiaImagemUrl = ultimaNoticia
    ? (ultimaNoticia?.imagem_url || ultimaNoticia?.imagem || ultimaNoticia?.foto || '')
    : ''

  return (
    <div className="dashboard-content dashboard-home">
      <div className="dashboard-home-grid">
        <aside className="dashboard-col-left">
          <div className="acoes-col-left">
            {/* Botão principal — abre a sidebar */}
            <button
              type="button"
              className="btn-menu-sidebar"
              onClick={onOpenSidebar}
              aria-label="Abrir menu"
            >
              <Menu size={48} />
              <span>Menu</span>
            </button>

            {/* Última notícia */}
            {ultimaNoticia ? (
              <button
                type="button"
                className="home-ultima-noticia"
                onClick={() => onNavigate('noticias')}
                aria-label="Ver notícias"
              >
                <div className="home-ultima-noticia-topo">
                  <span className="home-ultima-noticia-badge">
                    <Newspaper size={14} />
                    {ultimaNoticia?.tipo || ultimaNoticia?.categoria || 'Notícia'}
                  </span>
                  {noticiaData && (
                    <span className="home-ultima-noticia-data">
                      <Calendar size={13} />
                      {noticiaData}
                    </span>
                  )}
                </div>
                {noticiaImagemUrl && (
                  <img
                    src={noticiaImagemUrl}
                    alt={ultimaNoticia?.titulo || 'Notícia'}
                    className="home-ultima-noticia-img"
                  />
                )}
                <p className="home-ultima-noticia-titulo">
                  {ultimaNoticia?.titulo || ultimaNoticia?.title || 'Ver notícias'}
                </p>
                {(ultimaNoticia?.resumo || ultimaNoticia?.descricao) && (
                  <p className="home-ultima-noticia-resumo">
                    {ultimaNoticia?.resumo || ultimaNoticia?.descricao}
                  </p>
                )}
              </button>
            ) : (
              <div className="home-ultima-noticia home-ultima-noticia--vazia">
                <Newspaper size={28} />
                <p>Sem notícias recentes</p>
              </div>
            )}
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
