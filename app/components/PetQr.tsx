'use client'

import { QRCodeSVG } from 'qrcode.react'

export default function PetQr({ url, petName }: { url: string; petName: string }) {
  return (
    <div className="pet-qr-box">
      <div className="pet-qr-code">
        <QRCodeSVG value={url} size={190} level="H" includeMargin />
      </div>
      <div className="pet-qr-info">
        <strong>QR de {petName}</strong>
        <span>Escanea para abrir su perfil público</span>
      </div>
    </div>
  )
}
