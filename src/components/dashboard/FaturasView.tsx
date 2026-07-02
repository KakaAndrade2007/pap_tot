import { useState } from 'react'
import { ChevronLeft, Printer } from 'lucide-react'
import { imprimirFatura } from '../../services/impressora'

interface HistoricoItem {
  prato: string
  data_refeicao: string
  valor: number
  pin: string
  comprado_em: string
}

interface FaturasViewProps {
  historico: HistoricoItem[]
  aluno: string
  onBack: () => void
}

const PRATO_LABEL: Record<string, string> = {
  carne: 'Carne',
  peixe: 'Peixe',
  vegetariano: 'Vegetariano',
}

function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatarData(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const MESES_PT: Record<string, number> = {
  jan:0, janeiro:0, fev:1, fevereiro:1, mar:2, marco:2, março:2,
  abr:3, abril:3, mai:4, maio:4, jun:5, junho:5, jul:6, julho:6,
  ago:7, agosto:7, set:8, setembro:8, out:9, outubro:9, nov:10, novembro:10,
  dez:11, dezembro:11,
}

function normalizarDataRefeicao(valor: string): string {
  if (!valor) return ''

  // YYYY-M(M)-D(D) — ISO com ou sem zero-padding
  const isoMatch = valor.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (isoMatch) {
    const [, ano, mes, dia] = isoMatch
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
  }

  // DD/MM/YYYY ou DD-MM-YYYY (formato português)
  const ptMatch = valor.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})/)
  if (ptMatch) {
    const [, dia, mes, ano] = ptMatch
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
  }

  // "15 de Junho 2026" — texto sem avanço de ano (histórico)
  const textMatch = valor.match(/(\d{1,2})\s+(?:de\s+)?([A-Za-zÀ-ÿ]+)(?:\s+(?:de\s+)?(\d{4}))?/i)
  if (textMatch) {
    const diaNum = Number.parseInt(textMatch[1], 10)
    const mesTexto = textMatch[2].toLowerCase()
    const mesIdx = MESES_PT[mesTexto] ?? MESES_PT[mesTexto.slice(0, 3)] ?? MESES_PT[mesTexto.normalize('NFD').replace(/[̀-ͯ]/g, '')]
    if (mesIdx !== undefined && !Number.isNaN(diaNum)) {
      const ano = textMatch[3] ? Number.parseInt(textMatch[3], 10) : new Date().getFullYear()
      return `${ano}-${String(mesIdx + 1).padStart(2, '0')}-${String(diaNum).padStart(2, '0')}`
    }
  }

  return valor
}

function BotaoImprimir({ dados }: { dados: Parameters<typeof imprimirFatura>[0] }) {
  const [estado, setEstado] = useState<'idle' | 'imprimindo' | 'ok' | 'erro'>('idle')
  const [erro, setErro] = useState('')

  async function handleClick() {
    setEstado('imprimindo')
    setErro('')
    try {
      await imprimirFatura(dados)
      setEstado('ok')
      setTimeout(() => setEstado('idle'), 2500)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao imprimir.')
      setEstado('erro')
    }
  }

  return (
    <div className="historico-imprimir">
      <button
        type="button"
        className="btn-imprimir-fatura"
        onClick={handleClick}
        disabled={estado === 'imprimindo'}
      >
        <Printer size={16} />
        <span>{estado === 'imprimindo' ? 'A imprimir…' : estado === 'ok' ? 'Impresso!' : 'Imprimir fatura'}</span>
      </button>
      {estado === 'erro' && <p className="historico-imprimir-erro">{erro}</p>}
    </div>
  )
}

const ITENS_POR_PAGINA = 5

export function FaturasView({ historico, aluno, onBack }: FaturasViewProps) {
  const agora = new Date()
  const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`
  const proximas = historico.filter((item) => normalizarDataRefeicao(item.data_refeicao) >= hoje)
  const anteriores = historico.filter((item) => normalizarDataRefeicao(item.data_refeicao) < hoje)

  const [filtro, setFiltro] = useState<'proximas' | 'anteriores'>(proximas.length > 0 ? 'proximas' : 'anteriores')
  const [pagina, setPagina] = useState(1)
  const temDados = historico.length > 0

  const listaFiltrada = filtro === 'proximas' ? proximas : anteriores
  const totalPaginas = Math.ceil(listaFiltrada.length / ITENS_POR_PAGINA)
  const paginaAtual = Math.min(pagina, totalPaginas || 1)
  const listaVisivel = listaFiltrada.slice((paginaAtual - 1) * ITENS_POR_PAGINA, paginaAtual * ITENS_POR_PAGINA)

  function mudarFiltro(novo: 'proximas' | 'anteriores') {
    setFiltro(novo)
    setPagina(1)
  }

  return (
    <div className="view-container">
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ChevronLeft />
      </button>

      {!temDados ? (
        <p className="sem-faturas">Ainda não tens registos de almoços.</p>
      ) : (
        <div className="historico-scroll">
          <div className="faturas-tabs" style={{ marginBottom: '16px' }}>
            <button
              type="button"
              className={`tab-btn${filtro === 'proximas' ? ' tab-active' : ''}`}
              onClick={() => mudarFiltro('proximas')}
            >
              Próximas
            </button>
            <button
              type="button"
              className={`tab-btn${filtro === 'anteriores' ? ' tab-active' : ''}`}
              onClick={() => mudarFiltro('anteriores')}
            >
              Anteriores
            </button>
          </div>

          {listaFiltrada.length === 0 ? (
            <p className="sem-faturas">
              {filtro === 'proximas' ? 'Sem reservas futuras.' : 'Sem reservas anteriores.'}
            </p>
          ) : (
            <>
              {listaVisivel.map((item, i) => {
                const dataIso = normalizarDataRefeicao(item.data_refeicao)
                return (
                  <div key={i} className="historico-card">
                    <div className="historico-card-topo">
                      <span className="historico-prato">
                        {PRATO_LABEL[item.prato] ?? item.prato}
                      </span>
                      <span className="historico-valor">{Number(item.valor).toFixed(2)}€</span>
                    </div>
                    <div className="historico-card-corpo">
                      <div className="historico-linha">
                        <span className="historico-label">Data</span>
                        <span className="historico-valor-texto">{formatarData(dataIso)}</span>
                      </div>
                      <div className="historico-linha">
                        <span className="historico-label">Reservado em</span>
                        <span className="historico-valor-texto">{formatarDataHora(item.comprado_em)}</span>
                      </div>
                      <div className="historico-linha">
                        <span className="historico-label">PIN</span>
                        <span className="historico-pin">{item.pin}</span>
                      </div>
                    </div>
                    {filtro === 'proximas' && (
                      <BotaoImprimir
                        dados={{
                          tipo: 'consumo',
                          prato: PRATO_LABEL[item.prato] ?? item.prato,
                          data: formatarData(dataIso),
                          valor: Number(item.valor),
                          pin: item.pin,
                          aluno,
                        }}
                      />
                    )}
                  </div>
                )
              })}

              {totalPaginas > 1 && (
                <div className="historico-paginacao">
                  <button
                    type="button"
                    className="paginacao-btn paginacao-seta"
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={paginaAtual === 1}
                    aria-label="Página anterior"
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`paginacao-btn${paginaAtual === num ? ' paginacao-ativa' : ''}`}
                      onClick={() => setPagina(num)}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="paginacao-btn paginacao-seta"
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaAtual === totalPaginas}
                    aria-label="Próxima página"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
