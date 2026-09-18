import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QRCodeCard from './QRCodeCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('name, email, phone').eq('id', user.id).maybeSingle()
  const { data: pets } = await supabase.from('pets').select('id, name, species, breed, color, photo_url, status').eq('owner_id', user.id).order('created_at', { ascending: false })
  const { data: petTags } = await supabase.rpc('get_my_pet_tags')
  const { data: subscriptionData } = await supabase.rpc('get_my_subscription').maybeSingle()
  const subscription = subscriptionData as { status?: string } | null
  const isPlus = subscription?.status === 'active'

  const tagByPet = new Map<string, string>()
  for (const link of petTags || []) {
    if (link.pet_id && link.public_code) tagByPet.set(link.pet_id, link.public_code)
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="auth-logo">🐾 Paw<span>Link</span></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a className="btn secondary" href="/dashboard/activar">🔖 Activar medallón</a>
          <a className="btn secondary" href="/dashboard/alertas">🔔 Alertas</a>
          <a className="btn secondary" href="/dashboard/avistamientos">📍 Avistamientos</a>
          <a className="btn secondary" href="/">Inicio</a>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <p className="eyebrow">MI PAWLINK</p>
          <h1>Hola, {profile?.name || user.user_metadata?.name || 'bienvenido'} 👋</h1>
          <p>Administra tus mascotas y mantén su información protegida.</p>
        </div>

        <section style={{ margin: '0 0 40px', padding: 24, borderRadius: 20, background: isPlus ? '#edf9f0' : '#f7f4ff', border: '1px solid #e4e0ef' }}>
          <p className="eyebrow" style={{ margin: '0 0 8px' }}>PLAN DE PROTECCIÓN</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: 28 }}>{isPlus ? 'PawLink Plus ✨' : 'PawLink Free 🐾'}</h2>
              <p style={{ margin: 0, fontSize: 16 }}>
                {isPlus ? 'Tienes activadas las funciones avanzadas de PawLink.' : 'Tu mascota está protegida con las funciones esenciales de PawLink.'}
              </p>
            </div>
            {!isPlus && <a className="btn primary" href="/dashboard/plus">Conocer PawLink Plus</a>}
          </div>
          {!isPlus && <p style={{ margin: '14px 0 0', fontSize: 14 }}>Plus: $30 MXN/mes o $299 MXN/año. Las funciones esenciales no se bloquean si no tienes Plus.</p>}
        </section>

        <div className="dashboard-actions">
          <a className="btn primary" href="/dashboard/pets/new">+ Registrar mascota</a>
          <a className="btn danger" href="/dashboard/perdida">🚨 Modo Perdido</a>
        </div>

        <section className="pets-section">
          <h2>Mis mascotas</h2>
          {pets && pets.length > 0 ? (
            <div className="pet-grid">
              {pets.map(pet => {
                const code = tagByPet.get(pet.id)
                return (
                  <article className="pet-card" key={pet.id} style={{ display: 'block' }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      {pet.photo_url ? <img src={pet.photo_url} alt={pet.name} /> : <div className="pet-placeholder">🐶</div>}
                      <div>
                        <h3>{pet.name}</h3>
                        <p>{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                        <span className="status-pill">{pet.status === 'lost' ? 'En modo perdido' : 'Protegida'}</span>
                      </div>
                    </div>
                    {code ? <QRCodeCard code={code} petName={pet.name} /> : <p style={{ marginTop: 16 }}>🔖 Aún no hay un medallón vinculado a esta mascota.</p>}
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🐾</div>
              <h3>Aún no has registrado una mascota</h3>
              <p>Registra a tu primera mascota para comenzar a protegerla con PawLink.</p>
              <a className="btn primary" href="/dashboard/pets/new">Registrar mi primera mascota</a>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
