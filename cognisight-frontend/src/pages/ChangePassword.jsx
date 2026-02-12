import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";

export const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validate = () => {
    const { newPassword, confirmPassword } = formData;
    if (newPassword.length < 8) return "New password must be at least 8 characters";
    if (newPassword !== confirmPassword) return "Passwords do not match";
    // optional: add regex for complexity
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      await authAPI.changePassword(formData);
      setMessage("Password changed successfully!");
      setTimeout(() => navigate("/dashboard"), 1400);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to change password");
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
          <div style={styles.cardHeader}>
            <h2 style={styles.title}>Change Password</h2>
            <p style={styles.subtitle}>Keep your account secure — update your password</p>
          </div>

          {error && <div style={styles.alertError}>{error}</div>}
          {message && <div style={styles.alertSuccess}>{message}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>Current Password</label>
            <input
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              type="password"
              style={styles.input}
              required
            />

            <label style={styles.label}>New Password</label>
            <input
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              type="password"
              placeholder="Min 8 chars — mix letters & numbers"
              style={styles.input}
              required
            />

            <label style={styles.label}>Confirm New Password</label>
            <input
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              type="password"
              style={styles.input}
              required
            />

            <button style={styles.primary} disabled={loading}>
              {loading ? "Updating…" : "Change Password"}
            </button>

            <div style={{ textAlign: "center", marginTop: 10 }}>
              <Link to="/dashboard" style={styles.linkMuted}>Back to Profile</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

/* styles */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#071233 0%, #0f172a 60%)",
    color: "#e6eefb",
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto",
    paddingBottom: 64,
  },
  nav: {
    backdropFilter: "blur(6px)",
    background: "rgba(8,17,34,0.5)",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
  },
  navInner: {
    maxWidth: 1152,
    margin: "0 auto",
    padding: "12px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  logo: { width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6d28d9,#06b6d4)" },
  brandText: { margin: 0, fontSize: 18, fontWeight: 700, color: "#f8fafc" },
  linkGhost: { color: "#c7d2fe", textDecoration: "none", padding: "6px 8px", borderRadius: 8 },

  center: { display: "flex", justifyContent: "center", padding: "48px 16px" },
  card: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 14,
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    border: "1px solid rgba(255,255,255,0.03)",
    boxShadow: "0 18px 50px rgba(2,6,23,0.6)",
    padding: 28,
  },
  cardHeader: { marginBottom: 8 },
  title: { margin: 0, fontSize: 22, fontWeight: 800, color: "#f8fafc" },
  subtitle: { marginTop: 8, marginBottom: 18, color: "#dbeafe", opacity: 0.9 },

  alertError: {
    background: "rgba(254,226,226,0.06)",
    border: "1px solid rgba(254,202,202,0.12)",
    color: "#fecaca",
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 12,
  },
  alertSuccess: {
    background: "rgba(220,252,231,0.04)",
    border: "1px solid rgba(134,239,172,0.08)",
    color: "#86efac",
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 12,
  },

  form: { display: "grid", gap: 12, marginTop: 6 },
  label: { fontSize: 13, color: "#cfe4ff", opacity: 0.9 },
  input: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.04)",
    background: "rgba(255,255,255,0.01)",
    color: "#e6eefb",
    outline: "none",
    fontSize: 14,
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

  linkMuted: { color: "#a5b4fc", textDecoration: "none", fontSize: 13 },
};
