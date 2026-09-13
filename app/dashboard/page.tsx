import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QRCodeCard from './QRCodeCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('name, email, phone').eq('id', user.id).maybeSingle()
  const { data: pets } = await supabase.from('pets').select('id, name, species, breed, color, photo_url, status').eq('owner_id', user.id).order('created_at', { ascending: false })
  const petIds = (pets || []).map(p => p.id)
  const { data: links } = petIds.length ? await supabase.from('pet_tags').select('pet_id, tag_id, is_active').in('pet_id', petIds).eq('is_active', true) : { data: [] as any[] }
  const tagIds = (links || []).map(l => l.tag_id)
  const { data: tags } = tagIds.length ? await supabase.from('tags').select('id, public_code').in('id', tagIds) : { data: [] as any[] }
  const tagByPet = new Map<string, string>()
  for (const link of links || []) { const tag = (tags || []).find(t => t.id === link.tag_id); if (tag) tagByPet.set(link.pet_id, tag.public_code) }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header"><div className="auth-logo">🐾 Paw<span>Link</span></div><div style={{display:'flex',gap:10}}><a className="btn secondary" href="/dashboard/avistamientos">📍 Avistamientos</a><a className="btn secondary" href="/">Inicio</a></div></header>
      <section className="dashboard-content">
        <div className="dashboard-welcome"><p className="eyebrow">MI PAWLINK</p><h1>Hola, {profile?.name || user.user_metadata?.name || 'bienvenido'} 👋</h1><p>Administra tus mascotas y mantén su información protegida.</p></div>
        <div className="dashboard-actions"><a className="btn primary" href="/dashboard/pets/new">+ Registrar mascota</a></div>
        <section className="pets-section"><h2>Mis mascotas</h2>
          {pets && pets.length > 0 ? <div className="pet-grid">{pets.map(pet => { const code = tagByPet.get(pet.id); return <article className="pet-card" key={pet.id} style={{display:'block'}}><div style={{display:'flex',gap:16,alignItems:'center'}}>{pet.photo_url ? <img src={pet.photo_url} alt={pet.name}/> : <div className="pet-placeholder">🐶</div>}<div><h3>{pet.name}</h3><p>{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p><span className="status-pill">{pet.status === 'lost' ? 'En modo perdido' : 'Protegida'}</span></div></div>{code ? <QRCodeCard code={code} petName={pet.name}/> : <p style={{marginTop:16}}>🔖 Aún no hay un medallón vinculado a esta mascota.</p>}</article> })}</div> : <div className="empty-state"><div className="empty-icon">🐾</div><h3>Aún no has registrado una mascota</h3><p>Registra a tu primera mascota para comenzar a protegerla con PawLink.</p><a className="btn primary" href="/dashboard/pets/new">Registrar mi primera mascota</a></div>}
        </section>
      </section>
    </main>
  )
}
