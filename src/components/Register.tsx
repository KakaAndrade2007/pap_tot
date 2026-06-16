import { useState } from 'react'
import { User, Lock, UserPlus, ArrowLeft } from 'lucide-react'
import { EpbjcLogo } from './EpbjcLogo'
import { useCampoComTeclado } from '../contexts/TecladoContext'

interface RegisterProps {
  category: string;
  onRegister: (nome: string, user: string, pass: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function Register({ category, onRegister, onBack, isLoading }: RegisterProps) {
  const [nome, setNome] = useState('')
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const tecladoNome = useCampoComTeclado(nome, setNome, 'texto')
  const tecladoUser = useCampoComTeclado(user, setUser, 'texto')
  const tecladoPass = useCampoComTeclado(pass, setPass, 'texto')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onRegister(nome, user, pass)
  }

  return (
    <div className="auth-box">
      <EpbjcLogo className="school-logo school-logo--auth" />
      <button type="button" className="back-btn" onClick={onBack} aria-label="Voltar">
        <ArrowLeft size={20} />
      </button>

      <h2>Criar Conta</h2>
      <p className="badge">{category.toUpperCase()}</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group">
          <UserPlus size={20} />
          <input
            type="text"
            placeholder="Nome Completo"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
            {...tecladoNome}
          />
        </div>

        <div className="input-group">
          <User size={20} />
          <input
            type="text"
            placeholder="Nome de Utilizador"
            value={user}
            onChange={e => setUser(e.target.value)}
            required
            {...tecladoUser}
          />
        </div>

        <div className="input-group">
          <Lock size={20} />
          <input
            type="password"
            placeholder="Palavra-passe"
            value={pass}
            onChange={e => setPass(e.target.value)}
            required
            {...tecladoPass}
          />
        </div>

        <button
          type="submit"
          className="btn-auth"
          disabled={isLoading}
        >
          {isLoading ? 'A REGISTAR...' : 'CRIAR CONTA'}
        </button>
      </form>

      <p className="footer-text">
        Ao registar-se, concorda com os termos de uso do refeitório EPBJC.
      </p>
    </div>
  )
}
