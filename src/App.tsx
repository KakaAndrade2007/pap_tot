import { useState, useEffect } from 'react'
import { supabase, supabaseConfigured } from './services/supabase'
import { ReservasService } from './services/reservas'
import { NoticiasService } from './services/noticias'
import { EmentasService } from './services/ementas'
import { AuthService } from './services/auth' // Importando o serviço de hash
import { SplashScreen } from './components/SplashScreen'
import { CategorySelector } from './components/CategorySelector'
import { Login } from './components/Login'
import { Register } from './components/Register'
import { Dashboard } from './components/Dashboard'
import './App.css'

type Step = 'splash' | 'category' | 'login' | 'register' | 'home'

export default function App() {
  const [step, setStep] = useState<Step>('splash')
  const [category, setCategory] = useState<string | null>(null)
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null)
  const [reservas, setReservas] = useState<any[]>([])
  const [historico, setHistorico] = useState<any[]>([])
  const [noticias, setNoticias] = useState<any[]>([])
  const [ementas, setEmentas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingNoticias, setLoadingNoticias] = useState(false)
  const [loadingEmentas, setLoadingEmentas] = useState(false)

  // LOGIN SEGURO COM BCRYPT
  async function handleLogin(user: string, pass: string) {
    setLoading(true)
    try {
      // 1. Procuramos o perfil apenas pelo identificador e tipo
      const { data: perfil, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('identificador', user.trim())
        .eq('tipo', category)
        .single()

      if (error || !perfil) {
        alert("Utilizador não encontrado nesta categoria!")
        return
      }

      // 2. Comparamos a senha digitada com o Hash guardado no banco
      const senhaValida = await AuthService.comparePassword(pass, perfil.senha)

      if (senhaValida) {
        setUsuarioLogado({
          id: perfil.id,
          nome: perfil.nome,
          saldo: Number(perfil.saldo),
          tipo: perfil.tipo,
          identificador: perfil.identificador,
          email: perfil.email,
        })
        setStep('home')
      } else {
        alert("Palavra-passe incorreta!")
      }
    } catch (err) {
      alert("Erro ao entrar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  // REGISTO SEGURO COM BCRYPT
  async function handleRegister(nome: string, user: string, pass: string, email: string) {
    setLoading(true);
    try {
      const identificador = user.trim();

      const { data: existente } = await supabase
        .from('perfis')
        .select('id')
        .eq('identificador', identificador)
        .maybeSingle();

      if (existente) {
        alert("Este identificador já está em uso. Escolhe outro.");
        return;
      }

      const hashedPass = await AuthService.hashPassword(pass);

      const { error } = await supabase
        .from('perfis')
        .insert({
          nome,
          identificador,
          senha: hashedPass,
          email: email.trim(),
          tipo: category,
          saldo: 10.00
        });

      if (error) throw error;
      alert("Conta criada com segurança! Já podes fazer login.");
      setStep('login');
    } catch (err: any) {
      alert("Erro no registo: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReserva(data: string, tipoOpcao: string) {
    if (!usuarioLogado || !data) return;
    setLoading(true);
    try {
      const novoSaldo = await ReservasService.criarReserva(
        usuarioLogado.id,
        data,
        usuarioLogado.saldo,
        tipoOpcao
      );

      setUsuarioLogado({ ...usuarioLogado, saldo: novoSaldo });
      alert("Reserva confirmada!");
      carregarReservas();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdicionarSaldo(valor: number) {
    if (!usuarioLogado?.id) return
    setLoading(true)
    try {
      const novoSaldo = Number(usuarioLogado.saldo) + Number(valor)
      const { error } = await supabase
        .from('perfis')
        .update({ saldo: novoSaldo })
        .eq('id', usuarioLogado.id)

      if (error) throw error

      setUsuarioLogado({ ...usuarioLogado, saldo: novoSaldo })
      alert('Saldo carregado com sucesso!')

      supabase.functions
        .invoke('notificar-carregamento', { body: { userId: usuarioLogado.id, valor } })
        .catch((err) => console.error('Notificação de email falhou:', err))

      carregarReservas()
    } catch (err: any) {
      alert('Erro ao carregar saldo: ' + (err?.message || 'desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  async function carregarReservas() {
    if (usuarioLogado?.id) {
      const dados = await ReservasService.buscarMinhasReservas(usuarioLogado.id)
      setReservas(dados)
    }
  }

  async function carregarNoticias() {
    setLoadingNoticias(true)
    try {
      const dados = await NoticiasService.buscarNoticias()
      setNoticias(dados)
    } catch (err: any) {
      alert('Erro ao carregar notícias: ' + (err?.message || 'desconhecido'))
    } finally {
      setLoadingNoticias(false)
    }
  }

  async function carregarEmentas() {
    setLoadingEmentas(true)
    try {
      const dados = await EmentasService.buscarEmentas()
      setEmentas(dados)
    } catch (err: any) {
      alert('Erro ao carregar ementas: ' + (err?.message || 'desconhecido'))
    } finally {
      setLoadingEmentas(false)
    }
  }

  async function carregarHistorico() {
    if (!usuarioLogado?.identificador) return
    try {
      const dados = await ReservasService.buscarHistoricoAlmocos(usuarioLogado.identificador)
      setHistorico(dados)
    } catch {
      // silencioso — não bloqueia o resto da app
    }
  }

  useEffect(() => {
    if (step === 'home' && usuarioLogado?.id) {
      carregarReservas()
      carregarNoticias()
      carregarEmentas()
      carregarHistorico()
    }
  }, [step, usuarioLogado?.id])

  function resetAll() {
    setStep('splash'); setCategory(null); setUsuarioLogado(null); setReservas([]); setHistorico([]); setNoticias([]); setEmentas([]);
  }

  if (!supabaseConfigured) {
    return (
      <div className="totem-container" style={{ alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <h2 style={{ color: '#f40808', textAlign: 'center', margin: 0 }}>Configuração em falta</h2>
        <p style={{ textAlign: 'center', color: '#555', maxWidth: 480, margin: 0 }}>
          Cria um ficheiro <strong>.env</strong> na raiz do projeto com as tuas credenciais do Supabase:
        </p>
        <pre style={{ background: '#f9f9f9', border: '2px solid #eee', borderRadius: 12, padding: '16px 24px', fontSize: 14, color: '#333', margin: 0 }}>
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...`}
        </pre>
        <p style={{ textAlign: 'center', color: '#888', fontSize: 14, margin: 0 }}>
          Encontra estes valores em <strong>Project Settings → API</strong> no painel do Supabase.
        </p>
      </div>
    )
  }

  return (
    <div className="totem-container">
      {step === 'splash' && (
        <SplashScreen onStart={() => setStep('category')} />
      )}

      {step === 'category' && (
        <CategorySelector onSelect={(cat: string) => { setCategory(cat); setStep('login'); }} />
      )}

      {step === 'login' && (
        <Login
          category={category || ''}
          onLogin={handleLogin}
          onBack={() => setStep('category')}
          onGoToRegister={() => setStep('register')}
          isLoading={loading}
        />
      )}

      {step === 'register' && (
        <Register
          category={category || ''}
          onRegister={handleRegister}
          onBack={() => setStep('login')}
          isLoading={loading}
        />
      )}

      {step === 'home' && usuarioLogado && (
        <Dashboard
          user={usuarioLogado}
          reservas={reservas}
          historico={historico}
          noticias={noticias}
          ementas={ementas}
          onLogout={resetAll}
          onNovaReserva={handleReserva}
          onAdicionarSaldo={handleAdicionarSaldo}
          isLoading={loading}
          isLoadingNoticias={loadingNoticias}
          isLoadingEmentas={loadingEmentas}
        />
      )}
    </div>
  )
}