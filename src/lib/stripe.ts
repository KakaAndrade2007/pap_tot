import { loadStripe } from '@stripe/stripe-js'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

export const stripePromise =
  publishableKey && publishableKey.startsWith('pk_') ? loadStripe(publishableKey) : null
