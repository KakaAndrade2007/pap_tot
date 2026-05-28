import { ChevronLeft, Newspaper } from 'lucide-react'

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
  return (
    <div className="view-container">
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ChevronLeft />
      </button>

      {isLoading ? (
        <p className="sem-faturas">A carregar notícias...</p>
      ) : noticias.length === 0 ? (
        <p className="sem-faturas">Não existem notícias disponíveis.</p>
      ) : (
        <div className="noticias-scroll">
          {noticias.map((noticia: any) => {
            const titulo = noticia?.titulo || noticia?.title || 'Notícia'
            const resumo = noticia?.resumo || noticia?.descricao || noticia?.conteudo || noticia?.content || ''
            const data = formatarData(noticia?.data_publicacao || noticia?.created_at)
            const tipo = noticia?.tipo || noticia?.categoria || noticia?.type || 'Geral'

            return (
              <article key={noticia?.id ?? `${titulo}-${data}`} className="noticia-card">
                <div className="noticia-card-topo">
                  <Newspaper size={20} />
                  {data ? <span>{data}</span> : null}
                </div>
                <span className="noticia-tipo">{tipo}</span>
                <h3>{titulo}</h3>
                {resumo ? <p>{resumo}</p> : null}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
