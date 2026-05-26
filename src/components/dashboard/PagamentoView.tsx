import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { stripePromise } from '../../lib/stripe'
import { supabase } from '../../services/supabase'

const VALORES_CARREGAMENTO = [5, 10, 20, 50]

type FormaPagamento = 'cartao_credito'

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

    setProcessando(true)
    try {
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      const { data, error } = await supabase.functions.invoke('processar-pagamento', {
        body: {
          valor: valorSelecionado,
          userId: user?.id || 'user_teste_123',
        },
        headers: {
          Authorization: `Bearer ${anonKey}`,
          apiKey: anonKey,
        },
      })

      console.dir(error)

      if (error) {
        const errorMessage = typeof (error as { message?: string }).message === 'string' ? (error as { message?: string }).message : null
        throw new Error(errorMessage ?? 'Falha ao comunicar com a function.')
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

export function PagamentoView({ user, onBack, onConfirmPagamento, isLoading }: PagamentoViewProps) {
  const [valorSelecionado, setValorSelecionado] = useState<number | null>(null)
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('cartao_credito')

  return (
    <div className="view-container">
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ChevronLeft />
      </button>
      <h2 className="view-title">Carregar saldo</h2>

      <p className="payment-subtitle">Escolhe o valor</p>
      <div className="valores-carregar-grid">
        {VALORES_CARREGAMENTO.map((valor) => (
          <button
            key={valor}
            type="button"
            className={`btn-valor-carregar${valorSelecionado === valor ? ' btn-valor-carregar--ativo' : ''}`}
            onClick={() => setValorSelecionado(valor)}
          >
            {valor}€
          </button>
        ))}
      </div>

      <div className="payment-method-block">
        <p className="payment-subtitle">Forma de pagamento</p>

        <select
          className="payment-method-select"
          value={formaPagamento}
          onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
          disabled={isLoading}
        >
          <option value="cartao_credito">Cartão de crédito</option>
        </select>
      </div>

      <div className="payment-card-wrapper">
        <p className="payment-subtitle">Cartão de crédito</p>
        <div className="payment-card-inner">
          {stripePromise ? (
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
                        fontSize: '16px',
                        color: '#333',
                        '::placeholder': { color: '#888' },
                      },
                      invalid: { color: '#f40808' },
                    },
                  }}
                />
              </div>

              {valorSelecionado != null && (
                <StripeCheckoutForm
                  user={user}
                  valorSelecionado={valorSelecionado}
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

