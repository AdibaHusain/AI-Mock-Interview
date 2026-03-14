import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuroraBackground } from "../components/AuroraBackground";

export default function Home() {
  const featuresRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
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
      color: "#a78bfa",
    },
    {
      icon: "📊",
      title: "Detailed Reports",
      desc: "Get strengths, weaknesses, and personalized improvement tips after every session.",
      color: "#67e8f9",
    },
    {
      icon: "🎯",
      title: "Role-Specific Questions",
      desc: "Technical, behavioral, system design — tailored exactly to your target job role.",
      color: "#818cf8",
    },
  ];

  const stats = [
    { value: "6",    label: "Questions per session" },
    { value: "AI",   label: "Powered by LLaMA 3.3" },
    { value: "100%", label: "Free to use" },
  ];

  return (
    // ✅ Aurora renders as fixed canvas — visible through ALL sections while scrolling
    <div style={{ position: "relative", minHeight: "100vh" }}>

      {/* Fixed aurora background — stays while scrolling */}
      <AuroraBackground />

      {/* All content sits above the canvas via z-index */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />

        {/* ── HERO SECTION ── */}
        <section
          style={{
            minHeight: "100vh",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "80px 2rem 5rem",
            position: "relative",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 18px",
              borderRadius: "50px",
              background: "rgba(0,245,255,0.08)",
              border: "1px solid rgba(0,245,255,0.2)",
              marginBottom: "2rem",
              fontSize: "0.8rem",
              color: "#00f5ff",
              fontWeight: 500,
              backdropFilter: "blur(12px)",
              animation: "fadeUp 0.6s ease forwards",
            }}
          >
            <span
              style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#00f5ff", display: "inline-block",
                animation: "pulse-glow 2s ease-in-out infinite",
              }}
            />
            Powered by LLaMA 3.3 × Groq
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: "clamp(3.2rem, 7vw, 6.5rem)",
              letterSpacing: "-0.03em",
              fontWeight: 800,
              lineHeight: 1.05,
              marginBottom: "1.5rem",
              animation: "fadeUp 0.6s 0.1s ease both",
              textShadow: "0 0 80px rgba(0,245,255,0.15)",
            }}
          >
            Ace Every
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #00f5ff, #a78bfa, #67e8f9)",
                backgroundSize: "200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Interview
            </span>{" "}
            with AI
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: "1.2rem",
              letterSpacing: "0.01em",
              maxWidth: "540px",
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
                padding: "15px 36px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #00f5ff, #0891b2)",
                color: "#000",
                fontWeight: 700,
                fontSize: "1rem",
                textDecoration: "none",
                boxShadow: "0 0 40px rgba(0,245,255,0.35)",
                transition: "transform 0.2s, box-shadow 0.2s",
                fontFamily: "Outfit, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 0 60px rgba(0,245,255,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 0 40px rgba(0,245,255,0.35)";
              }}
            >
              Start Practicing Free →
            </Link>
            <Link
              to="/login"
              style={{
                padding: "15px 36px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.85)",
                fontWeight: 500,
                fontSize: "1rem",
                textDecoration: "none",
                transition: "all 0.2s",
                backdropFilter: "blur(12px)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            >
              Login
            </Link>
          </div>

          {/* Stats Row */}
          <div
            className="reveal"
            style={{
              display: "flex",
              gap: "3.5rem",
              marginTop: "4.5rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {stats.map((s, i) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: "2.2rem",
                    fontWeight: 800,
                    color: "#00f5ff",
                    textShadow: "0 0 24px rgba(0,245,255,0.5)",
                  }}
                >
                  {s.value}
                </div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: "6px", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Scroll hint */}
          <div
            style={{
              position: "absolute",
              bottom: "2.5rem",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              color: "rgba(255,255,255,0.2)",
              fontSize: "0.72rem",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            <span>scroll</span>
            <span style={{ fontSize: "1rem" }}>↓</span>
          </div>
        </section>

        {/* Divider */}
        <div className="section-divider" />

        {/* ── FEATURES SECTION ── */}
        {/* Glass backdrop so cards are readable over aurora */}
        <section
          ref={featuresRef}
          style={{
            padding: "7rem 2rem",
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <div className="reveal" style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: "1rem",
                textShadow: "0 0 60px rgba(0,245,255,0.1)",
              }}
            >
              Everything you need to{" "}
              <span style={{ color: "#00f5ff" }}>land the job</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
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
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`reveal reveal-delay-${i + 1}`}
                style={{
                  padding: "2rem",
                  borderRadius: "20px",
                  background: "rgba(4,7,15,0.6)",   // dark glass — readable over aurora
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(20px)",
                  transition: "all 0.3s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = `1px solid ${f.color}40`;
                  e.currentTarget.style.background = `rgba(4,7,15,0.75)`;
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = `0 20px 40px ${f.color}18`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(4,7,15,0.6)";
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
                    background: `${f.color}12`,
                    border: `1px solid ${f.color}25`,
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

        {/* Divider */}
        <div className="section-divider" />

        {/* ── CTA BANNER ── */}
        <section style={{ padding: "4rem 2rem 8rem", textAlign: "center" }}>
          <div
            className="reveal"
            style={{
              maxWidth: "680px",
              margin: "0 auto",
              padding: "4rem 2rem",
              borderRadius: "28px",
              background: "rgba(4,7,15,0.65)",
              border: "1px solid rgba(0,245,255,0.12)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 0 80px rgba(0,245,255,0.06), inset 0 0 60px rgba(0,245,255,0.02)",
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
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                marginBottom: "2rem",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                lineHeight: 1.75,
              }}
            >
              Stop worrying. Start practicing. Get confident.
            </p>
            <Link
              to="/register"
              style={{
                display: "inline-block",
                padding: "15px 40px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #00f5ff, #0891b2)",
                color: "#000",
                fontWeight: 700,
                fontFamily: "Outfit, sans-serif",
                fontSize: "1rem",
                textDecoration: "none",
                boxShadow: "0 0 40px rgba(0,245,255,0.35)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 0 60px rgba(0,245,255,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 0 40px rgba(0,245,255,0.35)";
              }}
            >
              Start for Free — No Card Needed
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}