export default function Home() {
  return (
    <main className="hero">
      <section className="card">
        <div className="logo">🐾 Paw<span>Link</span></div>
        <h1>Si algún día se pierde, ayúdalo a volver a casa.</h1>
        <p>
          Identificación inteligente para mascotas con QR y NFC. Sin aplicaciones para quien encuentra a tu mascota.
        </p>
        <div className="actions">
          <a className="btn primary" href="#proteger">Proteger a mi mascota</a>
          <a className="btn secondary" href="#encontrada">Encontré una mascota</a>
        </div>
        <div className="badges">
          <span className="badge">QR + NFC</span>
          <span className="badge">Modo perdido</span>
          <span className="badge">Avisos de escaneo</span>
          <span className="badge">Sin app para el finder</span>
        </div>
      </section>
    </main>
  )
}
