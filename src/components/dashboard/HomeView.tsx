import { Menu, Newspaper, Calendar, ShoppingCart } from 'lucide-react'

interface HomeViewProps {
  ultimaNoticia: any | null
  onNavigate: (view: 'home' | 'calendario' | 'faturas' | 'pagamento' | 'noticias' | 'ementas') => void
  onOpenSidebar: () => void
  onComprarHoje: () => void
}

function formatarData(valor: string | undefined) {
  if (!valor) return ''
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return ''
  return data.toLocaleDateString('pt-PT')
}

export function HomeView({ ultimaNoticia, onNavigate, onOpenSidebar, onComprarHoje }: HomeViewProps) {
  const noticiaData = ultimaNoticia
    ? formatarData(ultimaNoticia?.data_publicacao || ultimaNoticia?.created_at)
    : ''
  const noticiaImagemUrl = ultimaNoticia
    ? (ultimaNoticia?.imagem_url || ultimaNoticia?.imagem || ultimaNoticia?.foto || '')
    : ''

  return (
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

      {/* Botão comprar ementas */}
      <button
        type="button"
        className="btn-grande-red"
        onClick={onComprarHoje}
        aria-label="Comprar ementas de hoje"
      >
        <ShoppingCart />
        <span>Comprar ementas de hoje</span>
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
  )
}
