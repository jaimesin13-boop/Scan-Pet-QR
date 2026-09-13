'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function QRModal({ code, petName }: { code: string; petName: string }) {
  const [open, setOpen] = useState(false)

  if (!code) return null

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/p/${encodeURIComponent(code)}`
    : `/p/${encodeURIComponent(code)}`

  return (
    <>
      <button className="btn secondary" type="button" onClick={() => setOpen(true)}>
        📱 Mostrar QR
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Código QR de ${petName}`}
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(8, 31, 25, .58)', display: 'grid', placeItems: 'center', padding: 20 }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{ width: 'min(420px, 100%)', background: '#fff', borderRadius: 28, padding: 28, textAlign: 'center', boxShadow: '0 24px 70px rgba(0,0,0,.22)' }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              style={{ float: 'right', border: 0, background: 'transparent', fontSize: 26, cursor: 'pointer' }}
            >
              ×
            </button>
            <p className="eyebrow" style={{ marginTop: 8 }}>MEDALLÓN PAWLINK</p>
            <h2 style={{ marginTop: 4 }}>QR de {petName}</h2>
            <p>Este código lleva directamente al perfil público de tu mascota.</p>

            <div style={{ display: 'inline-flex', padding: 18, margin: '18px 0', border: '1px solid #e4e0ee', borderRadius: 22, background: '#fff' }}>
              <QRCodeSVG value={publicUrl} size={280} level="H" includeMargin />
            </div>

            <p style={{ fontSize: 13, wordBreak: 'break-all', marginBottom: 18 }}>{publicUrl}</p>
            <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
              <a className="btn primary" href={publicUrl} target="_blank" rel="noreferrer">
                🔗 Abrir perfil público
              </a>
              <button className="btn secondary" type="button" onClick={() => setOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
