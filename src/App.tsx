import { useState, useEffect } from 'react'
import { supabase } from './services/supabase'
import { EmailService } from './services/email'
import { ReservasService } from './services/reservas'
import { AuthService } from './services/auth' // Importando o serviço de hash
import { CategorySelector } from './components/CategorySelector'
import { Login } from './components/Login'
import { Register } from './components/Register'
import { Dashboard } from './components/Dashboard'
import './App.css'

type Step = 'category' | 'login' | 'register' | 'home'

export default function App() {
  const [step, setStep] = useState<Step>('category')
  const [category, setCategory] = useState<string | null>(null)
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null)
  const [reservas, setReservas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // LOGIN SEGURO COM BCRYPT
  async function handleLogin(user: string, pass: string) {
    setLoading(true)
    try {
      // 1. Procuramos o perfil apenas pelo identificador e tipo
      const { data: perfil, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('identificador', user.toLowerCase().trim())
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
          email: perfil.email // Importante para o EmailService funcionar depois
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
      // ENCRIPTAR A SENHA ANTES DE SALVAR
      const hashedPass = await AuthService.hashPassword(pass);

      const { error } = await supabase
        .from('perfis')
        .insert([{
          nome,
          identificador: user.toLowerCase().trim(),
          senha: hashedPass, // Salvando o Hash seguro
          tipo: category,
          email: email,
          saldo: 10.00
        }]);

      if (error) throw error;
      alert("Conta criada com segurança! Já podes fazer login.");
      setStep('login');
    } catch (err: any) {
      alert("Erro no registo: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReserva(data: string) {
    if (!usuarioLogado || !data) return;
    setLoading(true);
    try {
      const novoSaldo = await ReservasService.criarReserva(
        usuarioLogado.id,
        data,
        usuarioLogado.saldo
      );

      setUsuarioLogado({ ...usuarioLogado, saldo: novoSaldo });
      alert("Reserva confirmada! A enviar fatura...");

      // Envio de email com os dados do utilizador logado
      EmailService.enviarFatura(
        usuarioLogado.nome,
        usuarioLogado.email,
        data
      ).catch(err => console.error("Email falhou:", err));

      carregarReservas();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function carregarReservas() {
    if (usuarioLogado?.id) {
      const dados = await ReservasService.buscarMinhasReservas(usuarioLogado.id)
      setReservas(dados)
    }
  }

  useEffect(() => {
    if (step === 'home') carregarReservas()
  }, [step])

  function resetAll() {
    setStep('category'); setCategory(null); setUsuarioLogado(null); setReservas([]);
  }

  return (
    <div className="totem-container">
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
          onLogout={resetAll}
          onNovaReserva={handleReserva}
          isLoading={loading}
        />
      )}
    </div>
  )
}