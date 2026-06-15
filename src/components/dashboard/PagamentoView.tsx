import { useState } from 'react'
import { ChevronLeft, Wallet, ArrowRight } from 'lucide-react'
import visaImg from '../../assets/visa.png'
import mbwayImg from '../../assets/mbway.png'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { stripePromise } from '../../lib/stripe'
import { mensagemErroEdgeFunction } from '../../services/edgeFunctionError'
import { supabase } from '../../services/supabase'

const VALORES_CARREGAMENTO = [5, 10, 20, 50]

type FormaPagamento = 'cartao_credito' | 'mbway'

type UserLike = {
  id?: string
  saldo?: number
  nome?: string
  tipo?: string
  email?: string
}

interface PagamentoViewProps {
  user: UserLike
  onBack: () => void
  onConfirmPagamento: (valor: number) => Promise<void> | void
  isLoading: boolean
}

function StripeCheckoutForm({
  user,
  valorSelecionado,
  formaPagamento,
  onConfirmPagamento,
  onBack,
}: {
  user: UserLike
  valorSelecionado: number
  formaPagamento: FormaPagamento
  onConfirmPagamento: (valor: number) => Promise<void> | void
  onBack: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [processando, setProcessando] = useState(false)

  async function handlePagar() {
    if (!stripe || !elements) return
    if (formaPagamento !== 'cartao_credito') {
      alert('Forma de pagamento não suportada ainda.')
      return
    }

    const card = elements.getElement(CardElement)
    if (!card) {
      alert('Campo do cartão não está pronto. Tenta novamente.')
      return
    }

    if (!user?.id) {
      alert('Sessão inválida. Faz logout e entra outra vez antes de pagar.')
      return
    }

    setProcessando(true)
    try {
      const { data, error } = await supabase.functions.invoke('processar-pagamento', {
        body: {
          valor: valorSelecionado,
          userId: user.id,
        },
      })

      if (error) {
        throw new Error(await mensagemErroEdgeFunction(error))
      }

      const clientSecret = data?.clientSecret
      if (!clientSecret) {
        throw new Error('Não recebi client_secret da function.')
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      })

      if (result.error) {
        throw new Error(result.error.message ?? 'Erro ao confirmar pagamento.')
      }

      if (result.paymentIntent?.status !== 'succeeded') {
        throw new Error(`Pagamento não concluído. Status: ${result.paymentIntent?.status}`)
      }

      await onConfirmPagamento(valorSelecionado)
      alert('Pagamento confirmado!')
      onBack()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      alert('Erro no pagamento: ' + (message || 'desconhecido'))
    } finally {
      setProcessando(false)
    }
  }

  return (
    <button
      type="button"
      className={`pg-btn-confirmar${processando ? ' pg-btn-confirmar--loading' : ''}`}
      onClick={handlePagar}
      disabled={processando}
    >
      {processando ? (
        <span className="pg-btn-spinner" />
      ) : (
        <>
          <span>Pagar {valorSelecionado.toFixed(2)}€</span>
          <ArrowRight size={18} />
        </>
      )}
    </button>
  )
}

