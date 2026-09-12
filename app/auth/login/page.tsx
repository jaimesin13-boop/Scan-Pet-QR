'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <a className="back-link" href="/">← PawLink</a>
        <div className="auth-logo">🐾 Paw<span>Link</span></div>
        <h1>Bienvenido de nuevo</h1>
        <p className="auth-subtitle">Entra para administrar la protección de tus mascotas.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Correo electrónico<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
          <label>Contraseña<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
          <button className="btn primary auth-submit" disabled={loading}>{loading ? 'Entrando…' : 'Iniciar sesión'}</button>
        </form>

        {error && <div className="alert error">{error}</div>}
        <p className="auth-footer">¿Aún no tienes cuenta? <a href="/auth/register">Crea una cuenta</a></p>
      </section>
    </main>
  )
}
