import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QRModal from '../QRModal'

export default async function QRPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: pets } = await supabase
    .from('pets')
    .select('id, name, species, breed, photo_url')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const petsWithTags = await Promise.all((pets ?? []).map(async (pet) => {
    const { data: petTag } = await supabase
      .from('pet_tags')
      .select('tag_id')
      .eq('pet_id', pet.id)
      .eq('is_active', true)
      .maybeSingle()

    if (!petTag?.tag_id) return { ...pet, publicCode: null as string | null }

    const { data: tag } = await supabase
      .from('tags')
      .select('public_code')
      .eq('id', petTag.tag_id)
      .maybeSingle()

    return { ...pet, publicCode: tag?.public_code ?? null }
  }))

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="auth-logo">🐾 Paw<span>Link</span></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a className="btn secondary" href="/dashboard">Mi panel</a>
          <a className="btn secondary" href="/dashboard/avistamientos">📍 Avistamientos</a>
        </div>
      </header>

      <section className="dashboard-content">
        <p className="eyebrow">MEDALLONES PAWLINK</p>
        <h1>Mis códigos QR 📱</h1>
        <p>Abre el QR de cada mascota para verlo, probarlo o compartir su perfil público.</p>

        <div className="pet-grid" style={{ marginTop: 28 }}>
          {petsWithTags.map((pet) => (
            <article className="pet-card" key={pet.id}>
              {pet.photo_url ? <img src={pet.photo_url} alt={pet.name} /> : <div className="pet-placeholder">🐶</div>}
              <div style={{ flex: 1 }}>
                <h3>{pet.name}</h3>
                <p>{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                {pet.publicCode ? (
                  <>
                    <span className="status-pill">QR + NFC activo</span>
                    <div style={{ marginTop: 16 }}>
                      <QRModal code={pet.publicCode} petName={pet.name} />
                    </div>
                    <p style={{ fontSize: 13, opacity: .72, marginTop: 10 }}>Código: <strong>{pet.publicCode}</strong></p>
                  </>
                ) : (
                  <span style={{ fontSize: 14, opacity: .7 }}>Sin medallón asignado</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
