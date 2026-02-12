import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";

export const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!formData.username.trim()) return "Please enter your name";
    if (formData.password.length < 8) return "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };
      const response = await authAPI.register(payload);
      // optionally auto-login if backend returns token
      if (response?.data?.token) {
        login(response.data.token, response.data.user);
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Registration failed");
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
        <div style={styles.card}>
          <h2 style={styles.title}>Create your account</h2>
          <p style={styles.lead}>Join Cognisight and get instant access to the AI workspace.</p>

          {error && <div style={styles.alertError}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>Full name</label>
            <input name="username" value={formData.username} onChange={handleChange} style={styles.input} required />

            <label style={styles.label}>Email</label>
            <input name="email" value={formData.email} onChange={handleChange} type="email" style={styles.input} required />

            <label style={styles.label}>Password</label>
            <input name="password" value={formData.password} onChange={handleChange} type="password" placeholder="Minimum 8 characters" style={styles.input} required />

            <label style={styles.label}>Confirm password</label>
            <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" style={styles.input} required />

            <button style={styles.primary} disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>

          <p style={styles.smallText}>
            Already have an account? <Link to="/login" style={styles.linkAccent}>Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

/* reuse same styles variable as for login/change password for consistent look */
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
  card: {
    width: "100%",
    maxWidth: 560,
    borderRadius: 14,
    padding: 26,
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    border: "1px solid rgba(255,255,255,0.03)",
    boxShadow: "0 18px 50px rgba(2,6,23,0.6)",
  },

  title: { margin: 0, fontSize: 22, fontWeight: 800 },
  lead: { marginTop: 8, color: "#dbeafe", opacity: 0.9 },

  alertError: { background: "rgba(254,226,226,0.06)", border: "1px solid rgba(254,202,202,0.12)", color: "#fecaca", padding: 10, borderRadius: 8, marginTop: 12 },

  form: { display: "grid", gap: 12, marginTop: 14 },
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
  linkGhost: { color: "#c7d2fe", textDecoration: "none" },
};
