import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Mic, BrainCircuit, BarChart3, Target, ArrowRight, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import { AuroraBackground } from "../components/AuroraBackground";

// ── Feature Icon Box ──
function FeatureIcon({ icon: Icon, color }) {
  return (
    <div
      style={{
        width: "52px",
        height: "52px",
        borderRadius: "14px",
        background: `${color}12`,
        border: `1px solid ${color}28`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "1.4rem",
        flexShrink: 0,
      }}
    >
      <Icon size={22} color={color} strokeWidth={1.8} />
    </div>
  );
}

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
      icon: Mic,
      title: "Voice-First Interview",
      desc: "Respond verbally just like a real interview setting. Your speech is transcribed in real-time using the Web Speech API — no typing required.",
      color: "#00f5ff",
      tag: "Speech Recognition",
    },
    {
      icon: BrainCircuit,
      title: "AI Answer Evaluation",
      desc: "Every response is assessed by Groq's LLaMA 3.3 model for depth, accuracy, and communication quality — with a score out of 10.",
      color: "#a78bfa",
      tag: "LLaMA 3.3 × Groq",
    },
    {
      icon: BarChart3,
      title: "Performance Reports",
      desc: "Receive a structured breakdown of your strengths, areas to improve, and a refined version of each answer after every session.",
      color: "#67e8f9",
      tag: "Post-Session Analysis",
    },
    {
      icon: Target,
      title: "Role-Tailored Questions",
      desc: "Questions are generated dynamically from the job description you provide — covering technical, behavioural, system design, and situational formats.",
      color: "#818cf8",
      tag: "Custom JD Parsing",
    },
  ];

  const stats = [
    { value: "6",    label: "Questions per session" },
    { value: "AI",   label: "Powered by LLaMA 3.3"  },
    { value: "100%", label: "Free to use"            },
  ];

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <AuroraBackground />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />

        {/* ── HERO ── */}
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
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00f5ff", display: "inline-block", animation: "pulse-glow 2s ease-in-out infinite" }} />
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
              textShadow: "0 0 80px rgba(0,245,255,0.12)",
            }}
          >
            Ace Every
            <br />
            <span style={{ background: "linear-gradient(90deg, #00f5ff, #a78bfa, #67e8f9)", backgroundSize: "200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Interview
            </span>{" "}
            with AI
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
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
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.6s 0.3s ease both" }}>
            <Link to="/register" className="gradient-btn">
              Start Practicing Free →
            </Link>
            <Link
              to="/login"
              style={{
                padding: "15px 36px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.8)",
                fontWeight: 500,
                fontSize: "1rem",
                textDecoration: "none",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                transition: "all 0.2s",
                backdropFilter: "blur(12px)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            >
              Login
            </Link>
          </div>

          {/* Stats */}
          <div className="reveal" style={{ display: "flex", gap: "3.5rem", marginTop: "4.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "Outfit, sans-serif", fontSize: "2.2rem", fontWeight: 800, color: "#00f5ff", textShadow: "0 0 24px rgba(0,245,255,0.5)" }}>
                  {s.value}
                </div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", marginTop: "6px", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Scroll hint */}
          <div style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "rgba(255,255,255,0.18)", fontSize: "0.72rem", fontFamily: "Plus Jakarta Sans, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", animation: "float 3s ease-in-out infinite" }}>
            <span>scroll</span>
            <span style={{ fontSize: "1rem" }}>↓</span>
          </div>
        </section>

        <div className="section-divider" />

        {/* ── FEATURES ── */}
        <section ref={featuresRef} style={{ padding: "7rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>

          {/* Section header */}
          <div className="reveal" style={{ marginBottom: "4rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", borderRadius: "50px", background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.2)", marginBottom: "1.2rem" }}>
              <Sparkles size={13} color="#818cf8" />
              <span style={{ fontSize: "0.75rem", color: "#818cf8", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "Outfit, sans-serif" }}>
                Platform Capabilities
              </span>
            </div>
            <h2
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: "0.8rem",
                maxWidth: "600px",
              }}
            >
              Everything you need to{" "}
              <span style={{ color: "#00f5ff" }}>land the role</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif", maxWidth: "480px", lineHeight: 1.7 }}>
              A structured mock interview experience designed to build real confidence — not just familiarity with questions.
            </p>
          </div>

          {/* Feature cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`reveal reveal-delay-${i + 1}`}
                style={{
                  padding: "2rem",
                  borderRadius: "20px",
                  background: "rgba(4,7,15,0.6)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(20px)",
                  transition: "all 0.3s ease",
                  cursor: "default",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = `1px solid ${f.color}35`;
                  e.currentTarget.style.background = "rgba(4,7,15,0.78)";
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = `0 24px 48px rgba(0,0,0,0.3), 0 0 0 1px ${f.color}18`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
                  e.currentTarget.style.background = "rgba(4,7,15,0.6)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Icon */}
                <FeatureIcon icon={f.icon} color={f.color} />

                {/* Tag */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "0.7rem" }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      padding: "3px 10px",
                      borderRadius: "50px",
                      background: `${f.color}10`,
                      border: `1px solid ${f.color}25`,
                      color: f.color,
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      fontFamily: "Outfit, sans-serif",
                    }}
                  >
                    {f.tag}
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    marginBottom: "0.7rem",
                    color: "rgba(255,255,255,0.92)",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.3,
                  }}
                >
                  {f.title}
                </h3>

                {/* Description */}
                <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "0.875rem", lineHeight: 1.75, fontFamily: "Plus Jakarta Sans, sans-serif", flex: 1 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

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
              border: "1px solid rgba(0,245,255,0.1)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 0 80px rgba(0,245,255,0.05), inset 0 0 60px rgba(0,245,255,0.02)",
            }}
          >
            <h2 style={{ fontFamily: "Outfit, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
              Your first job is one <br />
              <span style={{ color: "#00f5ff" }}>interview away.</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.38)", marginBottom: "2.2rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.75 }}>
              Stop worrying. Start practicing. Get confident.
            </p>
            <Link to="/register" className="gradient-btn">
              Start for Free — No Card Needed
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}