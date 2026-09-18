import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function PlusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: subscriptionData } = await supabase.rpc('get_my_subscription').maybeSingle()
  const subscription = subscriptionData as { status?: string } | null
  const isPlus = subscription?.status === 'active'

  return (
    <main className="auth-page">
      <section className="auth-card wide">
        <a className="back-link" href="/dashboard">← Volver a mi panel</a>
        <div className="auth-logo">🐾 Paw<span>Link</span></div>
        <p className="eyebrow">PAWLINK PLUS</p>
        <h1>{isPlus ? 'Tu protección Plus ✨' : 'Más protección para tus mascotas.'}</h1>
        <p className="auth-subtitle">
          {isPlus
            ? 'Tu cuenta tiene PawLink Plus activo.'
            : 'Funciones avanzadas para conocer mejor la actividad de tus medallones.'}
        </p>

        <div style={{ display: 'grid', gap: 14, marginTop: 28 }}>
          <div className="alert">
            <strong>Incluye</strong><br />
            🔔 Alertas y actividad de escaneos<br />
            📊 Historial y estadísticas<br />
            📍 Información de ubicación cuando exista consentimiento<br />
            👨‍👩‍👧 Familiares o cuidadores autorizados<br />
            🐾 Todas las mascotas de tu cuenta
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <div style={{ padding: 20, border: '1px solid #e4e0ef', borderRadius: 18, textAlign: 'center' }}>
              <strong style={{ fontSize: 28 }}>$30</strong>
              <p style={{ margin: '6px 0 0', fontSize: 14 }}>MXN al mes</p>
            </div>
            <div style={{ padding: 20, border: '1px solid #e4e0ef', borderRadius: 18, textAlign: 'center' }}>
              <strong style={{ fontSize: 28 }}>$299</strong>
              <p style={{ margin: '6px 0 0', fontSize: 14 }}>MXN al año</p>
            </div>
          </div>

          {isPlus ? (
            <div className="alert success">
              <strong>PawLink Plus está activo.</strong><br />
              Tu suscripción se administra desde tu cuenta.
            </div>
          ) : (
            <div className="alert">
              <strong>Importante:</strong> las funciones esenciales de PawLink no se bloquean por no tener Plus.
            </div>
          )}

          {!isPlus && (
            <button className="btn primary auth-submit" disabled>
              Próximamente: activar PawLink Plus
            </button>
          )}
        </div>
      </section>
    </main>
  )
}
