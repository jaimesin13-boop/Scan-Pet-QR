'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ReportSighting({ code }: { code: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationAsked, setLocationAsked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  function requestLocation() {
    setLocationAsked(true)
    if (!navigator.geolocation) {
      setMessage('Este dispositivo no permite compartir ubicación.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude })
        setMessage('Ubicación agregada al reporte.')
      },
      () => setMessage('No se pudo obtener la ubicación. Puedes enviar el reporte sin ella.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  async function submit() {
    setSaving(true)
    setMessage('')
    setSuccess(false)

    const supabase = createClient()
    const { data, error } = await supabase.rpc('register_pet_sighting', {
      p_code: code.toUpperCase(),
      p_reporter_name: name.trim() || null,
      p_reporter_phone: phone.trim() || null,
      p_reporter_email: email.trim() || null,
      p_comment: comment.trim() || null,
      p_latitude: location?.latitude ?? null,
      p_longitude: location?.longitude ?? null,
      p_location_consent: Boolean(location),
    })

    setSaving(false)
    if (error) {
      setMessage(error.message)
      return
    }

    const result = Array.isArray(data) ? data[0] : data
    if (!result?.success) {
      setMessage(result?.message || 'No se pudo enviar el reporte.')
      return
    }

    setSuccess(true)
    setMessage('¡Reporte enviado! El propietario recibirá el aviso.')
    setName('')
    setPhone('')
    setEmail('')
    setComment('')
  }

  return (
    <div id="avistamiento" style={{ marginTop: 18 }}>
      <button className="btn secondary" type="button" onClick={() => setOpen((value) => !value)} style={{ width: '100%', cursor: 'pointer' }}>
        📍 {open ? 'Cerrar reporte' : 'Reportar avistamiento'}
      </button>

      {open && (
        <div style={{ marginTop: 14, padding: 20, borderRadius: 22, background: '#f7f4ff', textAlign: 'left' }}>
          <h2 style={{ marginTop: 0 }}>¿Viste a esta mascota?</h2>
          <p>Comparte lo que viste. No necesitas crear una cuenta. Tu ubicación solo se comparte si tú la autorizas.</p>

          <label>Tu nombre (opcional)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. María" />

          <label>Teléfono (opcional)</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej. 312..." inputMode="tel" />

          <label>Correo (opcional)</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ej. correo@ejemplo.com" type="email" />

          <label>¿Dónde la viste o qué observaste?</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ej. La vi cerca de..." rows={4} />

          <button className="btn secondary" type="button" onClick={requestLocation} style={{ width: '100%', cursor: 'pointer', marginTop: 8 }}>
            {location ? '✓ Ubicación agregada' : '📌 Compartir mi ubicación'}
          </button>

          <button className="btn primary" type="button" disabled={saving} onClick={submit} style={{ width: '100%', cursor: saving ? 'wait' : 'pointer', marginTop: 10 }}>
            {saving ? 'Enviando...' : 'Enviar reporte'}
          </button>

          {message && <p style={{ marginBottom: 0, color: success ? '#27643d' : '#9a2f2f', fontWeight: 700 }}>{message}</p>}
          {locationAsked && !location && !message && <p style={{ marginBottom: 0 }}>Puedes continuar sin compartir ubicación.</p>}
        </div>
      )}
    </div>
  )
}
