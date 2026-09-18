'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ActivatePage() {
  const router = useRouter()
  const supabase = createClient()
  const [pets, setPets] = useState<any[]>([])
  const [petId, setPetId] = useState('')
  const [medallionCode, setMedallionCode] = useState('')
  const [activationCode, setActivationCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('pets').select('id,name,species,breed').eq('owner_id', user.id).order('created_at', { ascending: false })
      setPets(data || [])
    }
    load()
  }, [router, supabase])

  async function activate() {
    setMessage('')
    setError('')

    const cleanMedallionCode = medallionCode.trim().toUpperCase()
    const cleanActivationCode = activationCode.trim()

    if (!petId || !cleanMedallionCode || !cleanActivationCode) {
      setError('Selecciona una mascota e ingresa el código del medallón y el código de activación.')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.rpc('activate_medallion', {
      p_public_code: cleanMedallionCode,
      p_activation_code: cleanActivationCode,
      p_pet_id: petId,
    })

    setLoading(false)

    if (error) { setError(error.message); return }
    if (!data?.success) { setError(data?.message || 'No fue posible activar el medallón.'); return }

    setMessage('¡Medallón activado correctamente!')
    setTimeout(() => router.push('/dashboard'), 900)
  }

  return (
    <main className="auth-page">
      <section className="auth-card wide">
        <a className="back-link" href="/dashboard">← Volver a mi panel</a>
        <div className="auth-logo">🐾 Paw<span>Link</span></div>
        <p className="eyebrow">ACTIVACIÓN PAWLINK</p>
        <h1>Activa tu medallón</h1>
        <p className="auth-subtitle">Vincula el código único de tu medallón con una mascota.</p>
        <div className="auth-form">
          <label>Mascota<select value={petId} onChange={e => setPetId(e.target.value)}><option value="">Seleccionar mascota</option>{pets.map(p => <option key={p.id} value={p.id}>{p.name} · {p.species}{p.breed ? ` · ${p.breed}` : ''}</option>)}</select></label>
          <label>Código del medallón<input value={medallionCode} onChange={e => setMedallionCode(e.target.value)} placeholder="Ej. PL-22E0A4ED" autoCapitalize="characters" /></label>
          <label>Código de activación<input value={activationCode} onChange={e => setActivationCode(e.target.value)} placeholder="Ingresa el código de tu medallón" autoComplete="off" /></label>
          <div className="alert"><strong>Protección Digital</strong><br />PawLink Free protege las funciones esenciales. PawLink Plus será opcional: $30 MXN al mes o $299 MXN al año.</div>
          <button className="btn primary auth-submit" onClick={activate} disabled={loading}>
            {loading ? 'Activando...' : 'Activar medallón'}
          </button>
        </div>
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}
      </section>
    </main>
  )
}
