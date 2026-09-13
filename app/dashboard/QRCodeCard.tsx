'use client'

import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

type QRCodeCardProps = {
  code: string
  petName: string
}

export default function QRCodeCard({ code, petName }: QRCodeCardProps) {
  const [profileUrl, setProfileUrl] = useState('')
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setProfileUrl(`${window.location.origin}/p/${encodeURIComponent(code)}`)
  }, [code])

  function printQR() {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg || !profileUrl) return

    const win = window.open('', '_blank', 'width=600,height=700')
    if (!win) return

    const safeName = petName.replace(/[&<>\"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '\"': '&quot;',
      "'": '&#39;',
    }[char] || char))

    win.document.write(`
      <html>
        <head>
          <title>QR ${safeName}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
            svg { max-width: 280px; height: auto; }
          </style>
        </head>
        <body>
          <h1>PawLink</h1>
          <h2>${safeName}</h2>
          ${svg.outerHTML}
          <p>${code}</p>
          <p>Escanea para ver el perfil de ${safeName}</p>
          <script>window.onload = () => window.print()</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div style={{ marginTop: 18, padding: 18, borderRadius: 20, background: '#f7f4ff', textAlign: 'center' }}>
      <h4 style={{ margin: '0 0 6px' }}>📱 QR de {petName}</h4>
      <p style={{ margin: '0 0 14px', fontSize: 13 }}>Medallón {code}</p>

      <div ref={qrRef} style={{ display: 'inline-block', background: '#fff', padding: 14, borderRadius: 16, minWidth: 208, minHeight: 208 }}>
        {profileUrl ? (
          <QRCodeSVG value={profileUrl} size={180} level="H" includeMargin />
        ) : (
          <div style={{ width: 180, height: 180, display: 'grid', placeItems: 'center', fontSize: 13, color: '#666' }}>
            Generando QR…
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 }}>
        {profileUrl && (
          <a className="btn primary" href={profileUrl} target="_blank" rel="noreferrer">
            🌐 Ver perfil
          </a>
        )}
        <button className="btn secondary" type="button" onClick={printQR} disabled={!profileUrl}>
          🖨️ Imprimir QR
        </button>
      </div>
    </div>
  )
}
