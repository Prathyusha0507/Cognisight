import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";

export const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authAPI.login(formData);
      login(response.data.token, response.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.brand}>
            <div style={styles.logo} />
            <h1 style={styles.brandText}>Cognisight</h1>
          </div>
          <div>
            <Link to="/" style={styles.linkGhost}>Home</Link>
          </div>
        </div>
      </nav>

      <main style={styles.center}>
        <div style={styles.cardRow}>
          <div style={styles.leftCard}>
            <h2 style={styles.title}>Welcome back</h2>
            <p style={styles.lead}>Sign in to your account to open your AI workspace.</p>

            {error && <div style={styles.alertError}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <label style={styles.label}>Email</label>
              <input name="email" value={formData.email} onChange={handleChange} style={styles.input} type="email" required />

              <label style={styles.label}>Password</label>
              <input name="password" value={formData.password} onChange={handleChange} style={styles.input} type="password" required />

              <button style={styles.primary} disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <p style={styles.smallText}>
              Don't have an account?{" "}
              <Link to="/register" style={styles.linkAccent}>Create one</Link>
            </p>
          </div>

          <aside style={styles.rightPanel}>
            <div style={styles.panelContent}>
              <h3 style={{ margin: 0 }}>Why Cognisight?</h3>
              <ul style={styles.benefits}>
                <li>AI assistant that understands context</li>
                <li>Secure sessions & encrypted storage</li>
                <li>Easy to deploy and extend</li>
              </ul>
              <div style={{ marginTop: 12 }}>
                <small style={{ color: "#cfe4ff" }}>Need help? <Link to="/help" style={styles.linkAccent}>Support</Link></small>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

/* styles (shared design language with earlier file) */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#071233 0%, #0f172a 60%)",
    color: "#e6eefb",
    fontFamily: "Inter, system-ui",
    paddingBottom: 72,
  },
  nav: { backdropFilter: "blur(6px)", background: "rgba(8,17,34,0.5)", borderBottom: "1px solid rgba(255,255,255,0.03)" },
  navInner: { maxWidth: 1152, margin: "0 auto", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  logo: { width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6d28d9,#06b6d4)" },
  brandText: { margin: 0, fontSize: 18, fontWeight: 700 },

  center: { display: "flex", justifyContent: "center", padding: "54px 16px" },
  cardRow: { display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, maxWidth: 900, width: "100%", alignItems: "start" },
  leftCard: {
    borderRadius: 14,
    padding: 24,
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    border: "1px solid rgba(255,255,255,0.03)",
    boxShadow: "0 18px 50px rgba(2,6,23,0.6)",
  },
  rightPanel: {
    borderRadius: 14,
    padding: 18,
    background: "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005))",
    border: "1px solid rgba(255,255,255,0.02)",
    display: "flex",
    alignItems: "center",
  },
  panelContent: { width: "100%" },

  title: { margin: 0, fontSize: 22, fontWeight: 800, color: "#f8fafc" },
  lead: { marginTop: 8, color: "#dbeafe", opacity: 0.9 },

  alertError: { background: "rgba(254,226,226,0.06)", border: "1px solid rgba(254,202,202,0.12)", color: "#fecaca", padding: 10, borderRadius: 8, marginTop: 12 },

  form: { display: "grid", gap: 12, marginTop: 12 },
  label: { fontSize: 13, color: "#cfe4ff", opacity: 0.92 },
  input: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.04)",
    background: "rgba(255,255,255,0.01)",
    color: "#e6eefb",
  },

  primary: {
    marginTop: 6,
    padding: "12px 14px",
    borderRadius: 10,
    border: "none",
    fontWeight: 700,
    background: "linear-gradient(135deg,#667eea 0%, #764ba2 100%)",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(102,126,234,0.18)",
  },

  smallText: { marginTop: 12, color: "#cfe4ff", opacity: 0.9 },
  linkAccent: { color: "#a5b4fc", textDecoration: "none", fontWeight: 600 },

  benefits: { marginTop: 12, color: "#dbeafe", lineHeight: 1.6, paddingLeft: 18 },
  linkGhost: { color: "#c7d2fe", textDecoration: "none" },
};
