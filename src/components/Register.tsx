import { useState } from 'react'
import { User, Lock, UserPlus, ArrowLeft } from 'lucide-react'

interface RegisterProps {
  category: string;
  onRegister: (nome: string, user: string, pass: string) => void;
  onBack: () => void;
  isLoading: boolean; // Adicionado aqui
}

export function Register({ category, onRegister, onBack, isLoading }: RegisterProps) {
  const [nome, setNome] = useState('')
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')

  return (
    <div className="auth-box">
      <button className="back-btn" onClick={onBack}><ArrowLeft /> VOLTAR</button>
      <h2>Criar Conta - <span className="badge">{category}</span></h2>
      
      <div className="input-group">
        <UserPlus /><input placeholder="Nome Completo" onChange={e => setNome(e.target.value)} />
      </div>
      <div className="input-group">
        <User /><input placeholder="Utilizador" onChange={e => setUser(e.target.value)} />
      </div>
      <div className="input-group">
        <Lock /><input type="password" placeholder="Senha" onChange={e => setPass(e.target.value)} />
      </div>
      
      <button 
        className="btn-auth" 
        onClick={() => onRegister(nome, user, pass)}
        disabled={isLoading}
      >
        {isLoading ? 'A REGISTAR...' : 'REGISTAR'}
      </button>
    </div>
  )
}