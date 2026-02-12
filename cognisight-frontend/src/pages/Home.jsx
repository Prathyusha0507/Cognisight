import React, { useState } from "react";
import { Link } from "react-router-dom";

export const Home = () => {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const [hovered, setHovered] = useState(null);

  const features = [
    { icon: "🛠️", title: "ProjectBuilder", text: "✨ Where development meets intelligence. " },
    { icon: "🤖", title: "AI Assistant", text: "Context-aware answers, suggestions and automation." },
    { icon: "🔐", title: "Secure & Private", text: "End-to-end encryption and enterprise-grade controls." },
    { icon: "⚡", title: "Lightning Fast", text: "Optimized performance for snappy replies and UI." },
  ];

  return (
    <div style={{ ...styles.container }}>
      <nav style={{ ...styles.nav }}>
        <div style={styles.navContainer}>
          <div style={styles.brand}>
            <div style={styles.logoMark} />
            <h1 style={styles.navLogo}>Cognisight</h1>
          </div>

          <div style={styles.navLinks}>
            {/* Home -> dashboard when logged in, otherwise root */}
            {isLoggedIn ? (
              <Link to="/dashboard" style={styles.navLink}>Home</Link>
            ) : (
              <Link to="/" style={styles.navLink}>Home</Link>
            )}

            {/* show Sign In / Register only when NOT logged in */}
            {!isLoggedIn && (
              <>
                <Link to="/login" style={styles.navButton}>Sign In</Link>
                <Link
                  to="/register"
                  style={{
                    ...styles.navButton,
                    backgroundColor: "transparent",
                    color: "#a5b4fc",
                    border: `1px solid rgba(165,180,252,0.28)`,
                    boxShadow: "none"
                  }}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Decorative blob */}
      <div style={styles.blobWrapper} aria-hidden>
        <svg viewBox="0 0 600 400" style={styles.blobSvg}>
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <path fill="url(#g1)" opacity="0.12" d="M421.5,290Q350,340,270,326Q190,312,129,266Q68,220,76,142Q84,64,154,45Q224,26,298,42Q372,58,422,110Q472,162,433,233Q394,304,421.5,290Z" />
        </svg>
      </div>

      <header style={styles.heroWrap}>
        <div style={{ ...styles.heroCard }}>
          <div style={styles.heroLeft}>
            <h2 style={styles.heroTitle}>
              Your AI-Powered{" "}
              <span style={{ ...styles.gradientText }}>Workspace</span>
            </h2>
            <p style={styles.heroSubtitle}>
              Build, automate and collaborate with intelligent tools that speed up work
              and make teams more creative. Bring context, memory and actions together.
            </p>

            <div style={styles.heroCTA}>
              {/* CTA adapts to login state */}
              <Link to={isLoggedIn ? "/dashboard" : "/register"} style={{ ...styles.ctaPrimary }}>
                {isLoggedIn ? "Open Workspace" : "Get Started Free"}
              </Link>

              <Link to="/about" style={{ ...styles.ctaGhost }}>
                Learn More
              </Link>
            </div>

            <div style={styles.trustRow}>
              <small style={{ opacity: 0.85 }}>Trusted by teams at</small>
              <div style={styles.trustLogos}>
                <div style={styles.trustBadge}>Acme</div>
                <div style={styles.trustBadge}>Haven</div>
                <div style={styles.trustBadge}>Orbit</div>
              </div>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.previewCard}>
              <div style={styles.previewHeader}>
                <div style={styles.previewDot} />
                <div style={styles.previewDot} />
                <div style={styles.previewDot} />
              </div>

              <div style={styles.previewBody}>
                <p style={{ margin: 0, fontSize: 13, color: "#e6eefb" }}>
                  Chat with your assistant and get instant code, docs & actions.
                </p>

                <div style={styles.previewMsgs}>
                  <div style={styles.previewMsgUser}>You: Help me generate a deployment script</div>
                  <div style={styles.previewMsgBot}>Cognisight: Here’s a Bash script tailored for your stack…</div>
                </div>

                <div style={styles.previewFooter}>
                  <small style={{ opacity: 0.85 }}>Realtime • Secure • Expandable</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main style={styles.featuresGrid}>
        {features.map((f, i) => {
          const isHovered = hovered === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                ...styles.feature,
                transform: isHovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                boxShadow: isHovered
                  ? "0 10px 30px rgba(2,6,23,0.35)"
                  : "0 6px 18px rgba(2,6,23,0.18)"
              }}
            >
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureText}>{f.text}</p>
            </div>
          );
        })}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div>© {new Date().getFullYear()} Cognisight</div>
          <div style={{ opacity: 0.8 }}>Built with care • Privacy-first</div>
        </div>
      </footer>
    </div>
  );
};

