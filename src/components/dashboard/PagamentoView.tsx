import { useState } from 'react'
import { ChevronLeft, CreditCard, Smartphone } from 'lucide-react'
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
    <>
      <button
        type="button"
        className="btn-confirmar-carregar"
        onClick={handlePagar}
        disabled={processando}
      >
        {processando ? 'A processar...' : 'Confirmar pagamento'}
      </button>
    </>
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

    // Aceita números nacionais (9 dígitos) ou com prefixo +351.
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
        placeholder="Número MB WAY"
        className="payment-method-select"
        value={telemovel}
        onChange={(e) => setTelemovel(e.target.value)}
        disabled={processando}
      />

      <button
        type="button"
        className="btn-confirmar-carregar"
        onClick={handleSimularMbWay}
        disabled={processando}
      >
        {processando ? 'A simular...' : 'Simular pagamento MB WAY'}
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
    <div className="view-container view-container--pagamento">
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ChevronLeft />
      </button>

      <p className="payment-subtitle">Escolhe o valor</p>
      <div className="valores-carregar-grid">
        {VALORES_CARREGAMENTO.map((valor) => (
          <button
            key={valor}
            type="button"
            className={`btn-valor-carregar${!usarValorPersonalizado && valorSelecionado === valor ? ' btn-valor-carregar--ativo' : ''}`}
            onClick={() => selecionarValorFixo(valor)}
            disabled={isLoading}
          >
            {valor}€
          </button>
        ))}
      </div>

      <div className={`valor-personalizado-block${usarValorPersonalizado ? ' valor-personalizado-block--ativo' : ''}`}>
        <p className="payment-subtitle">Selecionar quantia</p>
        <div className="valor-personalizado-row">
          <input
            type="number"
            inputMode="decimal"
            min="1"
            max="500"
            step="0.01"
            placeholder="Ex.: 15"
            className="valor-personalizado-input"
            value={valorPersonalizado}
            onChange={(e) => selecionarValorPersonalizado(e.target.value)}
            onFocus={() => setUsarValorPersonalizado(true)}
            disabled={isLoading}
            aria-label="Quantia personalizada em euros"
          />
          <span className="valor-personalizado-simbolo">€</span>
        </div>
        {usarValorPersonalizado && valorPersonalizado && valorEfetivo == null ? (
          <p className="payment-error">Introduz uma quantia válida (mín. 1€).</p>
        ) : null}
      </div>

      <div className="payment-method-block">
        <p className="payment-subtitle">Forma de pagamento</p>

        <div className="payment-methods-grid">
          <button
            type="button"
            className={`payment-method-btn${formaPagamento === 'cartao_credito' ? ' payment-method-btn--ativo' : ''}`}
            onClick={() => setFormaPagamento('cartao_credito')}
            disabled={isLoading}
            aria-label="Pagar com cartão de crédito"
          >
            <CreditCard size={32} />
            <span className="payment-method-label">Visa</span>
          </button>

          <button
            type="button"
            className={`payment-method-btn${formaPagamento === 'mbway' ? ' payment-method-btn--ativo' : ''}`}
            onClick={() => setFormaPagamento('mbway')}
            disabled={isLoading}
            aria-label="Pagar com MB WAY"
          >
            <Smartphone size={32} />
            <span className="payment-method-label">MB WAY</span>
          </button>
        </div>
      </div>

      <div className="payment-card-wrapper">
        <div className="payment-card-inner">
          {formaPagamento === 'mbway' ? (
            valorEfetivo != null ? (
              <MbWayCheckoutForm
                valorSelecionado={valorEfetivo}
                onConfirmPagamento={onConfirmPagamento}
                onBack={onBack}
              />
            ) : (
              <p className="payment-error">Seleciona primeiro o valor a carregar.</p>
            )
          ) : stripePromise ? (
            <Elements
              stripe={stripePromise}
              options={{
                appearance: { theme: 'stripe' },
              }}
            >
              <div className="payment-card-element">
                <CardElement
                  options={{
                    hidePostalCode: true,
                    disableLink: true,
                    style: {
                      base: {
                        fontSize: '14px',
                        color: '#333',
                        '::placeholder': { color: '#888' },
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
            <p className="payment-error">Stripe não configurado. Verifica `VITE_STRIPE_PUBLISHABLE_KEY`.</p>
          )}
        </div>
      </div>

      <button type="button" className="btn-cancelar-carregar" onClick={onBack} disabled={isLoading}>
        Cancelar
      </button>
    </div>
  )
}

