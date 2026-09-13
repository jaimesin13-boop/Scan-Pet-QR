'use client'

import { QRCodeSVG } from 'qrcode.react'

export default function PetQr({ code }: { code: string }) {
  const url = `${window.location.origin}/p/${code}`

  return (
    <div className="pet-qr-box">
      <div className="pet-qr-title">QR de {code}</div>
      <QRCodeSVG value={url} size={180} level="H" includeMargin />
      <p>Escanéalo para abrir el perfil de {code}.</p>
      <a className="btn secondary" href={`/p/${code}`} target="_blank" rel="noreferrer">
        Abrir perfil público
      </a>
    </div>
  )
}