/* ---------- styles (kept same as previous beautiful version) ---------- */
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#071233 0%, #0f172a 60%)",
    color: "#e6eefb",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    paddingBottom: 48,
  },

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
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg,#6d28d9,#06b6d4)",
    boxShadow: "0 6px 18px rgba(103,58,183,0.18)",
  },
  navLogo: {
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
    letterSpacing: 0.3,
    color: "#f8fafc",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  navLink: {
    color: "#c7d2fe",
    textDecoration: "none",
    padding: "6px 8px",
    borderRadius: 8,
    fontSize: 14,
  },
  navButton: {
    padding: "8px 16px",
    backgroundColor: "rgba(99,102,241,0.95)",
    color: "white",
    borderRadius: 10,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    boxShadow: "0 6px 18px rgba(99,102,241,0.16)",
    transition: "transform 180ms ease",
  },

  blobWrapper: {
    position: "absolute",
    left: -80,
    top: 80,
    pointerEvents: "none",
    zIndex: 0,
  },
  blobSvg: {
    width: 520,
    height: 360,
    display: "block",
    filter: "blur(22px)",
  },

  heroWrap: {
    maxWidth: "72rem",
    margin: "2.5rem auto 0",
    padding: "0 1.5rem",
    position: "relative",
    zIndex: 20,
  },
  heroCard: {
    display: "grid",
    gridTemplateColumns: "1fr 420px",
    gap: 32,
    alignItems: "center",
    padding: "2.2rem",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    border: "1px solid rgba(255,255,255,0.03)",
  },
  heroLeft: {
    paddingRight: 8,
  },
  heroTitle: {
    fontSize: 44,
    margin: "0 0 12px",
    lineHeight: 1.05,
    color: "#f8fafc",
    fontWeight: 800,
  },
  gradientText: {
    background: "linear-gradient(90deg,#7c3aed 0%, #06b6d4 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    color: "#dbeafe",
    opacity: 0.9,
    margin: "0 0 18px",
    maxWidth: 620,
    fontSize: 16,
  },
  heroCTA: { display: "flex", gap: 12, alignItems: "center", marginBottom: 18, flexWrap: "wrap" },

  ctaPrimary: {
    display: "inline-block",
    padding: "10px 20px",
    borderRadius: 12,
    fontWeight: 700,
    textDecoration: "none",
    background: "linear-gradient(135deg,#667eea 0%, #764ba2 100%)",
    color: "white",
    boxShadow: "0 10px 30px rgba(102,126,234,0.18)",
  },
  ctaGhost: {
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: 12,
    fontWeight: 700,
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#c7d2fe",
    background: "transparent",
  },

  trustRow: { marginTop: 6, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" },
  trustLogos: { display: "flex", gap: 8, marginLeft: 12 },
  trustBadge: {
    padding: "6px 10px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.02)",
    fontSize: 13,
    color: "#e6eefb",
    opacity: 0.95,
    border: "1px solid rgba(255,255,255,0.02)",
  },

  heroRight: { display: "flex", justifyContent: "center" },
  previewCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 12,
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    border: "1px solid rgba(255,255,255,0.03)",
    boxShadow: "0 8px 30px rgba(4,9,23,0.45)",
    overflow: "hidden",
  },
  previewHeader: { display: "flex", gap: 6, padding: 12 },
  previewDot: {
    width: 10,
    height: 10,
    borderRadius: 20,
    background: "rgba(255,255,255,0.08)",
  },
  previewBody: { padding: "12px 16px 18px" },
  previewMsgs: { marginTop: 12, display: "grid", gap: 8 },
  previewMsgUser: {
    alignSelf: "start",
    fontSize: 13,
    padding: "8px 10px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.03)",
    color: "#cfe4ff",
  },
  previewMsgBot: {
    alignSelf: "start",
    fontSize: 13,
    padding: "8px 10px",
    borderRadius: 8,
    background: "rgba(103,116,239,0.12)",
    color: "#eef2ff",
  },
  previewFooter: { marginTop: 12 },

  featuresGrid: {
    maxWidth: "72rem",
    margin: "2.5rem auto 1rem",
    padding: "0 1.5rem 4rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1.25rem",
    zIndex: 10,
  },
  feature: {
    padding: "1.4rem",
    borderRadius: 12,
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    border: "1px solid rgba(255,255,255,0.03)",
    transition: "transform 160ms ease, box-shadow 160ms ease",
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    margin: "0 0 8px",
    color: "#f8fafc",
    fontWeight: 700,
  },
  featureText: {
    margin: 0,
    color: "#dbeafe",
    opacity: 0.95,
    fontSize: 14,
    lineHeight: 1.6,
  },

  footer: {
    borderTop: "1px solid rgba(255,255,255,0.02)",
    marginTop: 24,
    paddingTop: 18,
  },
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
