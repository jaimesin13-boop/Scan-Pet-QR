import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type PetPublic = {
  p_code: string
  pet_name: string
  species: string | null
  breed: string | null
  color: string | null
  photo_url: string | null
  distinguishing_features: string | null
  pet_status: string | null
  lost_description: string | null
}

export default async function PetPublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>
  searchParams: Promise<{ source?: string }>
}) {
  const { code } = await params
  const { source } = await searchParams
  const supabase = await createClient()
  const publicCode = code.toUpperCase()

  const { data, error } = await supabase.rpc('get_pet_by_tag', {
    p_code: publicCode,
  })

  if (error || !data || data.length === 0) {
    notFound()
  }

  // Register the visit without exposing private owner information.
  // QR is the default; NFC can use ?source=nfc later.
  const scanType = source?.toLowerCase() === 'nfc' ? 'NFC' : 'QR'
  await supabase.rpc('register_pet_scan', {
    p_code: publicCode,
    p_scan_type: scanType,
    p_latitude: null,
    p_longitude: null,
    p_location_consent: false,
  })

  const pet = data[0] as PetPublic
  const isLost = pet.pet_status === 'lost' || Boolean(pet.lost_description)

  return (
    <main className="hero">
      <section className="card" style={{ maxWidth: 560 }}>
        <div className="logo">🐾 Paw<span>Link</span></div>

        <div
          style={{
            marginTop: 24,
            padding: '14px 18px',
            borderRadius: 18,
            background: isLost ? '#fff0f0' : '#eef8f1',
            color: isLost ? '#a52b2b' : '#27643d',
            fontWeight: 800,
            textAlign: 'center',
          }}
        >
          {isLost ? '🚨 ESTA MASCOTA ESTÁ PERDIDA' : '✓ MASCOTA PROTEGIDA POR PAWLINK'}
        </div>

        {pet.photo_url ? (
          <img
            src={pet.photo_url}
            alt={`Foto de ${pet.pet_name}`}
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              objectFit: 'cover',
              borderRadius: 28,
              marginTop: 24,
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: 28,
              marginTop: 24,
              display: 'grid',
              placeItems: 'center',
              background: '#eef4f0',
              fontSize: 96,
            }}
          >
            {pet.species?.toLowerCase() === 'gato' ? '🐱' : '🐶'}
          </div>
        )}

        <h1 style={{ marginBottom: 8 }}>{pet.pet_name}</h1>

        <p style={{ fontSize: 20, marginTop: 0 }}>
          {[pet.species, pet.breed].filter(Boolean).join(' · ')}
        </p>

        {pet.color && (
          <p><strong>Color:</strong> {pet.color}</p>
        )}

        {pet.distinguishing_features && (
          <div style={{ marginTop: 22 }}>
            <h2 style={{ marginBottom: 8 }}>Cómo identificarla</h2>
            <p>{pet.distinguishing_features}</p>
          </div>
        )}

        {isLost && pet.lost_description && (
          <div
            style={{
              marginTop: 22,
              padding: 18,
              borderRadius: 20,
              background: '#fff7f7',
            }}
          >
            <h2 style={{ marginTop: 0 }}>Información importante</h2>
            <p>{pet.lost_description}</p>
          </div>
        )}

        <div className="actions" style={{ marginTop: 28 }}>
          <a className="btn primary" href="#contacto" aria-label="Contactar al propietario">
            📞 Contactar al propietario
          </a>
          <a className="btn secondary" href="#avistamiento">
            📍 Reportar avistamiento
          </a>
        </div>

        <div
          id="contacto"
          style={{
            marginTop: 24,
            padding: 18,
            borderRadius: 20,
            background: '#f7f4ff',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Contactar al propietario</h2>
          <p style={{ marginBottom: 0 }}>
            El contacto se realizará de forma protegida por PawLink. Esta función se habilitará en el siguiente módulo.
          </p>
        </div>

        <p className="login-link" style={{ marginTop: 24 }}>
          Código del medallón: <strong>{pet.p_code}</strong>
        </p>
      </section>
    </main>
  )
}
