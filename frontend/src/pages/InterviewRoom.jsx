import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import {
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  ChevronRight,
  CheckCircle,
  CircleDot,
  MessageSquareText,
  Lightbulb,
  ArrowRight,
  BarChart2,
  RefreshCw,
  Trophy,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const typeConfig = {
  technical:     { label: "Technical",     color: "#00f5ff", bg: "rgba(0,245,255,0.07)" },
  behavioral:    { label: "Behavioural",   color: "#a78bfa", bg: "rgba(167,139,250,0.07)" },
  system_design: { label: "System Design", color: "#f59e0b", bg: "rgba(245,158,11,0.07)" },
  situational:   { label: "Situational",   color: "#10b981", bg: "rgba(16,185,129,0.07)" },
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

  useEffect(() => {
    if (!interview) return;
    const q = interview.questions[currentIndex];
    if (q && !q.userAnswer) {
      const timer = setTimeout(() => speakText(q.question), 600);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, interview]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const speak = (voices) => {
      const utter       = new SpeechSynthesisUtterance(text);
      utter.lang        = "en-US";
      utter.rate        = 0.85;
      utter.pitch       = 1;
      utter.volume      = 1;
      const preferred   =
        voices.find((v) => v.name === "Google US English") ||
        voices.find((v) => v.name === "Microsoft Aria Online (Natural) - English (United States)") ||
        voices.find((v) => v.name === "Samantha") ||
        voices.find((v) => v.name.includes("Google") && v.lang === "en-US") ||
        voices.find((v) => v.lang === "en-US");
      if (preferred) utter.voice = preferred;
      utter.onstart = () => setIsSpeaking(true);
      utter.onend   = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
    };
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) speak(voices);
    else window.speechSynthesis.onvoiceschanged = () => speak(window.speechSynthesis.getVoices());
  };

  const startListening = () => {
    setMicError("");
    setTranscript("");
    setRecordingDone(false);
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setMicError("Speech recognition is only supported in Chrome."); return; }
    const recognition           = new SpeechRecognition();
    recognition.lang            = "en-US";
    recognition.continuous      = true;
    recognition.interimResults  = true;
    recognition.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) text += event.results[i][0].transcript;
      setTranscript(text);
    };
    recognition.onerror = (e) => {
      setIsListening(false);
      if (e.error === "not-allowed") setMicError("Microphone access denied. Please allow mic permissions.");
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

  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const { data } = await API.post(`/interview/${id}/answer`, { questionIndex: currentIndex, userAnswer: transcript });
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
      speakText(`Interview complete. Your overall score is ${data.overallScore} out of 10.`);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingReport(false);
    }
  };

  // ── Score color ──
  const scoreColor = (s) => s >= 7 ? "#10b981" : s >= 4 ? "#f59e0b" : "#ef4444";
  const scoreLabel = (s) => s >= 7 ? "Strong Response" : s >= 4 ? "Satisfactory" : "Needs Improvement";

  // ─────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#04070f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "44px", height: "44px", border: "2px solid rgba(0,245,255,0.15)", borderTop: "2px solid #00f5ff", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.9rem" }}>Loading interview...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!interview) return (
    <div style={{ minHeight: "100vh", background: "#04070f", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
      Interview session not found.
    </div>
  );

  // ─────────────────────────────────────────────
  // REPORT VIEW
  // ─────────────────────────────────────────────
  if (report) {
    const sc = report.overallScore;
    const c  = scoreColor(sc);
    return (
      <div style={{ minHeight: "100vh", background: "#04070f", paddingTop: "64px" }}>
        <Navbar />
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "3rem 2rem" }}>

          {/* Score hero */}
          <div style={{ textAlign: "center", padding: "3rem 2rem", borderRadius: "24px", background: `linear-gradient(135deg, ${c}08, rgba(255,255,255,0.01))`, border: `1px solid ${c}20`, marginBottom: "2rem" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: `${c}15`, border: `1px solid ${c}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <Trophy size={24} color={c} strokeWidth={1.8} />
            </div>
            <h1 style={{ fontFamily: "Outfit, sans-serif", fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.4rem", letterSpacing: "-0.02em" }}>Interview Complete</h1>
            <p style={{ color: "rgba(255,255,255,0.35)", marginBottom: "1.8rem", fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.9rem" }}>{interview.jobRole}</p>
            <div style={{ fontFamily: "Outfit, sans-serif", fontSize: "5rem", fontWeight: 800, color: c, textShadow: `0 0 40px ${c}60`, lineHeight: 1 }}>
              {sc}<span style={{ fontSize: "1.8rem", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>/10</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem", marginTop: "0.6rem", fontFamily: "Plus Jakarta Sans, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {scoreLabel(sc)}
            </p>
          </div>

          {/* Summary */}
          <div style={{ padding: "1.6rem", borderRadius: "16px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "1.2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.9rem" }}>
              <MessageSquareText size={15} color="rgba(255,255,255,0.4)" strokeWidth={1.8} />
              <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Overall Summary</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8, fontSize: "0.93rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{report.summary}</p>
          </div>

          {/* Strengths */}
          <div style={{ padding: "1.6rem", borderRadius: "16px", background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)", marginBottom: "1.2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
              <TrendingUp size={15} color="#10b981" strokeWidth={1.8} />
              <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#10b981", letterSpacing: "0.06em", textTransform: "uppercase" }}>Strengths</span>
            </div>
            {report.strengths.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "0.6rem", color: "rgba(255,255,255,0.6)", fontSize: "0.88rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.6 }}>
                <CheckCircle size={14} color="#10b981" strokeWidth={2} style={{ marginTop: "3px", flexShrink: 0 }} />
                {s}
              </div>
            ))}
          </div>

          {/* Areas to improve */}
          <div style={{ padding: "1.6rem", borderRadius: "16px", background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)", marginBottom: "1.2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
              <AlertCircle size={15} color="#f87171" strokeWidth={1.8} />
              <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#f87171", letterSpacing: "0.06em", textTransform: "uppercase" }}>Areas to Improve</span>
            </div>
            {report.weaknesses.map((w, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "0.6rem", color: "rgba(255,255,255,0.6)", fontSize: "0.88rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.6 }}>
                <ArrowRight size={14} color="#f87171" strokeWidth={2} style={{ marginTop: "3px", flexShrink: 0 }} />
                {w}
              </div>
            ))}
          </div>

          {/* Tips */}
          <div style={{ padding: "1.6rem", borderRadius: "16px", background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.15)", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
              <Lightbulb size={15} color="#00f5ff" strokeWidth={1.8} />
              <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#00f5ff", letterSpacing: "0.06em", textTransform: "uppercase" }}>Improvement Recommendations</span>
            </div>
            {report.improvementTips.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "0.6rem", color: "rgba(255,255,255,0.6)", fontSize: "0.88rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.6 }}>
                <ChevronRight size={14} color="#00f5ff" strokeWidth={2} style={{ marginTop: "3px", flexShrink: 0 }} />
                {t}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="gradient-btn"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Return to Dashboard
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
    <div style={{ minHeight: "100vh", background: "#04070f", paddingTop: "64px" }}>
      <Navbar />

      {/* Ambient */}
      <div style={{ position: "fixed", width: "500px", height: "500px", top: "10%", right: "-150px", borderRadius: "50%", background: "rgba(0,245,255,0.025)", filter: "blur(120px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "2.5rem 2rem" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: "2px" }}>{interview.jobRole}</div>
            <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.78rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Question {currentIndex + 1} of {totalQuestions}
            </div>
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", gap: "5px" }}>
            {interview.questions.map((q, i) => (
              <div key={i} style={{
                width: "30px", height: "30px", borderRadius: "8px",
                border: i === currentIndex
                  ? "1.5px solid #00f5ff"
                  : q.userAnswer ? "1.5px solid rgba(16,185,129,0.5)" : "1.5px solid rgba(255,255,255,0.1)",
                background: i === currentIndex
                  ? "rgba(0,245,255,0.08)"
                  : q.userAnswer ? "rgba(16,185,129,0.08)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}>
                {q.userAnswer
                  ? <CheckCircle size={13} color="#10b981" strokeWidth={2.2} />
                  : <span style={{ fontSize: "0.65rem", fontWeight: 700, color: i === currentIndex ? "#00f5ff" : "rgba(255,255,255,0.25)", fontFamily: "Outfit, sans-serif" }}>{i + 1}</span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", marginBottom: "2rem", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #00f5ff, #7c3aed)", borderRadius: "2px", transition: "width 0.5s ease", boxShadow: "0 0 8px rgba(0,245,255,0.4)" }} />
        </div>

        {/* ── Question Card ── */}
        <div style={{ padding: "2rem", borderRadius: "20px", background: "rgba(255,255,255,0.025)", border: `1px solid ${qType.color}22`, marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "0.68rem", padding: "3px 11px", borderRadius: "50px", background: qType.bg, border: `1px solid ${qType.color}30`, color: qType.color, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "Outfit, sans-serif" }}>
                {qType.label}
              </span>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Q{currentIndex + 1}</span>
            </div>

            {!alreadyAnswered && (
              <button
                onClick={() => speakText(currentQuestion.question)}
                disabled={isSpeaking}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "6px 14px", borderRadius: "50px",
                  background: isSpeaking ? "rgba(0,245,255,0.08)" : "rgba(255,255,255,0.05)",
                  border: isSpeaking ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(255,255,255,0.1)",
                  color: isSpeaking ? "#00f5ff" : "rgba(255,255,255,0.4)",
                  fontSize: "0.78rem", cursor: isSpeaking ? "not-allowed" : "pointer",
                  fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                <Volume2 size={13} strokeWidth={2} />
                {isSpeaking ? "Speaking..." : "Replay"}
              </button>
            )}
          </div>

          <p style={{ fontSize: "1.1rem", lineHeight: 1.75, color: "rgba(255,255,255,0.88)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 400 }}>
            {currentQuestion.question}
          </p>
        </div>

        {/* ── ALREADY ANSWERED ── */}
        {alreadyAnswered ? (
          <div style={{ padding: "1.6rem", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "1.5rem" }}>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.72rem", letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "Outfit, sans-serif", marginBottom: "0.7rem" }}>Your Response</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.92rem", lineHeight: 1.75, marginBottom: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              {currentQuestion.userAnswer}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontFamily: "Outfit, sans-serif", fontSize: "1.6rem", fontWeight: 800, color: "#00f5ff" }}>
                {currentQuestion.aiScore}/10
              </span>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", lineHeight: 1.6, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                {currentQuestion.aiFeedback}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── VOICE RECORDING ── */}
            <div style={{
              padding: "2.5rem 2rem",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.02)",
              border: isListening
                ? "1px solid rgba(239,68,68,0.25)"
                : recordingDone
                ? "1px solid rgba(0,245,255,0.2)"
                : "1px solid rgba(255,255,255,0.06)",
              marginBottom: "1rem",
              textAlign: "center",
              transition: "border 0.3s",
            }}>

              {/* Mic ring */}
              <div style={{
                width: "80px", height: "80px", borderRadius: "50%",
                margin: "0 auto 1.5rem",
                background: isListening
                  ? "rgba(239,68,68,0.08)"
                  : recordingDone
                  ? "rgba(0,245,255,0.07)"
                  : "rgba(255,255,255,0.03)",
                border: isListening
                  ? "1.5px solid rgba(239,68,68,0.4)"
                  : recordingDone
                  ? "1.5px solid rgba(0,245,255,0.35)"
                  : "1.5px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s",
                boxShadow: isListening ? "0 0 24px rgba(239,68,68,0.2)" : recordingDone ? "0 0 24px rgba(0,245,255,0.15)" : "none",
              }}>
                {isListening
                  ? <MicOff size={26} color="#f87171" strokeWidth={1.6} />
                  : recordingDone
                  ? <CheckCircle size={26} color="#00f5ff" strokeWidth={1.6} />
                  : <Mic size={26} color="rgba(255,255,255,0.3)" strokeWidth={1.6} />
                }
              </div>

              {/* Status */}
              <p style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: "0.4rem", color: isListening ? "#f87171" : recordingDone ? "#00f5ff" : "rgba(255,255,255,0.5)", letterSpacing: "-0.01em" }}>
                {isListening ? "Recording in progress" : recordingDone ? "Response captured" : "Ready to record your answer"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem", fontFamily: "Plus Jakarta Sans, sans-serif", marginBottom: "1.4rem" }}>
                {isListening ? "Speak clearly — press stop when done" : recordingDone ? "Review your transcript below or re-record" : "Press the button below and begin speaking"}
              </p>

              {/* Transcript */}
              {transcript && (
                <div style={{ margin: "0 0 1.4rem", padding: "1rem 1.2rem", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", textAlign: "left" }}>
                  <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.68rem", letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "Outfit, sans-serif", marginBottom: "0.5rem" }}>Transcript</p>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.88rem", lineHeight: 1.7, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                    {transcript}
                  </p>
                </div>
              )}

              {micError && (
                <p style={{ color: "#f87171", fontSize: "0.82rem", marginBottom: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {micError}
                </p>
              )}

              {!recordingDone && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  style={{
                    padding: "11px 30px",
                    borderRadius: "50px",
                    background: isListening ? "rgba(239,68,68,0.1)" : "linear-gradient(135deg, #00f5ff, #0891b2)",
                    border: isListening ? "1px solid rgba(239,68,68,0.35)" : "none",
                    color: isListening ? "#f87171" : "#000",
                    fontWeight: 700, fontSize: "0.88rem",
                    cursor: "pointer",
                    fontFamily: "Outfit, sans-serif",
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    transition: "all 0.2s",
                    boxShadow: isListening ? "none" : "0 0 20px rgba(0,245,255,0.25)",
                  }}
                >
                  {isListening ? <><MicOff size={14} strokeWidth={2} /> Stop Recording</> : <><Mic size={14} strokeWidth={2} /> Start Speaking</>}
                </button>
              )}
            </div>

            {/* Submit */}
            {recordingDone && !feedback && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", marginBottom: "1rem" }}>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !transcript.trim()}
                  className={submitting || !transcript.trim() ? "" : "gradient-btn"}
                  style={submitting || !transcript.trim() ? {
                    width: "100%", padding: "13px", borderRadius: "12px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.3)",
                    fontFamily: "Outfit, sans-serif", fontWeight: 700,
                    fontSize: "0.95rem", cursor: "not-allowed",
                  } : { width: "100%", justifyContent: "center" }}
                >
                  {submitting ? "Evaluating your response..." : "Submit Response"}
                </button>

                <button
                  onClick={() => { setRecordingDone(false); setTranscript(""); }}
                  style={{
                    width: "100%", padding: "12px", borderRadius: "12px",
                    background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.3)", fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontSize: "0.88rem", cursor: "pointer", transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <RefreshCw size={13} strokeWidth={2} /> Re-record Answer
                </button>
              </div>
            )}

            {/* ── AI FEEDBACK ── */}
            {feedback && (
              <div style={{ marginBottom: "1rem" }}>

                {/* Score card */}
                <div style={{
                  padding: "1.8rem",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  marginBottom: "1rem",
                }}>
                  {/* Score row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.4rem", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem", letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "Outfit, sans-serif", marginBottom: "0.4rem" }}>
                        Score
                      </p>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span style={{ fontFamily: "Outfit, sans-serif", fontSize: "3rem", fontWeight: 800, color: scoreColor(feedback.score), textShadow: `0 0 24px ${scoreColor(feedback.score)}60`, lineHeight: 1 }}>
                          {feedback.score}
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Outfit, sans-serif", fontSize: "1.2rem" }}>/10</span>
                      </div>
                    </div>
                    <div style={{
                      padding: "6px 16px",
                      borderRadius: "50px",
                      background: `${scoreColor(feedback.score)}12`,
                      border: `1px solid ${scoreColor(feedback.score)}30`,
                      color: scoreColor(feedback.score),
                      fontFamily: "Outfit, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      letterSpacing: "0.04em",
                    }}>
                      {scoreLabel(feedback.score)}
                    </div>
                  </div>

                  {/* Score bar */}
                  <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", marginBottom: "1.6rem", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(feedback.score / 10) * 100}%`, background: `linear-gradient(90deg, ${scoreColor(feedback.score)}, ${scoreColor(feedback.score)}aa)`, borderRadius: "2px", transition: "width 0.8s ease" }} />
                  </div>

                  {/* Feedback text */}
                  <div style={{ marginBottom: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "0.7rem" }}>
                      <MessageSquareText size={13} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "Outfit, sans-serif" }}>
                        Evaluator Feedback
                      </p>
                    </div>
                    <p style={{
                      color: "rgba(255,255,255,0.75)",
                      fontSize: "0.93rem",
                      lineHeight: 1.8,
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      padding: "1rem 1.2rem",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      {feedback.feedback}
                    </p>
                  </div>
                </div>

                {/* Refined answer card */}
                {feedback.refinedAnswer && (
                  <div style={{
                    padding: "1.8rem",
                    borderRadius: "16px",
                    background: "rgba(0,245,255,0.025)",
                    border: "1px solid rgba(0,245,255,0.15)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "0.5rem" }}>
                      <Lightbulb size={13} color="#00f5ff" strokeWidth={1.8} />
                      <p style={{ color: "#00f5ff", fontSize: "0.7rem", letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "Outfit, sans-serif", fontWeight: 700 }}>
                        Model Answer
                      </p>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem", marginBottom: "1.1rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.6 }}>
                      A comprehensive version of how this question could have been answered — use this to identify gaps in your response.
                    </p>
                    <p style={{
                      color: "rgba(255,255,255,0.78)",
                      fontSize: "0.93rem",
                      lineHeight: 1.85,
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      padding: "1.2rem 1.4rem",
                      borderRadius: "10px",
                      background: "rgba(0,245,255,0.03)",
                      border: "1px solid rgba(0,245,255,0.1)",
                      borderLeft: "2px solid rgba(0,245,255,0.5)",
                    }}>
                      {feedback.refinedAnswer}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Navigation ── */}
        {(feedback || alreadyAnswered) && (
          <div style={{ marginTop: "1rem" }}>
            {!isLastQuestion ? (
              <button
                onClick={handleNext}
                className="gradient-btn"
                style={{ width: "100%", justifyContent: "center", gap: "8px" }}
              >
                Next Question <ChevronRight size={16} strokeWidth={2.2} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={generatingReport}
                style={{
                  width: "100%", padding: "14px",
                  borderRadius: "12px",
                  background: generatingReport ? "rgba(16,185,129,0.1)" : "linear-gradient(135deg, #10b981, #059669)",
                  color: generatingReport ? "rgba(255,255,255,0.35)" : "#fff",
                  fontWeight: 700, fontFamily: "Outfit, sans-serif",
                  fontSize: "1rem", border: "none",
                  cursor: generatingReport ? "not-allowed" : "pointer",
                  boxShadow: generatingReport ? "none" : "0 0 20px rgba(16,185,129,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
              >
                <BarChart2 size={16} strokeWidth={2} />
                {generatingReport ? "Generating Report..." : "Complete & View Report"}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}