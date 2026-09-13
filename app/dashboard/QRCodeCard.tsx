'use client'

import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function QRCodeCard({ code, petName }: { code: string; petName: string }) {
  const profileUrl = `${window.location.origin}/p/${code}`
  const qrRef = useRef<HTMLDivElement>(null)

  function printQR() {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const win = window.open('', '_blank', 'width=600,height=700')
    if (!win) return
    win.document.write(`<html><head><title>QR ${petName}</title></head><body style="font-family:Arial;text-align:center;padding:40px"><h1>PawLink</h1><h2>${petName}</h2>${svg.outerHTML}<p>${code}</p><p>Escanea para ver el perfil de ${petName}</p><script>window.onload=()=>window.print()</script></body></html>`)
    win.document.close()
  }

  return (
    <div style={{ marginTop: 18, padding: 18, borderRadius: 20, background: '#f7f4ff', textAlign: 'center' }}>
      <h4 style={{ margin: '0 0 6px' }}>📱 QR de {petName}</h4>
      <p style={{ margin: '0 0 14px', fontSize: 13 }}>Medallón {code}</p>
      <div ref={qrRef} style={{ display: 'inline-block', background: '#fff', padding: 14, borderRadius: 16 }}>
        <QRCodeSVG value={profileUrl} size={180} level="H" includeMargin />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 }}>
        <a className="btn primary" href={profileUrl} target="_blank" rel="noreferrer">🌐 Ver perfil</a>
        <button className="btn secondary" type="button" onClick={printQR}>🖨️ Imprimir QR</button>
      </div>
    </div>
  )
}
