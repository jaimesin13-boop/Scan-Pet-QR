'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewPetPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ name: '', species: 'Perro', breed: '', sex: '', color: '', distinguishing_features: '', medical_notes_private: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string) {
    setForm(current => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { error } = await supabase.from('pets').insert({
      owner_id: user.id,
      name: form.name.trim(),
      species: form.species,
      breed: form.breed.trim() || null,
      sex: form.sex || null,
      color: form.color.trim() || null,
      distinguishing_features: form.distinguishing_features.trim() || null,
      medical_notes_private: form.medical_notes_private.trim() || null,
      status: 'active',
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
      <section className="auth-card wide">
        <a className="back-link" href="/dashboard">← Volver a mis mascotas</a>
        <div className="auth-logo">🐾 Paw<span>Link</span></div>
        <h1>Registra a tu mascota</h1>
        <p className="auth-subtitle">Estos datos serán la base de su identidad digital.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Nombre de la mascota<input value={form.name} onChange={e => update('name', e.target.value)} required /></label>
          <label>Especie<select value={form.species} onChange={e => update('species', e.target.value)}><option>Perro</option><option>Gato</option><option>Otro</option></select></label>
          <label>Raza<input value={form.breed} onChange={e => update('breed', e.target.value)} placeholder="Ej. Labrador" /></label>
          <label>Sexo<select value={form.sex} onChange={e => update('sex', e.target.value)}><option value="">Seleccionar</option><option value="Macho">Macho</option><option value="Hembra">Hembra</option></select></label>
          <label>Color<input value={form.color} onChange={e => update('color', e.target.value)} placeholder="Ej. Café con blanco" /></label>
          <label>Características para identificarla<textarea value={form.distinguishing_features} onChange={e => update('distinguishing_features', e.target.value)} placeholder="Manchas, collar, cicatrices, etc." rows={3} /></label>
          <label>Información médica privada<textarea value={form.medical_notes_private} onChange={e => update('medical_notes_private', e.target.value)} placeholder="Alergias, medicamentos o cuidados especiales" rows={3} /></label>
          <button className="btn primary auth-submit" disabled={loading}>{loading ? 'Guardando…' : 'Guardar mascota'}</button>
        </form>

        {error && <div className="alert error">{error}</div>}
      </section>
    </main>
  )
}
