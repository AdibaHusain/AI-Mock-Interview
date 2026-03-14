import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 2rem",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
        background: scrolled
          ? "rgba(5,8,22,0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.06)"
          : "none",
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
  src="/mockmind-logo.png"
  alt="MockMind AI"
  style={{
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    objectFit: "cover",
  }}
/>
         <span
  style={{
    fontFamily: "Outfit, sans-serif",
    fontWeight: 800,
    fontSize: "1.2rem",
    color: "#ffffff",
    letterSpacing: "-0.02em",
  }}
>
  MockMind <span style={{ color: "#00f5ff" }}>AI</span>
</span>
        </div>
      </Link>

      {/* Nav Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        {user ? (
          <>
            <Link
              to="/dashboard"
              style={{
                color: location.pathname === "/dashboard" ? "#00f5ff" : "rgba(255,255,255,0.6)",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 500,
                transition: "color 0.2s",
              }}
            >
              Dashboard
            </Link>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "50px",
                background: "rgba(0,245,255,0.08)",
                border: "1px solid rgba(0,245,255,0.2)",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #00f5ff, #7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#000",
                }}
              >
                {user.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
                {user.name}
              </span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "DM Sans, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(239,68,68,0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(239,68,68,0.1)";
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
            >
              Login
            </Link>
            <Link
              to="/register"
              style={{
                padding: "9px 22px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #00f5ff, #0891b2)",
                color: "#000",
                fontWeight: 700,
                fontSize: "0.85rem",
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}