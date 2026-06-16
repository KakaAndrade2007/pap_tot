import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TecladoProvider } from './contexts/TecladoContext'
import { TecladoVirtual } from './components/TecladoVirtual'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TecladoProvider>
      <App />
      <TecladoVirtual />
    </TecladoProvider>
  </StrictMode>,
)
