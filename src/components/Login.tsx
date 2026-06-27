import { useState } from 'react'
import { User, Lock, ArrowLeft } from 'lucide-react'
import { EpbjcLogo } from './EpbjcLogo'
import { useCampoComTeclado } from '../contexts/TecladoContext'

const TIPO_LABELS: Record<string, string> = {
  aluno: 'Aluno',
  professor: 'Professor',
  funcionario: 'Funcionário',
  pessoal_predio: 'Outros',
}

interface LoginProps {
  category: string;
  onLogin: (user: string, pass: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function Login({ category, onLogin, onBack, isLoading }: LoginProps) {
  const tipoLabel = TIPO_LABELS[category] ?? category
  const [userName, setUserName] = useState('') // mudado para evitar conflito
  const [password, setPassword] = useState('')
  const tecladoUser = useCampoComTeclado(userName, setUserName, 'texto')
  const tecladoPass = useCampoComTeclado(password, setPassword, 'texto')

  return (
    <div className="auth-box">
      <EpbjcLogo className="school-logo school-logo--auth" />
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ArrowLeft size={20} />
      </button>
      <h2 className="auth-category-title">{tipoLabel}</h2>
      
      <div className="input-group">
        <User />
        <input
          placeholder="Utilizador"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          {...tecladoUser}
        />
      </div>
      
      <div className="input-group">
        <Lock />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          {...tecladoPass}
        />
      </div>
      
      <button 
        className="btn-auth" 
        onClick={() => onLogin(userName, password)}
        disabled={isLoading}
      >
        {isLoading ? 'A CARREGAR...' : 'ENTRAR'}
      </button>
    </div>
  )
}