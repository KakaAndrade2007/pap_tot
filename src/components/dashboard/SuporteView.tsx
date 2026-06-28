import { useState, type FormEvent } from 'react'
import { ChevronLeft, HelpCircle, Send } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { mensagemErroEdgeFunction } from '../../services/edgeFunctionError'
import { useCampoComTeclado } from '../../contexts/TecladoContext'

type UserLike = {
  nome?: string
  email?: string
}

interface SuporteViewProps {
  user: UserLike
  onBack: () => void
}

export function SuporteView({ user, onBack }: SuporteViewProps) {
  const [nome, setNome] = useState(user?.nome ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [assunto, setAssunto] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  const tecladoNome = useCampoComTeclado(nome, setNome, 'texto')
  const tecladoEmail = useCampoComTeclado(email, setEmail, 'texto')
  const tecladoAssunto = useCampoComTeclado(assunto, setAssunto, 'texto')
  const tecladoMensagem = useCampoComTeclado(mensagem, setMensagem, 'texto')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!nome.trim() || !email.trim() || !mensagem.trim()) {
      setErro('Preenche o nome, o email e a mensagem.')
      setEnviado(false)
      return
    }

    setErro('')
    setEnviando(true)
    try {
      const { error } = await supabase.functions.invoke('enviar-suporte', {
        body: { nome, email, assunto, mensagem },
      })

      if (error) {
        throw new Error(await mensagemErroEdgeFunction(error))
      }

      setEnviado(true)
      setAssunto('')
      setMensagem('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setErro(message || 'Não foi possível enviar o pedido de suporte.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="view-container">
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ChevronLeft />
      </button>

      <div className="sup-intro">
        <HelpCircle size={26} className="sup-intro-icon" />
        <p className="sup-intro-texto">
          Tens uma dúvida ou problema com o totem? Preenche o formulário e a nossa equipa entra em contacto contigo por email.
        </p>
      </div>

      <form className="pg-section" onSubmit={handleSubmit}>
        <label className="sup-label" htmlFor="sup-nome">Nome</label>
        <input
          id="sup-nome"
          type="text"
          className="sup-input"
          placeholder="O teu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          disabled={enviando}
          required
          {...tecladoNome}
        />

        <label className="sup-label" htmlFor="sup-email">Email</label>
        <input
          id="sup-email"
          type="email"
          className="sup-input"
          placeholder="o-teu-email@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={enviando}
          required
          {...tecladoEmail}
        />

        <label className="sup-label" htmlFor="sup-assunto">Assunto</label>
        <input
          id="sup-assunto"
          type="text"
          className="sup-input"
          placeholder="Ex.: Problema com reserva de almoço"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          disabled={enviando}
          {...tecladoAssunto}
        />

        <label className="sup-label" htmlFor="sup-mensagem">Mensagem</label>
        <textarea
          id="sup-mensagem"
          className="sup-textarea"
          placeholder="Descreve o teu problema ou dúvida..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          disabled={enviando}
          rows={5}
          required
          {...tecladoMensagem}
        />

        {erro && <p className="pg-error">{erro}</p>}
        {enviado && <p className="sup-sucesso">Pedido enviado! Vamos responder por email assim que possível.</p>}

        <button
          type="submit"
          className={`pg-btn-confirmar${enviando ? ' pg-btn-confirmar--loading' : ''}`}
          disabled={enviando}
        >
          {enviando ? (
            <span className="pg-btn-spinner" />
          ) : (
            <>
              <span>Enviar pedido</span>
              <Send size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
