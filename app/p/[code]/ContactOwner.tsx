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
    <div id="contacto" className="contact-box">
      <button
        className="btn primary contact-toggle"
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        📞 {open ? 'Cerrar contacto' : 'Contactar al propietario'}
      </button>

      {open && (
        <div className="contact-form">
          <h2>Contactar al propietario</h2>
          <p className="contact-description">
            Puedes dejar un mensaje sin conocer los datos personales del propietario. PawLink enviará tu información de forma protegida.
          </p>

          <div className="contact-fields">
            <div className="contact-field">
              <label htmlFor="contact-name">Tu nombre <span>(opcional)</span></label>
              <input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. María" />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-phone">Teléfono <span>(opcional)</span></label>
              <input id="contact-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej. 312 123 4567" inputMode="tel" />
            </div>

            <div className="contact-field full">
              <label htmlFor="contact-email">Correo <span>(opcional)</span></label>
              <input id="contact-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ej. correo@ejemplo.com" type="email" />
            </div>

            <div className="contact-field full">
              <label htmlFor="contact-message">Mensaje</label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ej. Encontré a tu mascota y quiero ayudarte a reunirla contigo."
                rows={5}
              />
            </div>

            <button className="btn primary contact-submit" type="button" disabled={sending} onClick={submit}>
              {sending ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </div>

          {result && <p className={success ? 'contact-result success' : 'contact-result error'}>{result}</p>}
        </div>
      )}
    </div>
  )
}
