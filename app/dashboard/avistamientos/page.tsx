import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AvistamientosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: pets } = await supabase
    .from('pets')
    .select('id, name, species, breed, photo_url')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const petIds = (pets || []).map((pet) => pet.id)

  let sightings: Array<{
    id: string
    latitude: number | null
    longitude: number | null
    reporter_name: string | null
    reporter_phone: string | null
    reporter_email: string | null
    comment: string | null
    location_consent: boolean
    created_at: string
    lost_case_id: string
  }> = []

  if (petIds.length > 0) {
    const { data: lostCases } = await supabase
      .from('lost_cases')
      .select('id, pet_id')
      .in('pet_id', petIds)

    const lostCaseIds = (lostCases || []).map((item) => item.id)

    if (lostCaseIds.length > 0) {
      const { data } = await supabase
        .from('sightings')
        .select('id, latitude, longitude, reporter_name, reporter_phone, reporter_email, comment, location_consent, created_at, lost_case_id')
        .in('lost_case_id', lostCaseIds)
        .order('created_at', { ascending: false })

      sightings = data || []
    }
  }

  const petById = new Map((pets || []).map((pet) => [pet.id, pet]))
  const lostCasePetMap = new Map<string, string>()

  if (petIds.length > 0) {
    const { data: lostCases } = await supabase
      .from('lost_cases')
      .select('id, pet_id')
      .in('pet_id', petIds)

    for (const lostCase of lostCases || []) {
      lostCasePetMap.set(lostCase.id, lostCase.pet_id)
    }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="auth-logo">🐾 Paw<span>Link</span></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a className="btn secondary" href="/dashboard">Mi panel</a>
          <a className="btn secondary" href="/">Inicio</a>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <p className="eyebrow">SEGURIDAD PAWLINK</p>
          <h1>Avistamientos 📍</h1>
          <p>Aquí aparecerán los reportes que otras personas envíen cuando encuentren a una de tus mascotas.</p>
        </div>

        {sightings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📍</div>
            <h3>Aún no hay avistamientos</h3>
            <p>Cuando alguien reporte haber visto a tu mascota, el aviso aparecerá aquí.</p>
          </div>
        ) : (
          <section className="pets-section">
            <h2>{sightings.length} {sightings.length === 1 ? 'avistamiento' : 'avistamientos'}</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              {sightings.map((sighting) => {
                const petId = lostCasePetMap.get(sighting.lost_case_id)
                const pet = petId ? petById.get(petId) : null
                const hasLocation = sighting.location_consent && sighting.latitude !== null && sighting.longitude !== null

                return (
                  <article key={sighting.id} className="pet-card" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      {pet?.photo_url ? (
                        <img src={pet.photo_url} alt={pet.name} style={{ width: 74, height: 74, objectFit: 'cover', borderRadius: 18 }} />
                      ) : (
                        <div className="pet-placeholder" style={{ width: 74, height: 74, borderRadius: 18 }}>🐶</div>
                      )}
                      <div>
                        <h3 style={{ marginBottom: 4 }}>{pet?.name || 'Mascota'}</h3>
                        <p style={{ margin: 0 }}>{new Date(sighting.created_at).toLocaleString('es-MX')}</p>
                      </div>
                    </div>

                    <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
                      {sighting.comment && <p><strong>Observación:</strong> {sighting.comment}</p>}
                      {sighting.reporter_name && <p><strong>Reportó:</strong> {sighting.reporter_name}</p>}
                      {sighting.reporter_phone && <p><strong>Teléfono:</strong> {sighting.reporter_phone}</p>}
                      {sighting.reporter_email && <p><strong>Correo:</strong> {sighting.reporter_email}</p>}
                      {hasLocation ? (
                        <a
                          className="btn primary"
                          href={`https://www.google.com/maps?q=${sighting.latitude},${sighting.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ textAlign: 'center', marginTop: 6 }}
                        >
                          📍 Ver ubicación en mapa
                        </a>
                      ) : (
                        <p style={{ margin: 0 }}>📍 El reportante no compartió su ubicación.</p>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </section>
    </main>
  )
}
