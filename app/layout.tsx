import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PawLink | Siempre contigo',
  description: 'Identificación inteligente para mascotas con QR y NFC.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
