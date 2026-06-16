/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_PRINTER_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
