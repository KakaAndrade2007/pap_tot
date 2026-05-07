import { useState } from 'react'
import { GraduationCap, Apple, Briefcase, Building2, ArrowLeft, LogOut, Utensils, Calendar, User, Lock } from 'lucide-react'
import { supabase } from './services/supabase'
import './App.css'

type Step = 'welcome' | 'category' | 'login' | 'menu'

function App() {
  const [step, setStep] = useState<Step>('welcome')
  const [category, setCategory] = useState<string | null>(null)
  
  // Estados para o formulário de login
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  const [user, setUser] = useState<{ id: string; nome: string; saldo: number } | null>(null);
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const categoriasMap: Record<string, string> = {
      'Aluno': 'aluno',
      'Professor': 'professor',
      'Funcionário': 'funcionario_escola',
      'Pessoal do Prédio': 'pessoal_predio'
    };

    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('identificador', username) // Aqui o 'identificador' funciona como username
        .eq('tipo', categoriasMap[category!] )
        // Nota: No teu SQL não tinhas coluna 'senha', mas podemos simular 
        // ou podes adicionar a coluna 'senha' no Supabase depois.
        .single();

      if (error || !data) {
        alert('Utilizador não encontrado!');
      } else {
        // Se quiseres validar senha, adiciona aqui: if(data.senha === password)
        setUser({ id: data.id, nome: data.nome, saldo: Number(data.saldo) });
        setStep('menu');
      }
    } catch (err) {
      alert('Erro ao conectar.');
    } finally {
      setLoading(false);
    }
  };

  const resetTotem = () => {
    setStep('welcome');
    setCategory(null);
    setUsername('');
    setPassword('');
    setUser(null);
  };

  return (
    <div className="totem-container">
      {/* 1. BOAS-VINDAS */}
      {step === 'welcome' && (
        <div className="screen welcome" onClick={() => setStep('category')}>
          <div className="logo-placeholder">EPBJC</div>
          <h1 className="title">SISTEMA DE REFEIÇÕES</h1>
          <div className="touch-indicator">Toque para iniciar</div>
        </div>
      )}

      {/* 2. SELEÇÃO DE CATEGORIA */}
      {step === 'category' && (
        <div className="screen">
          <h2 className="subtitle">Escolha o seu perfil</h2>
          <div className="grid-buttons">
            <button className="menu-btn" onClick={() => { setCategory('Aluno'); setStep('login'); }}>
              <GraduationCap size={50} /> <span>Aluno</span>
            </button>
            <button className="menu-btn" onClick={() => { setCategory('Professor'); setStep('login'); }}>
              <Apple size={50} /> <span>Professor</span>
            </button>
            <button className="menu-btn" onClick={() => { setCategory('Funcionário'); setStep('login'); }}>
              <Briefcase size={50} /> <span>Funcionário</span>
            </button>
            <button className="menu-btn" onClick={() => { setCategory('Pessoal do Prédio'); setStep('login'); }}>
              <Building2 size={50} /> <span>Pessoal do Prédio</span>
            </button>
          </div>
          <button className="exit-btn" onClick={resetTotem}>VOLTAR</button>
        </div>
      )}

      {/* 3. LOGIN COM USERNAME E SENHA */}
      {step === 'login' && (
        <div className="screen login-screen">
          <button className="back-arrow-top" onClick={() => setStep('category')}><ArrowLeft /></button>
          <h2>Login - {category}</h2>
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <User size={20} />
              <input 
                type="text" 
                placeholder="Nome de utilizador" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <Lock size={20} />
              <input 
                type="password" 
                placeholder="Sua senha" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'A entrar...' : 'ENTRAR'}
            </button>
          </form>
        </div>
      )}

      {/* 4. DASHBOARD (MENU) */}
      {step === 'menu' && user && (
        <div className="screen menu-dash">
          <div className="user-header">
            <div>
               <p className="welcome-text">Bem-vindo,</p>
               <h1>{user.nome}</h1>
            </div>
            <button className="logout-icon" onClick={resetTotem}><LogOut size={30} /></button>
          </div>

          <div className="dashboard-grid">
            <div className="info-card saldo-card">
              <p>Saldo na Conta</p>
              <h2>{user.saldo.toFixed(2)}€</h2>
            </div>
            
            <div className="actions-vertical">
              <button className="action-row-btn" onClick={() => alert('Ver Cardápio...')}>
                <Utensils /> <span>VER CARDÁPIO</span>
              </button>
              <button className="action-row-btn" onClick={() => alert('Histórico...')}>
                <Calendar /> <span>MINHAS RESERVAS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App