import { useState } from 'react'
import { GraduationCap, Apple, Briefcase, Building2, ArrowLeft, Delete } from 'lucide-react'
import './App.css'

type Step = 'welcome' | 'category' | 'identification' | 'menu'

function App() {
  const [step, setStep] = useState<Step>('welcome')
  const [category, setCategory] = useState<string | null>(null)
  const [pin, setPin] = useState<string>('')

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) setPin(prev => prev + num)
  }

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1))
  }

  const resetTotem = () => {
    setStep('welcome')
    setCategory(null)
    setPin('')
  }

  return (
    <div className="totem-container">
      {step === 'welcome' && (
        <div className="screen welcome" onClick={() => setStep('category')}>
          <div className="logo-placeholder">EPBJC</div>
          <h1 className="title">SISTEMA DE REFEIÇÕES</h1>
          <div className="touch-indicator">Toque para iniciar</div>
        </div>
      )}

      {step === 'category' && (
        <div className="screen">
          <h2 className="subtitle">Selecione a sua categoria</h2>
          <div className="grid-buttons">
            <button className="menu-btn" onClick={() => { setCategory('Aluno'); setStep('identification'); }}>
              <GraduationCap size={50} />
              <span>Aluno</span>
            </button>
            <button className="menu-btn" onClick={() => { setCategory('Professor'); setStep('identification'); }}>
              <Apple size={50} />
              <span>Professor</span>
            </button>
            <button className="menu-btn" onClick={() => { setCategory('Funcionário'); setStep('identification'); }}>
              <Briefcase size={50} />
              <span>Funcionário</span>
            </button>
            <button className="menu-btn" onClick={() => { setCategory('Pessoal do Prédio'); setStep('identification'); }}>
              <Building2 size={50} />
              <span>Pessoal do Prédio</span>
            </button>
          </div>
          <button className="exit-btn" onClick={resetTotem}>SAIR</button>
        </div>
      )}

      {step === 'identification' && (
        <div className="screen">
          <div className="id-header">
             <button className="back-arrow" onClick={() => { setStep('category'); setPin(''); }}>
                <ArrowLeft size={32} />
             </button>
             <h2>{category}</h2>
          </div>
          
          <div className="pin-display">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`pin-dot ${pin.length > i ? 'filled' : ''}`}></div>
            ))}
          </div>

          <div className="numpad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0'].map((num, i) => (
              num === '' ? <div key={i}></div> : 
              <button key={i} className="num-btn" onClick={() => handleNumberClick(num)}>{num}</button>
            ))}
            <button className="num-btn delete" onClick={handleDelete}><Delete size={32} /></button>
          </div>

          {pin.length === 4 && (
            <button className="confirm-btn" onClick={() => alert('Validando PIN no Supabase...')}>CONFIRMAR</button>
          )}
        </div>
      )}
    </div>
  )
}

export default App