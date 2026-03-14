import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border 0.2s",
    fontFamily: "DM Sans, sans-serif",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050816",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Bg Orbs */}
      <div style={{ position: "absolute", width: "400px", height: "400px", top: "-100px", right: "-100px", borderRadius: "50%", background: "rgba(0,245,255,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: "300px", height: "300px", bottom: "-50px", left: "-50px", borderRadius: "50%", background: "rgba(124,58,237,0.07)", filter: "blur(80px)", pointerEvents: "none" }} />

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "2.5rem",
          borderRadius: "24px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          animation: "fadeUp 0.5s ease forwards",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2rem" }}>
          <img src="/mockmind-logo.png" alt="MockMind AI" style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover" }} />
<span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#ffffff", letterSpacing: "-0.02em" }}>
  MockMind <span style={{ color: "#00f5ff" }}>AI</span>
</span>
        </div>

        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.8rem", marginBottom: "0.4rem" }}>Create Account</h2>
        <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "2rem", fontSize: "0.9rem" }}>Start your interview preparation today</p>

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { name: "name", placeholder: "Full Name", type: "text" },
            { name: "email", placeholder: "Email Address", type: "email" },
            { name: "password", placeholder: "Password (min 6 chars)", type: "password" },
          ].map((field) => (
            <input
              key={field.name}
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={handleChange}
              style={inputStyle}
              onFocus={(e) => (e.target.style.border = "1px solid rgba(0,245,255,0.5)")}
              onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.1)")}
            />
          ))}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "14px",
              borderRadius: "12px",
              background: loading ? "rgba(0,245,255,0.3)" : "linear-gradient(135deg, #00f5ff, #0891b2)",
              color: "#000",
              fontWeight: 700,
              fontSize: "1rem",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "Syne, sans-serif",
              boxShadow: "0 0 20px rgba(0,245,255,0.2)",
              transition: "all 0.2s",
              marginTop: "0.5rem",
            }}
          >
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </div>

        <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#00f5ff", textDecoration: "none", fontWeight: 600 }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}