'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ContactOwner({ code }: { code: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState('')
  const [success, setSuccess] = useState(false)

  async function submit() {
    setSending(true)
    setResult('')
    setSuccess(false)

    const supabase = createClient()
    const { data, error } = await supabase.rpc('send_owner_contact_request', {
      p_code: code.toUpperCase(),
      p_reporter_name: name.trim() || null,
      p_reporter_phone: phone.trim() || null,
      p_reporter_email: email.trim() || null,
      p_message: message.trim() || null,
    })

    setSending(false)

    if (error) {
      setResult(error.message)
      return
    }

    const response = Array.isArray(data) ? data[0] : data
    if (response?.success === false) {
      setResult(response.message || 'No se pudo enviar el mensaje.')
      return
    }

    setSuccess(true)
    setResult('¡Mensaje enviado! El propietario recibirá el aviso de forma protegida.')
    setName('')
    setPhone('')
    setEmail('')
    setMessage('')
  }

  return (
    <div id="contacto" style={{ marginTop: 24, padding: 18, borderRadius: 20, background: '#f7f4ff' }}>
      <button
        className="btn primary"
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={{ width: '100%', cursor: 'pointer' }}
      >
        📞 {open ? 'Cerrar contacto' : 'Contactar al propietario'}
      </button>

      {open && (
        <div style={{ marginTop: 16, textAlign: 'left' }}>
          <h2 style={{ marginTop: 0 }}>Contactar al propietario</h2>
          <p>
            Puedes dejar un mensaje sin conocer los datos personales del propietario. PawLink enviará tu información de forma protegida.
          </p>

          <label>Tu nombre (opcional)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. María" />

          <label>Teléfono (opcional)</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej. 312..." inputMode="tel" />

          <label>Correo (opcional)</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ej. correo@ejemplo.com" type="email" />

          <label>Mensaje</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ej. Encontré a tu mascota y quiero ayudarte a reunirla contigo."
            rows={5}
          />

          <button
            className="btn primary"
            type="button"
            disabled={sending}
            onClick={submit}
            style={{ width: '100%', cursor: sending ? 'wait' : 'pointer', marginTop: 10 }}
          >
            {sending ? 'Enviando...' : 'Enviar mensaje'}
          </button>

          {result && (
            <p style={{ marginBottom: 0, color: success ? '#27643d' : '#9a2f2f', fontWeight: 700 }}>
              {result}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
