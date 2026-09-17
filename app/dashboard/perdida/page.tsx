'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Pet {
  id: string
  name: string
  species: string | null
  breed: string | null
  photo_url: string | null
  status: string | null
}

interface LostCase {
  id: string
  pet_id: string
  status: 'open' | 'closed'
  last_seen_lat: number | null
  last_seen_lng: number | null
  last_seen_at: string | null
  description: string | null
  photo_url: string | null
  created_at: string
  closed_at: string | null
}

export default function PerdidaPage() {
  const supabase = createClient()
  const [pets, setPets] = useState<Pet[]>([])
  const [lostCases, setLostCases] = useState<LostCase[]>([])
  const [selectedPetId, setSelectedPetId] = useState('')
  const [lastSeenAt, setLastSeenAt] = useState('')
  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    const [{ data: petData, error: petError }, { data: caseData, error: caseError }] = await Promise.all([
      supabase
        .from('pets')
        .select('id, name, species, breed, photo_url, status')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('lost_cases')
        .select('id, pet_id, status, last_seen_lat, last_seen_lng, last_seen_at, description, photo_url, created_at, closed_at')
        .order('created_at', { ascending: false }),
    ])

    if (petError) setError(petError.message)
    if (caseError) setError(caseError.message)

    setPets(petData || [])
    setLostCases(caseData || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  function resetForm() {
    setSelectedPetId('')
    setLastSeenAt('')
    setDescription('')
    setLatitude('')
    setLongitude('')
    setMessage('')
    setError('')
  }

  async function activateLostMode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    if (!selectedPetId) {
      setError('Selecciona una mascota.')
      setSaving(false)
      return
    }

    const existingOpenCase = lostCases.find(
      (item) => item.pet_id === selectedPetId && item.status === 'open'
    )

    if (existingOpenCase) {
      setError('Esta mascota ya está en Modo Perdido.')
      setSaving(false)
      return
    }

    const { error: insertError } = await supabase.from('lost_cases').insert({
      pet_id: selectedPetId,
      status: 'open',
      last_seen_lat: latitude.trim() ? Number(latitude) : null,
      last_seen_lng: longitude.trim() ? Number(longitude) : null,
      last_seen_at: lastSeenAt ? new Date(lastSeenAt).toISOString() : null,
      description: description.trim() || null,
      photo_url: pets.find((pet) => pet.id === selectedPetId)?.photo_url || null,
    })

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    const { error: petError } = await supabase
      .from('pets')
      .update({ status: 'lost' })
      .eq('id', selectedPetId)

    if (petError) {
      setError(`El reporte se creó, pero no se pudo actualizar el estado de la mascota: ${petError.message}`)
      await loadData()
      setSaving(false)
      return
    }

    setMessage('🚨 Modo Perdido activado. Tu mascota ahora aparece como perdida.')
    resetForm()
    await loadData()
    setSaving(false)
  }

  async function closeLostCase(lostCase: LostCase) {
    setSaving(true)
    setMessage('')
    setError('')

    const { error: caseError } = await supabase
      .from('lost_cases')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', lostCase.id)
      .eq('pet_id', lostCase.pet_id)

    if (caseError) {
      setError(caseError.message)
      setSaving(false)
      return
    }

    const { error: petError } = await supabase
      .from('pets')
      .update({ status: 'active' })
      .eq('id', lostCase.pet_id)

    if (petError) {
      setError(`El reporte se cerró, pero no se pudo actualizar el estado de la mascota: ${petError.message}`)
    } else {
      setMessage('✅ Reporte cerrado. La mascota volvió a estado protegida.')
    }

    await loadData()
    setSaving(false)
  }

  const openCases = lostCases.filter((item) => item.status === 'open')
  const petById = new Map(pets.map((pet) => [pet.id, pet]))
  const availablePets = pets.filter((pet) => !openCases.some((item) => item.pet_id === pet.id))

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="auth-logo">🐾 Paw<span>Link</span></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a className="btn secondary" href="/dashboard">Mi panel</a>
          <a className="btn secondary" href="/dashboard/avistamientos">📍 Avistamientos</a>
          <a className="btn secondary" href="/">Inicio</a>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <p className="eyebrow">SEGURIDAD PAWLINK</p>
          <h1>Modo Perdido 🚨</h1>
          <p>Activa una alerta para que los escaneos y reportes ayuden a localizar a tu mascota.</p>
        </div>

        {message && <div className="empty-state" style={{ marginBottom: 20 }}>{message}</div>}
        {error && <div className="empty-state" style={{ marginBottom: 20 }}>{error}</div>}

        {loading ? (
          <div className="empty-state"><h3>Cargando tus mascotas...</h3></div>
        ) : (
          <>
            {openCases.length > 0 && (
              <section className="pets-section" style={{ marginBottom: 28 }}>
                <h2>🚨 Mascotas en Modo Perdido</h2>
                <div style={{ display: 'grid', gap: 16 }}>
                  {openCases.map((lostCase) => {
                    const pet = petById.get(lostCase.pet_id)
                    if (!pet) return null
                    const hasLocation = lostCase.last_seen_lat !== null && lostCase.last_seen_lng !== null

                    return (
                      <article className="pet-card" key={lostCase.id} style={{ display: 'block' }}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                          {pet.photo_url ? (
                            <img src={pet.photo_url} alt={pet.name} style={{ width: 78, height: 78, objectFit: 'cover', borderRadius: 18 }} />
                          ) : (
                            <div className="pet-placeholder" style={{ width: 78, height: 78, borderRadius: 18 }}>🐶</div>
                          )}
                          <div>
                            <h3 style={{ marginBottom: 4 }}>{pet.name}</h3>
                            <p style={{ margin: 0 }}>{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                            <span className="status-pill">EN MODO PERDIDO</span>
                          </div>
                        </div>

                        <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
                          {lostCase.description && <p><strong>Descripción:</strong> {lostCase.description}</p>}
                          {lostCase.last_seen_at && <p><strong>Última vez vista:</strong> {new Date(lostCase.last_seen_at).toLocaleString('es-MX')}</p>}
                          {hasLocation && (
                            <a
                              className="btn secondary"
                              href={`https://www.google.com/maps?q=${lostCase.last_seen_lat},${lostCase.last_seen_lng}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ textAlign: 'center' }}
                            >
                              📍 Ver última ubicación
                            </a>
                          )}
                          <button
                            className="btn primary"
                            type="button"
                            onClick={() => closeLostCase(lostCase)}
                            disabled={saving}
                          >
                            ✅ Mi mascota ya apareció
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            )}

            {availablePets.length > 0 ? (
              <section className="pets-section">
                <h2>Activar Modo Perdido</h2>
                <form onSubmit={activateLostMode} className="pet-card" style={{ display: 'grid', gap: 14 }}>
                  <label>
                    <strong>Mascota</strong>
                    <select value={selectedPetId} onChange={(event) => setSelectedPetId(event.target.value)} required style={{ width: '100%', marginTop: 6, padding: 12 }}>
                      <option value="">Selecciona una mascota</option>
                      {availablePets.map((pet) => (
                        <option key={pet.id} value={pet.id}>{pet.name}{pet.breed ? ` · ${pet.breed}` : ''}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <strong>¿Cuándo fue vista por última vez?</strong>
                    <input type="datetime-local" value={lastSeenAt} onChange={(event) => setLastSeenAt(event.target.value)} style={{ width: '100%', marginTop: 6, padding: 12 }} />
                  </label>

                  <label>
                    <strong>Descripción de la pérdida</strong>
                    <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ej. Se perdió cerca de..., llevaba..., responde a..." rows={4} style={{ width: '100%', marginTop: 6, padding: 12 }} />
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label>
                      <strong>Latitud</strong>
                      <input inputMode="decimal" value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="Opcional" style={{ width: '100%', marginTop: 6, padding: 12 }} />
                    </label>
                    <label>
                      <strong>Longitud</strong>
                      <input inputMode="decimal" value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="Opcional" style={{ width: '100%', marginTop: 6, padding: 12 }} />
                    </label>
                  </div>

                  <p style={{ margin: 0 }}>💡 La ubicación es opcional. Puedes agregarla desde Google Maps si conoces el punto donde viste a tu mascota por última vez.</p>

                  <button className="btn danger" type="submit" disabled={saving}>
                    {saving ? 'Activando...' : '🚨 Activar Modo Perdido'}
                  </button>
                </form>
              </section>
            ) : openCases.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🐾</div>
                <h3>No tienes mascotas disponibles</h3>
                <p>Registra una mascota desde tu panel para poder activar Modo Perdido.</p>
                <a className="btn primary" href="/dashboard/pets/new">Registrar mascota</a>
              </div>
            ) : null}
          </>
        )}
      </section>
    </main>
  )
}
