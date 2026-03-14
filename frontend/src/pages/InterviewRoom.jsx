import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const typeConfig = {
  technical:     { label: "Technical",     color: "#00f5ff", bg: "rgba(0,245,255,0.08)" },
  behavioral:    { label: "Behavioral",    color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
  system_design: { label: "System Design", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  situational:   { label: "Situational",   color: "#10b981", bg: "rgba(16,185,129,0.08)" },
};

export default function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview]               = useState(null);
  const [currentIndex, setCurrentIndex]         = useState(0);
  const [transcript, setTranscript]             = useState("");
  const [isListening, setIsListening]           = useState(false);
  const [isSpeaking, setIsSpeaking]             = useState(false);
  const [feedback, setFeedback]                 = useState(null);
  const [submitting, setSubmitting]             = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport]                     = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [micError, setMicError]                 = useState("");
  const [recordingDone, setRecordingDone]       = useState(false);

  const recognitionRef = useRef(null);

  // ── Load interview ──
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const { data } = await API.get(`/interview/${id}`);
        setInterview(data);
        const firstUnanswered = data.questions.findIndex((q) => !q.userAnswer);
        setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id]);

  // ── Auto-speak question when index changes ──
  useEffect(() => {
    if (!interview) return;
    const q = interview.questions[currentIndex];
    if (q && !q.userAnswer) {
      const timer = setTimeout(() => speakText(q.question), 600);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, interview]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  // ─────────────────────────────────────────────
  // TEXT TO SPEECH
  // ─────────────────────────────────────────────
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const speak = (voices) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang   = "en-US";
      utter.rate   = 0.85;
      utter.pitch  = 1;
      utter.volume = 1;

      const preferred =
        voices.find((v) => v.name === "Google US English") ||
        voices.find((v) => v.name === "Microsoft Aria Online (Natural) - English (United States)") ||
        voices.find((v) => v.name === "Samantha") ||
        voices.find((v) => v.name.includes("Google") && v.lang === "en-US") ||
        voices.find((v) => v.lang === "en-US" && !v.name.includes("Male")) ||
        voices.find((v) => v.lang === "en-US");

      if (preferred) utter.voice = preferred;

      utter.onstart = () => setIsSpeaking(true);
      utter.onend   = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utter);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      speak(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        speak(window.speechSynthesis.getVoices());
      };
    }
  };

  // ─────────────────────────────────────────────
  // SPEECH TO TEXT
  // ─────────────────────────────────────────────
  const startListening = () => {
    setMicError("");
    setTranscript("");
    setRecordingDone(false);
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError("Speech recognition sirf Chrome mein kaam karta hai!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang           = "en-US";
    recognition.continuous     = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onerror = (e) => {
      console.error("Mic error:", e.error);
      setIsListening(false);
      if (e.error === "not-allowed") setMicError("Mic access allow karo browser settings mein!");
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setRecordingDone(true);
  };

  // ─────────────────────────────────────────────
  // SUBMIT ANSWER
  // ─────────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const { data } = await API.post(`/interview/${id}/answer`, {
        questionIndex: currentIndex,
        userAnswer: transcript,
      });
      setFeedback(data);
      speakText(`You scored ${data.score} out of 10. ${data.feedback}`);
      const updated = await API.get(`/interview/${id}`);
      setInterview(updated.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    window.speechSynthesis?.cancel();
    setFeedback(null);
    setTranscript("");
    setRecordingDone(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleFinish = async () => {
    setGeneratingReport(true);
    try {
      const { data } = await API.post(`/interview/${id}/report`);
      setReport(data);
      speakText(`Interview complete! Your overall score is ${data.overallScore} out of 10.`);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingReport(false);
    }
  };

  // ─────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#050816", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", border: "3px solid rgba(0,245,255,0.2)", borderTop: "3px solid #00f5ff", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Loading Interview...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!interview) return (
    <div style={{ minHeight: "100vh", background: "#050816", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171" }}>
      Interview not found.
    </div>
  );

  // ─────────────────────────────────────────────
  // REPORT VIEW
  // ─────────────────────────────────────────────
  if (report) {
    const scoreColor = report.overallScore >= 7 ? "#10b981" : report.overallScore >= 4 ? "#f59e0b" : "#ef4444";
    return (
      <div style={{ minHeight: "100vh", background: "#050816", paddingTop: "64px" }}>
        <Navbar />
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "3rem 2rem" }}>

          {/* Score Hero */}
          <div style={{ textAlign: "center", padding: "3rem", borderRadius: "24px", background: `linear-gradient(135deg, ${scoreColor}10, rgba(255,255,255,0.02))`, border: `1px solid ${scoreColor}30`, marginBottom: "2rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🏆</div>
            <h1 style={{ fontFamily: "Outfit, sans-serif", fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Interview Complete!</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{interview.jobRole}</p>
            <div style={{ fontFamily: "Outfit, sans-serif", fontSize: "5rem", fontWeight: 800, color: scoreColor, textShadow: `0 0 40px ${scoreColor}80`, lineHeight: 1 }}>
              {report.overallScore}
              <span style={{ fontSize: "2rem", color: "rgba(255,255,255,0.3)" }}>/10</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Overall Score</p>
          </div>

          {/* Summary */}
          <div style={{ padding: "1.5rem", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "1.5rem" }}>
            <h3 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, marginBottom: "0.8rem", color: "rgba(255,255,255,0.8)" }}>📋 Summary</h3>
            <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.75, fontSize: "0.95rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{report.summary}</p>
          </div>

          {/* Strengths */}
          <div style={{ padding: "1.5rem", borderRadius: "16px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", marginBottom: "1.5rem" }}>
            <h3 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, marginBottom: "1rem", color: "#10b981" }}>✅ Strengths</h3>
            {report.strengths.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "0.6rem", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                <span style={{ color: "#10b981" }}>▸</span> {s}
              </div>
            ))}
          </div>

          {/* Weaknesses */}
          <div style={{ padding: "1.5rem", borderRadius: "16px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: "1.5rem" }}>
            <h3 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, marginBottom: "1rem", color: "#f87171" }}>⚠️ Areas to Improve</h3>
            {report.weaknesses.map((w, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "0.6rem", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                <span style={{ color: "#f87171" }}>▸</span> {w}
              </div>
            ))}
          </div>

          {/* Tips */}
          <div style={{ padding: "1.5rem", borderRadius: "16px", background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.2)", marginBottom: "2rem" }}>
            <h3 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, marginBottom: "1rem", color: "#00f5ff" }}>💡 Improvement Tips</h3>
            {report.improvementTips.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "0.6rem", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                <span style={{ color: "#00f5ff" }}>▸</span> {t}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "linear-gradient(135deg, #00f5ff, #0891b2)", color: "#000", fontWeight: 700, fontFamily: "Outfit, sans-serif", fontSize: "1rem", border: "none", cursor: "pointer", boxShadow: "0 0 30px rgba(0,245,255,0.3)" }}
          >
            Back to Dashboard 🏠
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // INTERVIEW VIEW
  // ─────────────────────────────────────────────
  const totalQuestions  = interview.questions.length;
  const isLastQuestion  = currentIndex === totalQuestions - 1;
  const currentQuestion = interview.questions[currentIndex];
  const alreadyAnswered = !!currentQuestion?.userAnswer;
  const progress        = ((currentIndex + 1) / totalQuestions) * 100;
  const qType           = typeConfig[currentQuestion?.type] || typeConfig.technical;

  return (
    <div style={{ minHeight: "100vh", background: "#050816", paddingTop: "64px" }}>
      <Navbar />

      <div style={{ position: "fixed", width: "500px", height: "500px", top: "10%", right: "-150px", borderRadius: "50%", background: "rgba(0,245,255,0.03)", filter: "blur(100px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "2.5rem 2rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>{interview.jobRole}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", marginTop: "2px", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Question {currentIndex + 1} of {totalQuestions}
            </div>
          </div>

          {/* Question dots */}
          <div style={{ display: "flex", gap: "6px" }}>
            {interview.questions.map((q, i) => (
              <div key={i} style={{
                width: "32px", height: "32px", borderRadius: "8px",
                border: i === currentIndex ? "2px solid #00f5ff" : q.userAnswer ? "2px solid rgba(16,185,129,0.5)" : "2px solid rgba(255,255,255,0.1)",
                background: i === currentIndex ? "rgba(0,245,255,0.1)" : q.userAnswer ? "rgba(16,185,129,0.1)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.7rem", fontWeight: 700,
                color: i === currentIndex ? "#00f5ff" : q.userAnswer ? "#10b981" : "rgba(255,255,255,0.3)",
              }}>
                {q.userAnswer ? "✓" : i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", marginBottom: "2rem", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #00f5ff, #7c3aed)", borderRadius: "2px", transition: "width 0.5s ease", boxShadow: "0 0 10px rgba(0,245,255,0.5)" }} />
        </div>

        {/* Question Card */}
        <div style={{ padding: "2rem", borderRadius: "20px", background: "rgba(255,255,255,0.03)", border: `1px solid ${qType.color}25`, marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "0.72rem", padding: "4px 12px", borderRadius: "50px", background: qType.bg, border: `1px solid ${qType.color}40`, color: qType.color, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                {qType.label}
              </span>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem" }}>Q{currentIndex + 1}</span>
            </div>

            {/* Replay button */}
            {!alreadyAnswered && (
              <button
                onClick={() => speakText(currentQuestion.question)}
                disabled={isSpeaking}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "6px 14px", borderRadius: "50px",
                  background: isSpeaking ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.06)",
                  border: isSpeaking ? "1px solid rgba(0,245,255,0.4)" : "1px solid rgba(255,255,255,0.12)",
                  color: isSpeaking ? "#00f5ff" : "rgba(255,255,255,0.5)",
                  fontSize: "0.8rem", cursor: isSpeaking ? "not-allowed" : "pointer",
                  fontFamily: "Plus Jakarta Sans, sans-serif", transition: "all 0.2s",
                }}
              >
                {isSpeaking ? "🔊 Speaking..." : "🔊 Replay"}
              </button>
            )}
          </div>

          <p style={{ fontSize: "1.15rem", lineHeight: 1.7, color: "rgba(255,255,255,0.9)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            {currentQuestion.question}
          </p>
        </div>

        {/* ── ALREADY ANSWERED ── */}
        {alreadyAnswered ? (
          <div style={{ padding: "1.5rem", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "1.5rem" }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", marginBottom: "0.6rem" }}>🎙️ Your Answer</p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif", fontStyle: "italic" }}>
              "{currentQuestion.userAnswer}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontFamily: "Outfit, sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#00f5ff", textShadow: "0 0 20px rgba(0,245,255,0.5)" }}>
                {currentQuestion.aiScore}/10
              </span>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", lineHeight: 1.6, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                {currentQuestion.aiFeedback}
              </p>
            </div>
          </div>

        ) : (
          <>
            {/* ── VOICE RECORDING UI ── */}
            <div style={{ padding: "2rem", borderRadius: "20px", background: "rgba(255,255,255,0.02)", border: isListening ? "1px solid rgba(239,68,68,0.3)" : recordingDone ? "1px solid rgba(0,245,255,0.2)" : "1px solid rgba(255,255,255,0.07)", marginBottom: "1rem", textAlign: "center", transition: "border 0.3s" }}>

              {/* Mic circle */}
              <div style={{
                width: "100px", height: "100px", borderRadius: "50%",
                margin: "0 auto 1.5rem",
                background: isListening ? "rgba(239,68,68,0.12)" : recordingDone ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.04)",
                border: isListening ? "2px solid rgba(239,68,68,0.5)" : recordingDone ? "2px solid rgba(0,245,255,0.4)" : "2px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2.8rem", transition: "all 0.3s",
                animation: isListening ? "pulse-glow 1.2s ease-in-out infinite" : "none",
                boxShadow: isListening ? "0 0 30px rgba(239,68,68,0.3)" : "none",
              }}>
                {isListening ? "🎙️" : recordingDone ? "✅" : "🎤"}
              </div>

              {/* Status */}
              <p style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem", color: isListening ? "#f87171" : recordingDone ? "#00f5ff" : "rgba(255,255,255,0.6)" }}>
                {isListening ? "Recording... speak your answer" : recordingDone ? "Answer recorded!" : "Ready to answer?"}
              </p>

              {/* Transcript preview */}
              {transcript && (
                <div style={{ margin: "1rem 0", padding: "12px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", textAlign: "left" }}>
                  <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", lineHeight: 1.65, fontFamily: "Plus Jakarta Sans, sans-serif", fontStyle: "italic" }}>
                    "{transcript}"
                  </p>
                </div>
              )}

              {micError && (
                <p style={{ color: "#f87171", fontSize: "0.85rem", marginTop: "0.8rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  ⚠️ {micError}
                </p>
              )}

              {/* Mic button */}
              {!recordingDone && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  style={{
                    marginTop: "1.2rem", padding: "12px 32px", borderRadius: "50px",
                    background: isListening ? "rgba(239,68,68,0.15)" : "linear-gradient(135deg, #00f5ff, #0891b2)",
                    border: isListening ? "1px solid rgba(239,68,68,0.5)" : "none",
                    color: isListening ? "#f87171" : "#000",
                    fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
                    fontFamily: "Outfit, sans-serif", transition: "all 0.2s",
                    boxShadow: isListening ? "none" : "0 0 20px rgba(0,245,255,0.3)",
                  }}
                >
                  {isListening ? "⏹ Stop Recording" : "🎙️ Start Speaking"}
                </button>
              )}
            </div>

            {/* Submit button */}
            {recordingDone && !feedback && (
              <button
                onClick={handleSubmitAnswer}
                disabled={submitting || !transcript.trim()}
                style={{
                  width: "100%", padding: "14px", borderRadius: "12px",
                  background: submitting ? "rgba(124,58,237,0.3)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: submitting ? "rgba(255,255,255,0.4)" : "#fff",
                  fontWeight: 700, fontFamily: "Outfit, sans-serif", fontSize: "1rem",
                  border: "none", cursor: submitting ? "not-allowed" : "pointer",
                  marginBottom: "1rem",
                  boxShadow: submitting ? "none" : "0 0 20px rgba(124,58,237,0.35)",
                  transition: "all 0.2s",
                }}
              >
                {submitting ? "🤖 AI is evaluating..." : "Submit Answer →"}
              </button>
            )}

            {/* Re-record */}
            {recordingDone && !feedback && (
              <button
                onClick={() => { setRecordingDone(false); setTranscript(""); }}
                style={{
                  width: "100%", padding: "12px", borderRadius: "12px",
                  background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.4)", fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s",
                }}
              >
                🔄 Re-record Answer
              </button>
            )}

            {/* ── AI FEEDBACK + REFINED ANSWER ── */}
            {feedback && (
              <div style={{ marginBottom: "1rem" }}>

                {/* Score + Feedback card */}
                <div style={{ padding: "1.8rem", borderRadius: "16px", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.3)", marginBottom: "1rem" }}>

                  {/* Score row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.2rem" }}>
                    <span style={{
                      fontFamily: "Outfit, sans-serif", fontSize: "2.8rem", fontWeight: 800,
                      color: feedback.score >= 7 ? "#10b981" : feedback.score >= 4 ? "#f59e0b" : "#ef4444",
                      textShadow: `0 0 20px ${feedback.score >= 7 ? "#10b98180" : feedback.score >= 4 ? "#f59e0b80" : "#ef444480"}`,
                    }}>
                      {feedback.score}/10
                    </span>
                    <span style={{
                      fontSize: "0.85rem", padding: "5px 14px", borderRadius: "50px", fontWeight: 700,
                      background: feedback.score >= 7 ? "rgba(16,185,129,0.12)" : feedback.score >= 4 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                      color: feedback.score >= 7 ? "#10b981" : feedback.score >= 4 ? "#f59e0b" : "#ef4444",
                      border: `1px solid ${feedback.score >= 7 ? "rgba(16,185,129,0.3)" : feedback.score >= 4 ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)"}`,
                    }}>
                      {feedback.score >= 7 ? "🌟 Excellent!" : feedback.score >= 4 ? "👍 Good Effort" : "💪 Needs Work"}
                    </span>
                  </div>

                  <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "1.2rem" }} />

                  {/* Written Feedback */}
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.6rem", fontFamily: "Outfit, sans-serif" }}>
                    💬 AI Feedback
                  </p>
                  <p style={{
                    color: "rgba(255,255,255,0.88)", fontSize: "1rem", lineHeight: 1.75,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    background: "rgba(255,255,255,0.03)",
                    padding: "14px 16px", borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}>
                    {feedback.feedback}
                  </p>
                </div>

                {/* Refined Answer card */}
                {feedback.refinedAnswer && (
                  <div style={{ padding: "1.8rem", borderRadius: "16px", background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.2)" }}>
                    <p style={{ color: "#00f5ff", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.6rem", fontFamily: "Outfit, sans-serif" }}>
                      ✨ How You Could Have Answered
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", marginBottom: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      A refined version of your answer with all the important details added
                    </p>
                    <p style={{
                      color: "rgba(255,255,255,0.85)", fontSize: "0.97rem", lineHeight: 1.8,
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      background: "rgba(0,245,255,0.04)",
                      padding: "16px 18px", borderRadius: "10px",
                      border: "1px solid rgba(0,245,255,0.1)",
                      borderLeft: "3px solid #00f5ff",
                    }}>
                      {feedback.refinedAnswer}
                    </p>
                  </div>
                )}

              </div>
            )}
          </>
        )}

        {/* ── NAVIGATION ── */}
        {(feedback || alreadyAnswered) && (
          <div style={{ marginTop: "1rem" }}>
            {!isLastQuestion ? (
              <button
                onClick={handleNext}
                style={{
                  width: "100%", padding: "14px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #00f5ff, #0891b2)",
                  color: "#000", fontWeight: 700, fontFamily: "Outfit, sans-serif",
                  fontSize: "1rem", border: "none", cursor: "pointer",
                  boxShadow: "0 0 20px rgba(0,245,255,0.25)",
                }}
              >
                Next Question →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={generatingReport}
                style={{
                  width: "100%", padding: "14px", borderRadius: "12px",
                  background: generatingReport ? "rgba(16,185,129,0.2)" : "linear-gradient(135deg, #10b981, #059669)",
                  color: generatingReport ? "rgba(255,255,255,0.4)" : "#fff",
                  fontWeight: 700, fontFamily: "Outfit, sans-serif",
                  fontSize: "1rem", border: "none",
                  cursor: generatingReport ? "not-allowed" : "pointer",
                  boxShadow: generatingReport ? "none" : "0 0 20px rgba(16,185,129,0.3)",
                }}
              >
                {generatingReport ? "Generating Report..." : "Finish & Get Report"}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}