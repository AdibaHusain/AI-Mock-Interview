import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const statusConfig = {
  completed:   { color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)",  label: "Completed" },
  "in-progress": { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", label: "In Progress" },
  pending:     { color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.3)", label: "Pending" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ jobRole: "", jobDescription: "" });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

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
      setError("Please fill in both fields");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const { data } = await API.post("/interview/generate", form);
      navigate(`/interview/${data.interviewId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate interview");
    } finally {
      setGenerating(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border 0.2s",
    fontFamily: "DM Sans, sans-serif",
  };

  const completedCount = history.filter((i) => i.status === "completed").length;
  const avgScore =
    history.filter((i) => i.overallScore > 0).length > 0
      ? (history.filter((i) => i.overallScore > 0).reduce((acc, i) => acc + i.overallScore, 0) /
          history.filter((i) => i.overallScore > 0).length).toFixed(1)
      : "—";

  return (
    <div style={{ minHeight: "100vh", background: "#050816", paddingTop: "64px" }}>
      <Navbar />

      {/* Background */}
      <div style={{ position: "fixed", width: "600px", height: "600px", top: 0, right: "-200px", borderRadius: "50%", background: "rgba(0,245,255,0.03)", filter: "blur(100px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 2rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem", animation: "fadeUp 0.5s ease both" }}>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Hey, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>Ready to crush your next interview?</p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1rem",
            marginBottom: "2.5rem",
            animation: "fadeUp 0.5s 0.1s ease both",
          }}
        >
          {[
            { label: "Total Sessions", value: history.length, color: "#00f5ff" },
            { label: "Completed", value: completedCount, color: "#10b981" },
            { label: "Avg Score", value: avgScore !== "—" ? `${avgScore}/10` : "—", color: "#f59e0b" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: "1.5rem",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800, color: stat.color, textShadow: `0 0 20px ${stat.color}60` }}>
                {stat.value}
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: "6px" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Generate New Interview */}
        <div
          style={{
            padding: "2rem",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(0,245,255,0.12)",
            marginBottom: "2.5rem",
            animation: "fadeUp 0.5s 0.2s ease both",
          }}
        >
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.5rem" }}>🚀</span> Start New Interview
          </h2>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: "0.85rem", marginBottom: "1rem" }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="text"
              placeholder="Job Role (e.g. Frontend Developer, Data Analyst)"
              value={form.jobRole}
              onChange={(e) => setForm({ ...form, jobRole: e.target.value })}
              style={inputStyle}
              onFocus={(e) => (e.target.style.border = "1px solid rgba(0,245,255,0.4)")}
              onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.08)")}
            />
            <textarea
              placeholder="Paste Job Description here — AI will tailor questions specifically for this role..."
              value={form.jobDescription}
              onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
              rows={4}
              style={{ ...inputStyle, resize: "none" }}
              onFocus={(e) => (e.target.style.border = "1px solid rgba(0,245,255,0.4)")}
              onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.08)")}
            />
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                padding: "14px 28px",
                borderRadius: "12px",
                background: generating ? "rgba(0,245,255,0.2)" : "linear-gradient(135deg, #00f5ff, #0891b2)",
                color: generating ? "rgba(255,255,255,0.5)" : "#000",
                fontWeight: 700,
                fontSize: "0.95rem",
                border: "none",
                cursor: generating ? "not-allowed" : "pointer",
                fontFamily: "Syne, sans-serif",
                alignSelf: "flex-start",
                boxShadow: generating ? "none" : "0 0 20px rgba(0,245,255,0.25)",
                transition: "all 0.2s",
              }}
            >
              {generating ? "✨ Generating Questions..." : "Generate Interview ✨"}
            </button>
          </div>
        </div>

        {/* History */}
        <div style={{ animation: "fadeUp 0.5s 0.3s ease both" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.2rem" }}>
            📋 Past Interviews
          </h2>

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.3)" }}>
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 2rem",
                borderRadius: "20px",
                border: "1px dashed rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎯</div>
              <p>No interviews yet. Start your first one above!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              {history.map((interview, i) => {
                const s = statusConfig[interview.status] || statusConfig.pending;
                return (
                  <div
                    key={interview._id}
                    onClick={() => navigate(`/interview/${interview._id}`)}
                    style={{
                      padding: "1.2rem 1.5rem",
                      borderRadius: "16px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      animation: `fadeUp 0.4s ${i * 0.05}s ease both`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(0,245,255,0.2)";
                      e.currentTarget.style.background = "rgba(0,245,255,0.03)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, marginBottom: "4px" }}>
                        {interview.jobRole}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem" }}>
                        {new Date(interview.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span style={{ fontSize: "0.75rem", padding: "4px 12px", borderRadius: "50px", background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontWeight: 600 }}>
                        {s.label}
                      </span>
                      {interview.status === "completed" && (
                        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#00f5ff", textShadow: "0 0 15px rgba(0,245,255,0.5)" }}>
                          {interview.overallScore?.toFixed(1)}/10
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}