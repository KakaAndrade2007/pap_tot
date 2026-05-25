import { useState } from 'react'
import { User, Lock, ArrowLeft } from 'lucide-react'

const TIPO_LABELS: Record<string, string> = {
  aluno: 'Aluno',
  professor: 'Professor',
  funcionario: 'Funcionário',
  pessoal_predio: 'Pessoal Prédio',
}

interface LoginProps {
  category: string;
  onLogin: (user: string, pass: string) => void;
  onBack: () => void;
  onGoToRegister: () => void;
  isLoading: boolean;
}

export function Login({ category, onLogin, onBack, onGoToRegister, isLoading }: LoginProps) {
  const tipoLabel = TIPO_LABELS[category] ?? category
  const [userName, setUserName] = useState('') // mudado para evitar conflito
  const [password, setPassword] = useState('')

  return (
    <div className="auth-box">
      <button className="back-btn" onClick={onBack}><ArrowLeft /> VOLTAR</button>
      <h2 className="auth-category-title">{tipoLabel}</h2>
      
      <div className="input-group">
        <User />
        <input 
          placeholder="Utilizador" 
          value={userName}
          onChange={e => setUserName(e.target.value)} 
        />
      </div>
      
      <div className="input-group">
        <Lock />
        <input 
          type="password" 
          placeholder="Senha" 
          value={password}
          onChange={e => setPassword(e.target.value)} 
        />
      </div>
      
      <button 
        className="btn-auth" 
        onClick={() => onLogin(userName, password)}
        disabled={isLoading}
      >
        {isLoading ? 'A CARREGAR...' : 'ENTRAR'}
      </button>
      
      <p className="btn-toggle" onClick={onGoToRegister}>
        Não tem conta? Registe-se aqui
      </p>
    </div>
  )
}