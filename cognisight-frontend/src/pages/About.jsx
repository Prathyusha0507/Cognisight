import React, { useState } from "react";
import { Link } from "react-router-dom";

export const About = () => {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const [hovered, setHovered] = useState(null);

  const features = [
    { icon: "💡", title: "Smart Suggestions", text: "AI-driven prompts, completion and context-aware help." },
    { icon: "🔒", title: "Privacy-first", text: "Encrypted storage, secure authentication and safe defaults." },
    { icon: "📚", title: "Persistent Memory", text: "Keep conversation history, contexts and actions across sessions." },
  ];

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <div style={styles.brand}>
            <div style={styles.logoMark} />
            <h1 style={styles.navLogo}>Cognisight</h1>
          </div>

          <div style={styles.navLinks}>
            {isLoggedIn ? (
              <Link to="/dashboard" style={styles.navLink}>Home</Link>
            ) : (
              <Link to="/" style={styles.navLink}>Home</Link>
            )}

            {!isLoggedIn && (
              <Link to="/login" style={styles.navButton}>Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      <header style={styles.hero}>
        <div style={styles.heroCard}>
          <div style={styles.heroText}>
            <h2 style={styles.title}>
              About <span style={styles.gradientText}>Cognisight</span>
            </h2>
            <p style={styles.lead}>
              We combine powerful AI, secure infrastructure and a delightful UI to help teams move faster.
              Designed for builders, creators and teams who want reliable AI assistance that just works.
            </p>

            <div style={styles.row}>
              {!isLoggedIn ? (
                <Link to="/register" style={styles.ctaPrimary}>Create Free Account</Link>
              ) : (
                <Link to="/dashboard" style={styles.ctaPrimary}>Open Workspace</Link>
              )}
              <Link to="/about" style={styles.ctaGhost}>Learn More</Link>
            </div>

            <div style={styles.smallRow}>
              <small style={{ opacity: 0.9 }}>Trusted by teams at</small>
              <div style={styles.trustLogos}>
                <div style={styles.trustBadge}>Acme</div>
                <div style={styles.trustBadge}>Haven</div>
                <div style={styles.trustBadge}>Orbit</div>
              </div>
            </div>
          </div>

          <div style={styles.heroPreview}>
            <div style={styles.previewCard}>
              <div style={styles.previewHeader}>
                <div style={styles.previewDot} />
                <div style={styles.previewDot} />
                <div style={styles.previewDot} />
              </div>

              <div style={styles.previewBody}>
                <p style={{ margin: 0, fontSize: 13, color: "#e6eefb" }}>
                  Example assistant flow — quick answers, structured outputs and code snippets.
                </p>

                <div style={{ marginTop: 12 }}>
                  <div style={styles.previewMsgUser}>You: Summarize this repo for me</div>
                  <div style={styles.previewMsgBot}>Cognisight: Key modules, endpoints, and deployment steps.</div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <small style={{ opacity: 0.85 }}>Realtime • Secure • Extendable</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Our Mission</h3>
          <p style={styles.sectionText}>
            Empower people and teams with intuitive AI tools that boost productivity, encourage creativity,
            and keep data private by design. We build for clarity, speed and real-world usefulness.
          </p>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Key Features</h3>
          <ul style={styles.featureList}>
            <li>Advanced AI assistant with context and tool integrations</li>
            <li>Secure authentication & JWT-based sessions</li>
            <li>Persistent chat history and conversation management</li>
            <li>Beautiful, responsive UI designed for focus</li>
            <li>Scalable cloud backend & reliable infra</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Highlights</h3>
          <div style={styles.grid}>
            {features.map((f, i) => {
              const isH = hovered === i;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    ...styles.featureCard,
                    transform: isH ? "translateY(-8px) scale(1.02)" : "translateY(0)",
                    boxShadow: isH ? "0 18px 40px rgba(2,6,23,0.45)" : "0 8px 22px rgba(2,6,23,0.28)"
                  }}
                >
                  <div style={styles.featureIcon}>{f.icon}</div>
                  <h4 style={styles.featureTitle}>{f.title}</h4>
                  <p style={styles.featureText}>{f.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Technology Stack</h3>
          <div style={styles.techGrid}>
            <div style={styles.techCard}>
              <h4 style={styles.techCardTitle}>Frontend</h4>
              <p style={styles.techCardText}>React 18 · Vite · React Router · Tailwind-ready UI</p>
            </div>
            <div style={styles.techCard}>
              <h4 style={styles.techCardTitle}>Backend</h4>
              <p style={styles.techCardText}>Express · MongoDB Atlas · JWT · OpenAI API</p>
            </div>
            <div style={styles.techCard}>
              <h4 style={styles.techCardTitle}>Infra</h4>
              <p style={styles.techCardText}>Docker · CI/CD · Cloud-hosted, autoscaling-friendly</p>
            </div>
          </div>
        </section>

        {!isLoggedIn && (
          <section style={styles.ctaSection}>
            <h3 style={styles.sectionTitle}>Get Started</h3>
            <p style={styles.sectionText}>
              Create your free account and get instant access to the AI workspace — start building and automating today.
            </p>
            <Link to="/register" style={styles.ctaPrimary}>Create Account →</Link>
          </section>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div>© {new Date().getFullYear()} Cognisight</div>
          <div style={{ opacity: 0.85 }}>Privacy-first • Built for teams</div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#071233 0%, #0f172a 60%)",
    color: "#e6eefb",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    paddingBottom: 48,
  },

  /* NAV */
  nav: {
    backgroundColor: "rgba(8,17,34,0.45)",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    position: "sticky",
    top: 0,
    zIndex: 60,
    backdropFilter: "blur(6px)",
  },
  navContainer: {
    maxWidth: "72rem",
    margin: "0 auto",
    padding: "1rem 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg,#6d28d9,#06b6d4)",
    boxShadow: "0 8px 26px rgba(103,58,183,0.16)",
  },
  navLogo: { margin: 0, fontSize: 18, fontWeight: 700, color: "#f8fafc" },
  navLinks: { display: "flex", gap: 12, alignItems: "center" },
  navLink: { color: "#c7d2fe", textDecoration: "none", padding: "6px 8px", borderRadius: 8 },
  navButton: {
    padding: "8px 16px",
    backgroundColor: "rgba(99,102,241,0.95)",
    color: "white",
    borderRadius: 10,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    boxShadow: "0 6px 18px rgba(99,102,241,0.16)",
  },

  /* HERO */
  hero: { maxWidth: "72rem", margin: "2.5rem auto 0", padding: "0 1.5rem", zIndex: 20 },
  heroCard: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: 28,
    alignItems: "center",
    padding: "2rem",
    borderRadius: 14,
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    border: "1px solid rgba(255,255,255,0.03)",
    boxShadow: "0 12px 40px rgba(2,6,23,0.5)",
  },
  heroText: {},
  title: { margin: 0, fontSize: 36, lineHeight: 1.05, fontWeight: 800 },
  gradientText: {
    background: "linear-gradient(90deg,#7c3aed 0%, #06b6d4 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  lead: { color: "#dbeafe", opacity: 0.95, marginTop: 12, maxWidth: 680 },
  row: { display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" },
  smallRow: { display: "flex", gap: 12, alignItems: "center", marginTop: 12, flexWrap: "wrap" },
  trustLogos: { display: "flex", gap: 8 },
  trustBadge: {
    padding: "6px 10px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.02)",
    fontSize: 12,
    color: "#e6eefb",
    border: "1px solid rgba(255,255,255,0.02)",
  },

  ctaPrimary: {
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: 10,
    fontWeight: 700,
    textDecoration: "none",
    background: "linear-gradient(135deg,#667eea 0%, #764ba2 100%)",
    color: "white",
    boxShadow: "0 10px 30px rgba(102,126,234,0.18)",
  },
  ctaGhost: {
    display: "inline-block",
    padding: "10px 16px",
    borderRadius: 10,
    fontWeight: 700,
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#c7d2fe",
    background: "transparent",
  },

  heroPreview: { display: "flex", justifyContent: "center" },
  previewCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 12,
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    border: "1px solid rgba(255,255,255,0.03)",
    overflow: "hidden",
  },
  previewHeader: { display: "flex", gap: 6, padding: 12 },
  previewDot: { width: 10, height: 10, borderRadius: 20, background: "rgba(255,255,255,0.08)" },
  previewBody: { padding: "12px 16px 18px" },
  previewMsgUser: {
    fontSize: 13,
    padding: "8px 10px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.03)",
    color: "#cfe4ff",
  },
  previewMsgBot: {
    fontSize: 13,
    padding: "8px 10px",
    borderRadius: 8,
    background: "rgba(103,116,239,0.12)",
    color: "#eef2ff",
    marginTop: 8,
  },

  /* MAIN content */
  main: { maxWidth: "72rem", margin: "2rem auto 0", padding: "0 1.5rem 4rem" },
  section: { marginBottom: "2.4rem" },
  sectionTitle: { fontSize: 20, marginBottom: 10, color: "#f8fafc", fontWeight: 700 },
  sectionText: { color: "#dbeafe", opacity: 0.95, lineHeight: 1.6 },

  featureList: { color: "#dbeafe", paddingLeft: 18, lineHeight: 1.8 },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginTop: 12,
  },
  featureCard: {
    padding: 16,
    borderRadius: 12,
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    border: "1px solid rgba(255,255,255,0.03)",
    transition: "transform 160ms ease, box-shadow 160ms ease",
  },
  featureIcon: { fontSize: 24, marginBottom: 10 },
  featureTitle: { margin: 0, fontSize: 16, fontWeight: 700 },
  featureText: { marginTop: 8, fontSize: 14, color: "#dbeafe", opacity: 0.95 },

  techGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginTop: 12,
  },
  techCard: {
    padding: 14,
    borderRadius: 10,
    background: "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005))",
    border: "1px solid rgba(255,255,255,0.02)",
  },
  techCardTitle: { margin: 0, fontWeight: 700, color: "#f8fafc" },
  techCardText: { marginTop: 6, fontSize: 13, color: "#dbeafe", opacity: 0.9 },

  ctaSection: { marginTop: 8 },

  footer: { borderTop: "1px solid rgba(255,255,255,0.02)", marginTop: 12 },
  footerInner: {
    maxWidth: "72rem",
    margin: "0 auto",
    padding: "0 1.5rem 48px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#cfe4ff",
    opacity: 0.9,
    fontSize: 13,
  },
};
