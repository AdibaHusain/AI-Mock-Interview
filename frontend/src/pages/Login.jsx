import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

// ── Particle canvas background ──
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x      = Math.random() * canvas.width;
        this.y      = Math.random() * canvas.height;
        this.size   = Math.random() * 1.8 + 0.4;
        this.speedX = (Math.random() - 0.5) * 0.35;
        this.speedY = (Math.random() - 0.5) * 0.35;
        this.alpha  = Math.random() * 0.35 + 0.05;
        // cyan / purple / white mix to match aurora
        const colors = [
          `rgba(0, 245, 255, ${this.alpha})`,
          `rgba(167, 139, 250, ${this.alpha})`,
          `rgba(255, 255, 255, ${this.alpha * 0.6})`,
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width)  this.x = 0;
        if (this.x < 0)             this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0)             this.y = canvas.height;
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const count = Math.min(120, Math.floor((canvas.width * canvas.height) / 12000));
    const particles = Array.from({ length: count }, () => new Particle());

    let rafId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => { p.update(); p.draw(); });
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100%", height: "100%",
        zIndex: 0, pointerEvents: "none",
      }}
    />
  );
}

// ── Floating label input ──
function FloatingInput({ id, label, type = "text", value, onChange, error, rightSlot }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div style={{ position: "relative", marginBottom: "1.4rem" }}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: rightSlot ? "20px 48px 8px 16px" : "20px 16px 8px",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.05)",
          border: error
            ? "1px solid rgba(239,68,68,0.6)"
            : focused
            ? "1px solid rgba(0,245,255,0.5)"
            : "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
          fontSize: "0.95rem",
          outline: "none",
          transition: "border 0.2s, box-shadow 0.2s",
          boxShadow: focused
            ? "0 0 0 3px rgba(0,245,255,0.07)"
            : "none",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          boxSizing: "border-box",
        }}
        autoComplete={id}
      />
      {/* Floating label */}
      <label
        htmlFor={id}
        style={{
          position: "absolute",
          left: "16px",
          top: active ? "7px" : "50%",
          transform: active ? "none" : "translateY(-50%)",
          fontSize: active ? "0.68rem" : "0.92rem",
          color: error
            ? "rgba(239,68,68,0.8)"
            : focused
            ? "#00f5ff"
            : "rgba(255,255,255,0.35)",
          transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
          pointerEvents: "none",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          letterSpacing: active ? "0.06em" : "0",
          textTransform: active ? "uppercase" : "none",
        }}
      >
        {label}
      </label>
      {/* Right slot (eye icon etc.) */}
      {rightSlot && (
        <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }}>
          {rightSlot}
        </div>
      )}
      {/* Error message */}
      {error && (
        <p style={{ color: "rgba(239,68,68,0.8)", fontSize: "0.75rem", marginTop: "5px", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Main Login Page ──
export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [emailErr, setEmailErr]   = useState("");

  const validateEmail = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (e.target.value && !validateEmail(e.target.value)) {
      setEmailErr("Please enter a valid email");
    } else {
      setEmailErr("");
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    if (!validateEmail(email)) { setEmailErr("Please enter a valid email"); return; }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#04070f", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden" }}>

      {/* Particles */}
      <ParticleCanvas />

      {/* Ambient glows */}
      <div style={{ position: "fixed", width: "500px", height: "500px", top: "-150px", right: "-150px", borderRadius: "50%", background: "rgba(124,58,237,0.07)", filter: "blur(100px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", width: "400px", height: "400px", bottom: "-100px", left: "-100px", borderRadius: "50%", background: "rgba(0,245,255,0.05)", filter: "blur(100px)", pointerEvents: "none", zIndex: 0 }} />

      {/* Card */}
      <div
        style={{
          position: "relative", zIndex: 1,
          width: "100%", maxWidth: "420px",
          padding: "2.5rem",
          borderRadius: "24px",
          background: "rgba(4,7,15,0.75)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 0 80px rgba(0,245,255,0.05), 0 32px 64px rgba(0,0,0,0.4)",
          animation: "fadeUp 0.5s ease forwards",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2rem" }}>
          <img src="/mockmind-logo.png" alt="MockMind AI" style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover" }} />
          <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#fff", letterSpacing: "-0.02em" }}>
            MockMind <span style={{ color: "#00f5ff" }}>AI</span>
          </span>
        </div>

        <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.9rem", marginBottom: "0.3rem", letterSpacing: "-0.02em" }}>
          Welcome Back
        </h2>
        <p style={{ color: "rgba(255,255,255,0.35)", marginBottom: "2rem", fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
          Sign in to continue your prep
        </p>

        {/* Global error */}
        {error && (
          <div style={{ padding: "11px 14px", borderRadius: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", fontSize: "0.85rem", marginBottom: "1.2rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Inputs */}
        <FloatingInput
          id="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={handleEmailChange}
          error={emailErr}
        />

        <FloatingInput
          id="password"
          label="Password"
          type={showPass ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", padding: 0 }}
            >
              {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          }
        />

        {/* Forgot password */}
        <div style={{ textAlign: "right", marginTop: "-0.8rem", marginBottom: "1.5rem" }}>
          <a href="#" style={{ color: "rgba(0,245,255,0.6)", fontSize: "0.82rem", textDecoration: "none", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Forgot password?
          </a>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "14px",
            borderRadius: "12px",
            background: loading
              ? "rgba(0,245,255,0.25)"
              : "linear-gradient(135deg, #00f5ff, #0891b2)",
            color: loading ? "rgba(255,255,255,0.5)" : "#000",
            fontWeight: 700,
            fontSize: "1rem",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "Outfit, sans-serif",
            boxShadow: loading ? "none" : "0 0 24px rgba(0,245,255,0.3)",
            transition: "all 0.2s",
            letterSpacing: "-0.01em",
          }}
        >
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "1.6rem 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            don't have an account?
          </span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
        </div>

        <Link
          to="/register"
          style={{
            display: "block", width: "100%", padding: "13px",
            borderRadius: "12px", textAlign: "center",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "rgba(255,255,255,0.7)",
            fontWeight: 600, fontSize: "0.95rem",
            textDecoration: "none",
            fontFamily: "Outfit, sans-serif",
            transition: "all 0.2s",
            boxSizing: "border-box",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}