function MbWayCheckoutForm({
  valorSelecionado,
  onConfirmPagamento,
  onBack,
}: {
  valorSelecionado: number
  onConfirmPagamento: (valor: number) => Promise<void> | void
  onBack: () => void
}) {
  const [processando, setProcessando] = useState(false)
  const [telemovel, setTelemovel] = useState('')

  async function handleSimularMbWay() {
    const numeroLimpo = telemovel.replace(/\s+/g, '')
    const valido = /^(\+351)?9\d{8}$/.test(numeroLimpo)
    if (!valido) {
      alert('Insere um número MB WAY válido (ex.: 912345678 ou +351912345678).')
      return
    }

    setProcessando(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200))
      await onConfirmPagamento(valorSelecionado)
      alert(`Simulação MB WAY aprovada para ${numeroLimpo}.`)
      onBack()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      alert('Erro na simulação MB WAY: ' + (message || 'desconhecido'))
    } finally {
      setProcessando(false)
    }
  }

  return (
    <>
      <input
        type="tel"
        inputMode="tel"
        placeholder="Ex.: 912 345 678"
        className="pg-mbway-input"
        value={telemovel}
        onChange={(e) => setTelemovel(e.target.value)}
        disabled={processando}
      />
      <button
        type="button"
        className={`pg-btn-confirmar${processando ? ' pg-btn-confirmar--loading' : ''}`}
        onClick={handleSimularMbWay}
        disabled={processando}
      >
        {processando ? (
          <span className="pg-btn-spinner" />
        ) : (
          <>
            <span>Pagar {valorSelecionado.toFixed(2)}€</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </>
  )
}

function obterValorNumerico(texto: string) {
  const valor = Number.parseFloat(texto.replace(',', '.').trim())
  if (Number.isNaN(valor) || valor <= 0) return null
  return Math.round(valor * 100) / 100
}

export function PagamentoView({ user, onBack, onConfirmPagamento, isLoading }: PagamentoViewProps) {
  const [valorSelecionado, setValorSelecionado] = useState<number | null>(null)
  const [valorPersonalizado, setValorPersonalizado] = useState('')
  const [usarValorPersonalizado, setUsarValorPersonalizado] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('cartao_credito')

  const valorEfetivo = usarValorPersonalizado
    ? obterValorNumerico(valorPersonalizado)
    : valorSelecionado

  const saldoAtual = user.saldo ?? 0
  const saldoApos = valorEfetivo != null ? saldoAtual + valorEfetivo : null

  function selecionarValorFixo(valor: number) {
    setUsarValorPersonalizado(false)
    setValorPersonalizado('')
    setValorSelecionado(valor)
  }

  function selecionarValorPersonalizado(texto: string) {
    setUsarValorPersonalizado(true)
    setValorSelecionado(null)
    setValorPersonalizado(texto)
  }

  return (
    <div className="view-container pg-view">
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ChevronLeft />
      </button>

      {/* Cabeçalho com saldo atual */}
      <div className="pg-saldo-card">
        <div className="pg-saldo-card-left">
          <Wallet size={22} className="pg-saldo-icon" />
          <span className="pg-saldo-card-label">Saldo atual</span>
        </div>
        <span className="pg-saldo-card-valor">{saldoAtual.toFixed(2)}€</span>
      </div>

      {/* Secção: escolher valor */}
      <div className="pg-section">
        <p className="pg-section-label">Valor a carregar</p>
        <div className="pg-valores-grid">
          {VALORES_CARREGAMENTO.map((valor) => (
            <button
              key={valor}
              type="button"
              className={`pg-btn-valor${!usarValorPersonalizado && valorSelecionado === valor ? ' pg-btn-valor--ativo' : ''}`}
              onClick={() => selecionarValorFixo(valor)}
              disabled={isLoading}
            >
              <span className="pg-btn-valor-num">{valor}</span>
              <span className="pg-btn-valor-eur">€</span>
            </button>
          ))}
        </div>

        <div className={`pg-input-row${usarValorPersonalizado ? ' pg-input-row--ativo' : ''}`}>
          <span className="pg-input-prefix">€</span>
          <input
            type="number"
            inputMode="decimal"
            min="1"
            max="500"
            step="0.01"
            placeholder="Outro valor"
            className="pg-input-custom"
            value={valorPersonalizado}
            onChange={(e) => selecionarValorPersonalizado(e.target.value)}
            onFocus={() => setUsarValorPersonalizado(true)}
            disabled={isLoading}
            aria-label="Quantia personalizada em euros"
          />
        </div>
        {usarValorPersonalizado && valorPersonalizado && valorEfetivo == null && (
          <p className="pg-error">Introduz uma quantia válida (mín. 1€).</p>
        )}
      </div>

      {/* Secção: forma de pagamento */}
      <div className="pg-section">
        <p className="pg-section-label">Forma de pagamento</p>
        <div className="pg-metodos-grid">
          <button
            type="button"
            className={`pg-metodo-btn${formaPagamento === 'cartao_credito' ? ' pg-metodo-btn--ativo' : ''}`}
            onClick={() => setFormaPagamento('cartao_credito')}
            disabled={isLoading}
            aria-label="Pagar com cartão Visa"
          >
            <img src={visaImg} alt="Visa" className="pg-metodo-logo" />
          </button>
          <button
            type="button"
            className={`pg-metodo-btn${formaPagamento === 'mbway' ? ' pg-metodo-btn--ativo' : ''}`}
            onClick={() => setFormaPagamento('mbway')}
            disabled={isLoading}
            aria-label="Pagar com MB WAY"
          >
            <img src={mbwayImg} alt="MB WAY" className="pg-metodo-logo" />
          </button>
        </div>
      </div>

      {/* Secção: detalhes do pagamento + confirmar */}
      <div className="pg-section pg-section--pagamento">
        {formaPagamento === 'mbway' ? (
          valorEfetivo != null ? (
            <MbWayCheckoutForm
              valorSelecionado={valorEfetivo}
              onConfirmPagamento={onConfirmPagamento}
              onBack={onBack}
            />
          ) : (
            <p className="pg-error">Seleciona primeiro o valor a carregar.</p>
          )
        ) : stripePromise ? (
          <Elements stripe={stripePromise} options={{ appearance: { theme: 'stripe' } }}>
            <div className="pg-card-element">
              <CardElement
                options={{
                  hidePostalCode: true,
                  disableLink: true,
                  style: {
                    base: {
                      fontSize: '15px',
                      color: '#333',
                      fontFamily: 'system-ui, sans-serif',
                      '::placeholder': { color: '#aaa' },
                    },
                    invalid: { color: '#f40808' },
                  },
                }}
              />
            </div>
            {valorEfetivo != null && (
              <StripeCheckoutForm
                user={user}
                valorSelecionado={valorEfetivo}
                formaPagamento={formaPagamento}
                onConfirmPagamento={onConfirmPagamento}
                onBack={onBack}
              />
            )}
          </Elements>
        ) : (
          <p className="pg-error">Stripe não configurado. Verifica `VITE_STRIPE_PUBLISHABLE_KEY`.</p>
        )}
      </div>

      {/* Resumo antes de pagar */}
      {valorEfetivo != null && saldoApos != null && (
        <div className="pg-resumo">
          <div className="pg-resumo-linha">
            <span className="pg-resumo-chave">A carregar</span>
            <span className="pg-resumo-valor-destaque">+{valorEfetivo.toFixed(2)}€</span>
          </div>
          <div className="pg-resumo-sep" />
          <div className="pg-resumo-linha">
            <span className="pg-resumo-chave">Saldo após</span>
            <span className="pg-resumo-valor">{saldoApos.toFixed(2)}€</span>
          </div>
        </div>
      )}

      <button type="button" className="pg-btn-cancelar" onClick={onBack} disabled={isLoading}>
        Cancelar
      </button>
    </div>
  )
}
