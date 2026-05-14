import { useState, useEffect } from 'react'
import { supabase } from './services/supabase'
import { ReservasService } from './services/reservas'
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

  async function handleLogin(user: string, pass: string) {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('identificador', user.toLowerCase().trim())
        .eq('senha', pass)
        .eq('tipo', category)
        .single()

      if (error || !data) {
        alert("Credenciais erradas!")
      } else {
        setUsuarioLogado({ id: data.id, nome: data.nome, saldo: Number(data.saldo), tipo: data.tipo })
        setStep('home')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(nome: string, user: string, pass: string) {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('perfis')
        .insert([{ nome, identificador: user.toLowerCase().trim(), senha: pass, tipo: category, saldo: 10.00 }])

      if (error) throw error
      alert("Conta criada! Faça login.")
      setStep('login')
    } catch (err: any) {
      alert("Erro: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleReserva(data: string) {
    if (!usuarioLogado || !data) return
    setLoading(true)
    try {
      const novoSaldo = await ReservasService.criarReserva(usuarioLogado.id, data, usuarioLogado.saldo)
      setUsuarioLogado({ ...usuarioLogado, saldo: novoSaldo })
      alert("Almoço reservado!")
      carregarReservas()
    } catch (err: any) {
      alert(err.message)
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
          isLoading={loading} // Passando o estado
        />
      )}

      {step === 'register' && (
        <Register 
          category={category || ''} 
          onRegister={handleRegister} 
          onBack={() => setStep('login')}
          isLoading={loading} // Passando o estado
        />
      )}

      {step === 'home' && usuarioLogado && (
        <Dashboard 
          user={usuarioLogado} 
          reservas={reservas} 
          onLogout={resetAll} 
          onNovaReserva={handleReserva}
          isLoading={loading} // Passando o estado
        />
      )}
    </div>
  )
}