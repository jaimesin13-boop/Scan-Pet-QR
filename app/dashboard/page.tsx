import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, phone')
    .eq('id', user.id)
    .maybeSingle()

  const { data: pets } = await supabase
    .from('pets')
    .select('id, name, species, breed, color, photo_url, status')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="auth-logo">🐾 Paw<span>Link</span></div>
        <a className="btn secondary" href="/">Inicio</a>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <p className="eyebrow">MI PAWLINK</p>
          <h1>Hola, {profile?.name || user.user_metadata?.name || 'bienvenido'} 👋</h1>
          <p>Administra tus mascotas y mantén su información protegida.</p>
        </div>

        <div className="dashboard-actions">
          <a className="btn primary" href="/dashboard/pets/new">+ Registrar mascota</a>
        </div>

        <section className="pets-section">
          <h2>Mis mascotas</h2>
          {pets && pets.length > 0 ? (
            <div className="pet-grid">
              {pets.map(pet => (
                <article className="pet-card" key={pet.id}>
                  {pet.photo_url ? <img src={pet.photo_url} alt={pet.name} /> : <div className="pet-placeholder">🐶</div>}
                  <div>
                    <h3>{pet.name}</h3>
                    <p>{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                    <span className="status-pill">{pet.status === 'lost' ? 'En modo perdido' : 'Protegida'}</span>
                  </div>
                </article>
              ))}
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
