import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AlertasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: sightings, error } = await supabase.rpc('get_my_pet_sightings')
  const alerts = sightings || []

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="auth-logo">🐾 Paw<span>Link</span></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a className="btn secondary" href="/dashboard">Mi panel</a>
          <a className="btn secondary" href="/dashboard/avistamientos">Avistamientos</a>
          <a className="btn secondary" href="/">Inicio</a>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <p className="eyebrow">SEGURIDAD PAWLINK</p>
          <h1>Centro de alertas 🔔</h1>
          <p>Revisa rápidamente los reportes relacionados con tus mascotas.</p>
        </div>

        {error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3>No pudimos cargar las alertas</h3>
            <p>El sistema de avistamientos funciona, pero el centro de alertas necesita terminar su configuración.</p>
            <a className="btn primary" href="/dashboard/avistamientos">Ver avistamientos</a>
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No tienes alertas</h3>
            <p>Cuando alguien reporte un avistamiento, aparecerá aquí.</p>
          </div>
        ) : (
          <section className="pets-section">
            <h2>{alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              {alerts.map((alert: any) => {
                const hasLocation = alert.location_consent === true && alert.latitude !== null && alert.longitude !== null
                return (
                  <article key={alert.id} className="pet-card" style={{ display: 'block', border: '2px solid #eee8ff' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      {alert.photo_url ? (
                        <img src={alert.photo_url} alt={alert.pet_name || 'Mascota'} style={{ width: 76, height: 76, objectFit: 'cover', borderRadius: 20 }} />
                      ) : (
                        <div className="pet-placeholder" style={{ width: 76, height: 76, borderRadius: 20 }}>🐶</div>
                      )}
                      <div>
                        <h3 style={{ margin: 0 }}>📍 Avistamiento de {alert.pet_name || 'Mascota'}</h3>
                        <p style={{ margin: '6px 0 0' }}>{alert.species || ''}{alert.breed ? ` · ${alert.breed}` : ''}</p>
                        <p style={{ margin: '6px 0 0', fontSize: 14 }}>{new Date(alert.created_at).toLocaleString('es-MX')}</p>
                      </div>
                    </div>
                    <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
                      {alert.comment && <p><strong>Observación:</strong> {alert.comment}</p>}
                      {alert.reporter_name && <p><strong>Reportó:</strong> {alert.reporter_name}</p>}
                      {alert.reporter_phone && <p><strong>Teléfono:</strong> {alert.reporter_phone}</p>}
                      {alert.reporter_email && <p><strong>Correo:</strong> {alert.reporter_email}</p>}
                      {hasLocation ? (
                        <a className="btn primary" href={`/dashboard/avistamientos#${alert.id}`} style={{ textAlign: 'center', marginTop: 6 }}>
                          📍 Ver detalle del avistamiento
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
