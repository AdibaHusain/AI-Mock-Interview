import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

// Floating orb component
function Orb({ style }) {
  return (
    <div
      style={{
        position: "absolute",
        borderRadius: "50%",
        filter: "blur(80px)",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

export default function Home() {
  const featuresRef = useRef(null);

  // ✅ FIX 1: useEffect INSIDE component
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: "🎙️",
      title: "Voice-First Answers",
      desc: "Speak naturally like a real interview. Web Speech API captures every word in real-time.",
      color: "#00f5ff",
    },
    {
      icon: "🧠",
      title: "AI-Powered Scoring",
      desc: "Groq's LLaMA model evaluates your answers instantly with scores and detailed feedback.",
      color: "#7c3aed",
    },
    {
      icon: "📊",
      title: "Detailed Reports",
      desc: "Get strengths, weaknesses, and personalized improvement tips after every session.",
      color: "#f59e0b",
    },
    {
      icon: "🎯",
      title: "Role-Specific Questions",
      desc: "Technical, behavioral, system design — tailored exactly to your target job role.",
      color: "#10b981",
    },
  ];

  const stats = [
    { value: "6", label: "Questions per session" },
    { value: "AI", label: "Powered by LLaMA 3.3" },
    { value: "100%", label: "Free to use" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#050816", overflowX: "hidden" }}>
      <Navbar />

      {/* Background Orbs */}
      <Orb style={{ width: "600px", height: "600px", top: "-200px", left: "-100px", background: "rgba(0,245,255,0.06)" }} />
      <Orb style={{ width: "500px", height: "500px", top: "200px", right: "-150px", background: "rgba(124,58,237,0.08)" }} />
      <Orb style={{ width: "400px", height: "400px", bottom: "0", left: "30%", background: "rgba(0,245,255,0.04)" }} />

      {/* Hero Section */}
      {/* ✅ FIX 2: width: 100% + alignItems center for proper centering */}
      <section
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px 2rem 4rem",
          position: "relative",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "50px",
            background: "rgba(0,245,255,0.08)",
            border: "1px solid rgba(0,245,255,0.2)",
            marginBottom: "2rem",
            fontSize: "0.8rem",
            color: "#00f5ff",
            fontWeight: 500,
            animation: "fadeUp 0.9s ease forwards",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#00f5ff",
              animation: "pulse-glow 2s ease-in-out infinite",
              display: "inline-block",
            }}
          />
          Powered by LLaMA 3.3 × Groq
        </div>

        {/* Headline */}
        {/* ✅ FIX 3: Font updated to Outfit, spacing fixed, duplicate maxWidth removed */}
        <h1
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: "clamp(3.2rem, 7vw, 6rem)",
            letterSpacing: "-0.03em",
            wordSpacing: "0.05em",
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: "1.5rem",
            animation: "fadeUp 0.6s 0.1s ease both",
          }}
        >
          Ace Every
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #00f5ff, #7c3aed, #00f5ff)",
              backgroundSize: "200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Interview
          </span>{" "}
          with AI
        </h1>

        {/* ✅ FIX 4: Duplicate maxWidth removed, kept 560px */}
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "1.2rem",
            letterSpacing: "0.015em",
            maxWidth: "560px",
            lineHeight: 1.75,
            marginBottom: "2.5rem",
            animation: "fadeUp 0.6s 0.2s ease both",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          Practice real interview questions, speak your answers, and get
          instant AI feedback — tailored to your dream job.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            justifyContent: "center",
            animation: "fadeUp 0.6s 0.3s ease both",
          }}
        >
          <Link
            to="/register"
            style={{
              padding: "14px 32px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #00f5ff, #0891b2)",
              color: "#000",
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              boxShadow: "0 0 30px rgba(0,245,255,0.3)",
              transition: "transform 0.2s, box-shadow 0.2s",
              fontFamily: "Outfit, sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 0 50px rgba(0,245,255,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 0 30px rgba(0,245,255,0.3)";
            }}
          >
            Start Practicing Free →
          </Link>
          <Link
            to="/login"
            style={{
              padding: "14px 32px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.8)",
              fontWeight: 500,
              fontSize: "1rem",
              textDecoration: "none",
              transition: "all 0.1s",
            }}
          >
            Login
          </Link>
        </div>

        {/* ✅ FIX 5: Stats Row — reveal class added */}
        <div
          className="reveal"
          style={{
            display: "flex",
            gap: "3rem",
            marginTop: "4rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "#00f5ff",
                  textShadow: "0 0 20px rgba(0,245,255,0.5)",
                }}
              >
                {s.value}
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: "4px", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        style={{ padding: "6rem 2rem", maxWidth: "1100px", margin: "0 auto" }}
      >
        <div className="reveal" style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: "1rem",
            }}
          >
            Everything you need to{" "}
            <span style={{ color: "#00f5ff" }}>land the job</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Built for students. Designed to get results.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {/* ✅ FIX 6: reveal class added to each feature card */}
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`reveal reveal-delay-${i + 1}`}
              style={{
                padding: "2rem",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                transition: "all 0.1s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = `1px solid ${f.color}40`;
                e.currentTarget.style.background = `${f.color}08`;
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = `0 20px 40px ${f.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  fontSize: "2.5rem",
                  marginBottom: "1rem",
                  display: "inline-flex",
                  padding: "12px",
                  borderRadius: "14px",
                  background: `${f.color}15`,
                  border: `1px solid ${f.color}30`,
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  marginBottom: "0.6rem",
                  color: f.color,
                  letterSpacing: "-0.01em",
                }}
              >
                {f.title}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", lineHeight: 1.7, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: "4rem 2rem 8rem", textAlign: "center" }}>
        {/* ✅ FIX 7: reveal class added to CTA banner */}
        <div
          className="reveal"
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "4rem 2rem",
            borderRadius: "24px",
            background: "linear-gradient(135deg, rgba(0,245,255,0.08), rgba(124,58,237,0.08))",
            border: "1px solid rgba(0,245,255,0.15)",
            boxShadow: "0 0 60px rgba(0,245,255,0.08)",
          }}
        >
          <h2
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: "1rem",
            }}
          >
            Your first job is one <br />
            <span style={{ color: "#00f5ff" }}>interview away.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "2rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.75 }}>
            Stop worrying. Start practicing. Get confident.
          </p>
          <Link
            to="/register"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #00f5ff, #0891b2)",
              color: "#000",
              fontWeight: 700,
              fontFamily: "Outfit, sans-serif",
              fontSize: "1rem",
              textDecoration: "none",
              boxShadow: "0 0 30px rgba(0,245,255,0.4)",
            }}
          >
            Start for Free — No Card Needed
          </Link>
        </div>
      </section>
    </div>
  );
}