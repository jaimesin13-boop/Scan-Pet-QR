'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim(), phone: phone.trim() },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setMessage('Cuenta creada. Revisa tu correo para confirmar tu cuenta y después inicia sesión.')
    }

    setLoading(false)
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <a className="back-link" href="/">← PawLink</a>
        <div className="auth-logo">🐾 Paw<span>Link</span></div>
        <h1>Crea tu cuenta</h1>
        <p className="auth-subtitle">Empieza a proteger a tus mascotas.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Nombre completo<input value={name} onChange={e => setName(e.target.value)} required /></label>
          <label>Correo electrónico<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
          <label>Teléfono<input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10 dígitos" /></label>
          <label>Contraseña<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required /></label>
          <button className="btn primary auth-submit" disabled={loading}>{loading ? 'Creando cuenta…' : 'Crear mi cuenta'}</button>
        </form>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <p className="auth-footer">¿Ya tienes cuenta? <a href="/auth/login">Inicia sesión</a></p>
      </section>
    </main>
  )
}
