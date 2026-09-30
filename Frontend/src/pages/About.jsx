export default function About() {
  return (
    <div className="container" style={{ padding: '3rem 1.25rem', maxWidth: 800 }}>
      <h1 className="section-title">About Faruk Fashion</h1>
      <div className="gold-divider" />
      <p className="section-subtitle">Style That Speaks</p>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2.5rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: '1.25rem' }}>
          <strong style={{ color: 'var(--gold)' }}>In the Name of Allah</strong>
        </p>
        <p style={{ marginBottom: '1.25rem' }}>
          Faruk Fashion is your trusted destination for premium quality bags. From elegant handbags
          and durable trolley bags to vibrant school bags, college backpacks, kids bags, office bags,
          sling bags and complete travelling kits — we bring you a wide variety designed to match
          every lifestyle.
        </p>
        <p style={{ marginBottom: '1.25rem' }}>
          Based in <strong style={{ color: 'var(--cream)' }}>Thenkarai, Periyakulam</strong>, we are
          committed to offering products that combine classic elegance with modern durability.
          Every piece in our collection reflects our belief: <em style={{ color: 'var(--gold)' }}>Style That Speaks</em>.
        </p>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', margin: '1.75rem 0 0.75rem' }}>Our Promise</h3>
        <ul style={{ paddingLeft: '1.25rem' }}>
          <li><strong>Premium Quality</strong> — Carefully selected materials</li>
          <li><strong>Durable & Stylish</strong> — Built for everyday use</li>
          <li><strong>Wide Variety</strong> — Bags for every age and occasion</li>
          <li><strong>Trusted Service</strong> — 24×7 customer support</li>
        </ul>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', margin: '1.75rem 0 0.75rem' }}>Visit Us</h3>
        <p>
          35, Kamarajar Street, Thenkarai,<br />
          Periyakulam-625 601<br />
          WhatsApp / Call: <a href="tel:+919344282751">+91 93442 82751</a>
        </p>
      </div>
    </div>
  );
}
