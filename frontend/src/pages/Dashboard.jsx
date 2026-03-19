import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  LayoutDashboard,
  PlusCircle,
  TrendingUp,
} from "lucide-react";

// ── Stat card ──
function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div
      style={{
        padding: "1.6rem 2rem",
        borderRadius: "18px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(16px)",
        flex: 1,
        minWidth: "160px",
        transition: "border 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = `1px solid ${color}30`;
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", fontFamily: "Plus Jakarta Sans, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
          {label}
        </span>
        <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: `${color}12`, border: `1px solid ${color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={15} color={color} strokeWidth={1.8} />
        </div>
      </div>
      <div style={{ fontFamily: "Outfit, sans-serif", fontSize: "2.4rem", fontWeight: 800, color, lineHeight: 1, textShadow: `0 0 24px ${color}50` }}>
        {value}
      </div>
    </div>
  );
}

// ── Status badge ──
function StatusBadge({ status }) {
  const config = {
    completed:    { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  label: "Completed",   icon: CheckCircle2 },
    "in-progress":{ color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)",  label: "In Progress", icon: Clock3 },
    pending:      { color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.25)", label: "Pending",     icon: Clock3 },
  };
  const s = config[status] || config.pending;
  const Icon = s.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.72rem", padding: "4px 10px", borderRadius: "50px", background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontWeight: 600, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
      <Icon size={11} strokeWidth={2.2} />
      {s.label}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]         = useState({ jobRole: "", jobDescription: "" });
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data } = await API.get("/interview/history");
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleGenerate = async () => {
    if (!form.jobRole || !form.jobDescription) {
      setError("Please fill in both fields to continue.");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const { data } = await API.post("/interview/generate", form);
      navigate(`/interview/${data.interviewId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate interview.");
    } finally {
      setGenerating(false);
    }
  };

  const completedCount = history.filter((i) => i.status === "completed").length;
  const scored         = history.filter((i) => i.overallScore > 0);
  const avgScore       = scored.length > 0
    ? (scored.reduce((a, i) => a + i.overallScore, 0) / scored.length).toFixed(1)
    : "—";

  const inputStyle = {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: "0.92rem",
    outline: "none",
    transition: "border 0.2s, box-shadow 0.2s",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#04070f", paddingTop: "64px" }}>
      <Navbar />

      {/* Ambient glow */}
      <div style={{ position: "fixed", width: "600px", height: "600px", top: "-100px", right: "-200px", borderRadius: "50%", background: "rgba(0,245,255,0.03)", filter: "blur(120px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", width: "400px", height: "400px", bottom: "0", left: "-100px", borderRadius: "50%", background: "rgba(124,58,237,0.03)", filter: "blur(100px)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "3rem 2rem", position: "relative", zIndex: 1 }}>

        {/* ── Page Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.5rem" }}>
              <LayoutDashboard size={18} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", fontFamily: "Plus Jakarta Sans, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Dashboard
              </span>
            </div>
            <h1 style={{ fontFamily: "Outfit, sans-serif", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.3rem" }}>
              Good to see you,{" "}
              <span style={{ color: "#00f5ff" }}>{user?.name?.split(" ")[0]}</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Your interview preparation workspace
            </p>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
          <StatCard label="Total Sessions"  value={history.length || "0"} color="#00f5ff" icon={FileText} />
          <StatCard label="Completed"       value={completedCount || "0"} color="#10b981" icon={CheckCircle2} />
          <StatCard label="Average Score"   value={avgScore !== "—" ? `${avgScore}/10` : "—"} color="#f59e0b" icon={TrendingUp} />
        </div>

        {/* ── New Interview Form ── */}
        <div
          style={{
            padding: "2rem",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(0,245,255,0.1)",
            backdropFilter: "blur(16px)",
            marginBottom: "2.5rem",
          }}
        >
          {/* Form header */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.8rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PlusCircle size={17} color="#00f5ff" strokeWidth={1.8} />
            </div>
            <div>
              <h2 style={{ fontFamily: "Outfit, sans-serif", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
                New Interview Session
              </h2>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem", fontFamily: "Plus Jakarta Sans, sans-serif", marginTop: "1px" }}>
                Paste a job description to generate tailored questions
              </p>
            </div>
          </div>

          {error && (
            <div style={{ padding: "11px 14px", borderRadius: "10px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)", color: "#f87171", fontSize: "0.83rem", marginBottom: "1.2rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <input
              type="text"
              placeholder="Job Role  —  e.g. Frontend Engineer, Data Analyst"
              value={form.jobRole}
              onChange={(e) => setForm({ ...form, jobRole: e.target.value })}
              style={inputStyle}
              onFocus={(e) => { e.target.style.border = "1px solid rgba(0,245,255,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,245,255,0.06)"; }}
              onBlur={(e)  => { e.target.style.border = "1px solid rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
            />
            <textarea
              placeholder="Paste the job description here — the AI will parse it to generate relevant technical, behavioural, and situational questions."
              value={form.jobDescription}
              onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
              rows={5}
              style={{ ...inputStyle, resize: "none", lineHeight: 1.65 }}
              onFocus={(e) => { e.target.style.border = "1px solid rgba(0,245,255,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,245,255,0.06)"; }}
              onBlur={(e)  => { e.target.style.border = "1px solid rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", paddingTop: "0.3rem" }}>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                6 questions will be generated — 2 technical, 2 behavioural, 1 system design, 1 situational
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className={generating ? "" : "gradient-btn"}
                style={generating ? {
                  padding: "12px 28px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "not-allowed",
                } : {
                  padding: "12px 28px",
                  fontSize: "0.9rem",
                }}
              >
                {generating ? "Generating..." : "Generate Interview"}
              </button>
            </div>
          </div>
        </div>

        {/* ── History ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.4rem" }}>
            <CalendarDays size={16} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
            <h2 style={{ fontFamily: "Outfit, sans-serif", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.7)" }}>
              Session History
            </h2>
            {history.length > 0 && (
              <span style={{ fontSize: "0.72rem", padding: "2px 9px", borderRadius: "50px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                {history.length} session{history.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.2)", fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.9rem" }}>
              Loading sessions...
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem", borderRadius: "20px", border: "1px dashed rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.01)" }}>
              <BriefcaseBusiness size={32} color="rgba(255,255,255,0.1)" strokeWidth={1.5} style={{ margin: "0 auto 1rem" }} />
              <p style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.9rem" }}>
                No sessions yet. Start your first interview above.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {history.map((interview, i) => (
                <div
                  key={interview._id}
                  onClick={() => navigate(`/interview/${interview._id}`)}
                  style={{
                    padding: "1.2rem 1.6rem",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(0,245,255,0.18)";
                    e.currentTarget.style.background = "rgba(0,245,255,0.03)";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  {/* Left — icon + info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 0 }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <BriefcaseBusiness size={16} color="rgba(255,255,255,0.35)" strokeWidth={1.8} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: "0.95rem", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {interview.jobRole}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.75rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                        {new Date(interview.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>

                  {/* Right — status + score + arrow */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                    <StatusBadge status={interview.status} />
                    {interview.status === "completed" && (
                      <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#00f5ff", textShadow: "0 0 16px rgba(0,245,255,0.4)", minWidth: "52px", textAlign: "right" }}>
                        {interview.overallScore?.toFixed(1)}<span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>/10</span>
                      </span>
                    )}
                    <ChevronRight size={16} color="rgba(255,255,255,0.2)" strokeWidth={2} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}