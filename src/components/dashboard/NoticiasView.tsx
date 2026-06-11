import { useState } from 'react'
import { ChevronLeft, Newspaper, X, Calendar } from 'lucide-react'

interface NoticiasViewProps {
  noticias: any[]
  onBack: () => void
  isLoading: boolean
}

function formatarData(valor: string | undefined) {
  if (!valor) return ''
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return ''
  return data.toLocaleDateString('pt-PT')
}

export function NoticiasView({ noticias, onBack, isLoading }: NoticiasViewProps) {
  const [selectedNoticia, setSelectedNoticia] = useState<any | null>(null)
  const [subViewNoticias, setSubViewNoticias] = useState<'todos' | 'fofoca' | 'podcast' | 'avisos'>('todos')

const noticiasFiltradas = subViewNoticias === 'todos'
  ? noticias
  : noticias.filter((n: any) => {
      const tipo = (n?.tipo || n?.categoria || n?.type || '').toLowerCase()
      if (subViewNoticias === 'avisos') {
        // Treat any type that contains "aviso" as an aviso
        return tipo.includes('aviso')
      }
      return tipo === subViewNoticias
    })

  // Get image URL if available
  const getImagemUrl = (noticia: any) => {
    return noticia?.imagem_url || noticia?.imagem || noticia?.foto || noticia?.banner_url || noticia?.banner || noticia?.url_imagem || ''
  }

  return (
    <div className="view-container" style={{ position: 'relative' }}>
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ChevronLeft />
      </button>

      <div className="noticias-tabs">
        <button
          className={`tab-btn ${subViewNoticias === 'todos' ? 'tab-active' : ''}`}
          onClick={() => setSubViewNoticias('todos')}
        >
          Todos
        </button>
        <button
          className={`tab-btn ${subViewNoticias === 'fofoca' ? 'tab-active' : ''}`}
          onClick={() => setSubViewNoticias('fofoca')}
        >
          Fofoca
        </button>
        <button
          className={`tab-btn ${subViewNoticias === 'podcast' ? 'tab-active' : ''}`}
          onClick={() => setSubViewNoticias('podcast')}
        >
          Podcast
        </button>
        <button
          className={`tab-btn ${subViewNoticias === 'avisos' ? 'tab-active' : ''}`}
          onClick={() => setSubViewNoticias('avisos')}
        >
          Avisos
        </button>
      </div>

      {isLoading ? (
        <p className="sem-faturas">A carregar notícias...</p>
      ) : noticiasFiltradas.length === 0 ? (
        <p className="sem-faturas">Não existem notícias disponíveis.</p>
      ) : (
        <div className="noticias-scroll">
          {noticiasFiltradas.map((noticia: any) => {
            const titulo = noticia?.titulo || noticia?.title || 'Notícia'
            const resumo = noticia?.resumo || noticia?.descricao || noticia?.conteudo || noticia?.content || ''
            const data = formatarData(noticia?.data_publicacao || noticia?.created_at)
            const tipo = noticia?.tipo || noticia?.categoria || noticia?.type || 'Geral'
            const imagemUrl = getImagemUrl(noticia)

            return (
              <article
                key={noticia?.id ?? `${titulo}-${data}`}
                className="noticia-card"
                onClick={() => setSelectedNoticia(noticia)}
                style={{ cursor: 'pointer' }}
              >
                <div className="noticia-card-topo">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Newspaper size={20} />
                    <span className="noticia-tipo">{tipo}</span>
                  </div>
                  {data ? <span>{data}</span> : null}
                </div>
                {imagemUrl && (
                  <div className="noticia-card-imagem-container" style={{ width: '100%', maxHeight: '180px', overflow: 'hidden', borderRadius: '12px', margin: '8px 0' }}>
                    <img
                      src={imagemUrl}
                      alt={titulo}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <h3>{titulo}</h3>
                {resumo ? <p style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{resumo}</p> : null}
              </article>
            )
          })}
        </div>
      )}

      {/* Modal/Overlay de Detalhe da Notícia */}
      {selectedNoticia && (
        <div className="noticia-modal-overlay" onClick={() => setSelectedNoticia(null)}>
          <div className="noticia-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="noticia-modal-close" 
              onClick={() => setSelectedNoticia(null)}
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
            
            <div className="noticia-modal-body">
              {getImagemUrl(selectedNoticia) && (
                <div className="noticia-modal-imagem-container">
                  <img 
                    src={getImagemUrl(selectedNoticia)} 
                    alt={selectedNoticia?.titulo || selectedNoticia?.title} 
                  />
                </div>
              )}
              
              <div className="noticia-modal-info">
                <div className="noticia-modal-meta">
                  <span className="noticia-tipo">
                    {selectedNoticia?.tipo || selectedNoticia?.categoria || selectedNoticia?.type || 'Geral'}
                  </span>
                  <span className="noticia-modal-data">
                    <Calendar size={14} style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline' }} />
                    {formatarData(selectedNoticia?.data_publicacao || selectedNoticia?.created_at)}
                  </span>
                </div>
                
                <h2 className="noticia-modal-titulo">
                  {selectedNoticia?.titulo || selectedNoticia?.title || 'Notícia'}
                </h2>
                
                <div className="noticia-modal-descricao">
                  {selectedNoticia?.descricao || selectedNoticia?.conteudo || selectedNoticia?.resumo || selectedNoticia?.content || ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
