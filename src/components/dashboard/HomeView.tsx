import { useState, useEffect } from 'react'
import { Calendar, Receipt } from 'lucide-react'

interface HomeViewProps {
  onNavigate: (view: 'home' | 'calendario' | 'faturas') => void
}

export function HomeView({ onNavigate }: HomeViewProps) {
  const [currentPrato, setCurrentPrato] = useState(0)

  const ementaSemana = [
    { prato: "Bacalhau à Brás", img: "https://images.unsplash.com/photo-1626509135521-e941198f395b?q=80&w=500", dia: "Segunda" },
    { prato: "Rojões à Minhota", img: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=500", dia: "Terça" },
    { prato: "Massa de Atum", img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=500", dia: "Quarta" }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPrato((prev) => (prev + 1) % ementaSemana.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="dashboard-content">
      {/* 1. Carrossel de Imagens Automático */}
      <div className="carrossel-ementa">
        <img src={ementaSemana[currentPrato].img} alt="Comida" className="img-ementa" />
        <div className="overlay-ementa">
          <span>{ementaSemana[currentPrato].dia}</span>
          <h2>{ementaSemana[currentPrato].prato}</h2>
        </div>
      </div>

      {/* 2. Grid com os dois botões grandes do Totem */}
      <div className="grid-acoes-totem">
        <button className="btn-grande-red" onClick={() => onNavigate('calendario')}>
          <Calendar size={40} />
          RESERVAR ALMOÇO
        </button>
        <button className="btn-grande-white" onClick={() => onNavigate('faturas')}>
          <Receipt size={40} />
          MINHAS FATURAS
        </button>
      </div>
    </div>
  )
}