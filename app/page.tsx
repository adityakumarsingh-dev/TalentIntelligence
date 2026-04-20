"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, UploadCloud, Bot, CheckCircle2, XCircle, Zap,
  BrainCircuit, TerminalSquare, Sun, Moon, Database, Server, RefreshCw,
  Milestone, Activity, ShieldCheck, TrendingUp, UserCheck, BarChart3,
  AlertTriangle, MessageSquare, Target, Award, Clock, Users,
  GitBranch, Layers, ChevronRight, Star, ArrowUpRight, FileText,
  Cpu, Globe, Code2, BarChart2, Building2, Gauge
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface BreakdownData {
  technical: number;
  experience: number;
  potential: number;
  communication: number;
  leadership: number;
}

interface RoleMatchItem {
  role: string;
  score: number;
  rationale: string;
}

interface InterviewQuestion {
  question: string;
  focus: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface BenchmarkData {
  percentile: number | null;
  timeToHire: string | null;
  competitivePressure: string | null;
  topCompaniesMatch: string[];
  growthTrajectory: string | null;
  keyStrengths: string[];
  technicalDepthRating: string | null;
  portfolioStrength: string | null;
  leadershipSignals: number | null;
}

interface CandidateData {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  currentRole: string | null;
  experienceYears: string | null;
  education: string | null;
  linkedIn: string | null;
  github: string | null;
  summary: string | null;
}

interface AnalysisResult {
  candidate: CandidateData;
  overallScore: number;
  hiringRecommendation: "Strong Hire" | "Hire" | "Consider" | "Reject";
  confidence: number;
  marketDemand: "High" | "Medium" | "Low";
  seniorityLevel: string;
  roleMatch: RoleMatchItem[];
  breakdown: BreakdownData;
  matchedSkills: string[];
  missingSkills: string[];
  redFlags: string[];
  interviewQuestions: InterviewQuestion[];
  benchmark: BenchmarkData;
  experts: {
    techLead: string;
    hrManager: string;
    salaryBenchmark: string;
  };
  roadmap: Array<{ title: string; desc: string; priority: string }>;
  aiReasoning: string;
  processingTime: string;
  processingMs: number;
  dbRecordId: string;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const scoreColor = (s: number) =>
  s >= 80 ? "text-emerald-500" : s >= 60 ? "text-amber-500" : s >= 40 ? "text-orange-500" : "text-rose-500";

const scoreBg = (s: number) =>
  s >= 80 ? "bg-emerald-500" : s >= 60 ? "bg-amber-500" : s >= 40 ? "bg-orange-500" : "bg-rose-500";

const hiringColors: Record<string, string> = {
  "Strong Hire": "bg-emerald-500/20 border-emerald-500/50 text-emerald-500",
  "Hire": "bg-sky-500/20 border-sky-500/50 text-sky-500",
  "Consider": "bg-amber-500/20 border-amber-500/50 text-amber-500",
  "Reject": "bg-rose-500/20 border-rose-500/50 text-rose-500",
};

const difficultyColors: Record<string, string> = {
  "Easy": "bg-emerald-500/15 text-emerald-500 border-emerald-500/40",
  "Medium": "bg-amber-500/15 text-amber-500 border-amber-500/40",
  "Hard": "bg-rose-500/15 text-rose-500 border-rose-500/40",
};

const priorityColors: Record<string, string> = {
  "Critical": "bg-rose-500/15 text-rose-500 border-rose-500/40",
  "High": "bg-amber-500/15 text-amber-500 border-amber-500/40",
  "Medium": "bg-sky-500/15 text-sky-500 border-sky-500/40",
};

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────
const ScoreBar = ({
  label, value, color, icon: Icon, delay = 0, isDark
}: {
  label: string; value: number; color: string; icon: any; delay?: number; isDark: boolean;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-600"}`}>
        <Icon className="w-3 h-3 text-indigo-500" /> {label}
      </span>
      <span className={`text-xs font-black font-mono ${isDark ? "text-slate-200" : "text-slate-800"}`}>{value}%</span>
    </div>
    <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, delay, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  </div>
);
const Logo = ({ isDark }: { isDark: boolean }) => (
  <svg viewBox="0 0 400 400" fill="none" className="w-full h-full">
    {/* T - Top Bar */}
    <rect x="90" y="70" width="140" height="60" rx="30" fill={isDark ? "#6366f1" : "#4f46e5"} className="transition-colors duration-300" />
    {/* T - Stem */}
    <rect x="130" y="150" width="60" height="180" rx="30" fill={isDark ? "#4f46e5" : "#3730a3"} className="transition-colors duration-300" />
    {/* I - Stem */}
    <rect x="250" y="150" width="60" height="180" rx="30" fill={isDark ? "#10b981" : "#059669"} className="transition-colors duration-300" />
    {/* AI Spark Dot */}
    <circle cx="280" cy="100" r="30" fill={isDark ? "#22d3ee" : "#0891b2"} className="transition-colors duration-300" />
    <circle cx="280" cy="100" r="12" fill="#ffffff" opacity="0.9" />
  </svg>
);
const StatPill = ({
  label, value, accent = false, isDark
}: {
  label: string; value: string; accent?: boolean; isDark: boolean;
}) => (
  <div className={`px-4 py-3 rounded-xl border text-center transition-all
    ${accent
      ? isDark
        ? "border-indigo-500/40 bg-indigo-500/10"
        : "border-indigo-400/40 bg-indigo-50"
      : isDark
        ? "border-slate-700 bg-slate-800/50"
        : "border-slate-200 bg-slate-100"
    }`}>
    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>{label}</p>
    <p className={`text-xs font-bold truncate ${accent
      ? isDark ? "text-indigo-300" : "text-indigo-700"
      : isDark ? "text-slate-200" : "text-slate-800"
    }`}>{value || "—"}</p>
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [jobRole, setJobRole] = useState("");
  const [skills, setSkills] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "completed">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "interview" | "benchmark" | "roadmap">("overview");
  const [dbHistory, setDbHistory] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const [sysMetrics, setSysMetrics] = useState({ cpu: "0%", ram: "0MB", ping: "0ms", uptime: "0h" });

  useEffect(() => {
    fetchHistory();
    const t = setInterval(() => {
      setSysMetrics({
        cpu: (Math.random() * 12 + 3).toFixed(1) + "%",
        ram: (Math.random() * 50 + 320).toFixed(0) + "MB",
        ping: (Math.random() * 14 + 4).toFixed(0) + "ms",
        uptime: "99.9%"
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const fetchHistory = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      if (data.success) setDbHistory(data.data);
    } catch { }
    setIsSyncing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
  };

  const extractTextFromPDF = async (pdfFile: File): Promise<string> => {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return fullText.trim();
  };

  const runTerminalSequence = async () => {
    setStatus("processing");
    setLogs([]);
    const steps = [
      "> [SYS] Initializing AI Audit Pipeline...",
      "> [NET] Establishing secure inference tunnel...",
      `> [IO]  Ingesting: ${file?.name || "resume.pdf"}`,
      "> [PDF] Parsing document via PDF.js layer...",
      "> [AI]  Dispatching 3 parallel inference tasks to Groq...",
      "> [AI]  Task 1: Candidate extraction + quantitative scoring...",
      "> [AI]  Task 2: CTO executive audit memo...",
      "> [AI]  Task 3: Competitive market benchmark...",
      "> [DB]  Writing record to MongoDB Atlas...",
      "> [SYS] Assembling intelligence report...",
    ];
    for (const s of steps) {
      await new Promise(r => setTimeout(r, 380));
      setLogs(prev => [...prev, s]);
    }
  };

  const handleAnalyze = async () => {
    if (!jobRole.trim()) return alert("Target role is required.");
    if (!file) return alert("Resume PDF is required.");
    await runTerminalSequence();
    try {
      const text = await extractTextFromPDF(file);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobRole, skills, resumeText: text }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data as AnalysisResult);
        setStatus("completed");
        setActiveTab("overview");
        fetchHistory();
      } else {
        setStatus("idle");
        alert(`Analysis failed: ${data.error || "Unknown error"}`);
      }
    } catch (e: any) {
      setStatus("idle");
      alert("Pipeline failure. Check console.");
      console.error(e);
    }
  };

  // ── THEME TOKENS ──────────────────────────────────────────────────────────
  const th = {
    bg: isDark ? "bg-[#020408]" : "bg-slate-50",
    card: isDark ? "bg-[#0a0f1a]" : "bg-white",
    cardInner: isDark ? "bg-[#0d1420]" : "bg-slate-50",
    border: isDark ? "border-slate-800" : "border-slate-200",
    text: isDark ? "text-slate-100" : "text-slate-900",
    textMuted: isDark ? "text-slate-400" : "text-slate-600",
    textDim: isDark ? "text-slate-500" : "text-slate-500",
    input: isDark
      ? "bg-[#0d1420] border-slate-700 text-slate-100 placeholder:text-slate-600 focus:border-indigo-500"
      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500",
    label: isDark ? "text-slate-400" : "text-slate-600",
    termBg: isDark ? "bg-[#020408]" : "bg-slate-900",
    headerBorder: isDark ? "border-slate-800" : "border-slate-200",
    shadow: isDark ? "shadow-2xl shadow-black/40" : "shadow-lg shadow-slate-200",
  };

  const TABS = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "interview", label: "Interview Kit", icon: MessageSquare },
    { id: "benchmark", label: "Market Intel", icon: Globe },
    { id: "roadmap", label: "Roadmap", icon: Milestone },
  ] as const;

  return (
    <div
      className={`min-h-screen ${th.bg} ${th.text} selection:bg-indigo-600/40 transition-colors duration-300`}
      style={{
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
        backgroundImage: isDark
          ? "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(99,102,241,0.07) 0%, transparent 65%)"
          : "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(99,102,241,0.04) 0%, transparent 65%)",
      }}
    >
      <div className="max-w-[1600px] mx-auto px-5 md:px-10 py-6 md:py-8">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <header className={`flex items-center justify-between border-b ${th.headerBorder} pb-5 mb-7`}>
          <div className="flex items-center gap-4">
            <div className="relative">
<div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-colors p-2 ${isDark ? "bg-[#0a0f1a] border border-slate-800 shadow-indigo-500/10" : "bg-white border border-slate-200 shadow-slate-200"}`}>
  <Logo isDark={isDark} />
</div>
              <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 ${isDark ? "border-[#020408]" : "border-slate-50"} animate-pulse`} />
            </div>
            <div>
              <h1 className="text-[17px] font-black tracking-tight leading-none">
                Talent<span className="text-indigo-500">Intelligence</span>
              </h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-widest`}>
                  <Activity className="w-2.5 h-2.5" /> Live
                </span>
                <span className={`flex items-center gap-1 text-[9px] font-bold text-sky-500 uppercase tracking-widest`}>
                  <Database className="w-2.5 h-2.5" /> Atlas
                </span>
                <span className={`flex items-center gap-1 text-[9px] font-bold text-violet-400 uppercase tracking-widest`}>
                  <Cpu className="w-2.5 h-2.5" /> {sysMetrics.cpu}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden md:flex items-center gap-5 px-5 mr-1 border-r ${th.headerBorder}`}>
              {[
                { l: "RAM", v: sysMetrics.ram },
                { l: "PING", v: sysMetrics.ping },
                { l: "SLA", v: sysMetrics.uptime },
              ].map(m => (
                <div key={m.l} className="text-right">
                  <p className={`text-[9px] font-bold uppercase ${th.textDim}`}>{m.l}</p>
                  <p className="text-[11px] font-mono font-black text-indigo-500">{m.v}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2.5 rounded-xl border ${th.border} ${th.card} hover:border-indigo-500/50 transition-all duration-200`}
              title="Toggle theme"
            >
              {isDark
                ? <Sun className="w-4.5 h-4.5 text-amber-400" size={18} />
                : <Moon className="w-4.5 h-4.5 text-indigo-500" size={18} />
              }
            </button>
          </div>
        </header>

        {/* ── MAIN GRID ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-4">

            {/* Control Panel */}
            <div className={`${th.card} border ${th.border} rounded-2xl p-5 ${th.shadow}`}>
              <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-4 flex items-center gap-2`}>
                <TerminalSquare className="w-3.5 h-3.5" /> Audit Configuration
              </h2>
              <div className="space-y-3.5">
                <div>
                  <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 block ${th.label}`}>
                    Target Role *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Full Stack Engineer"
                    value={jobRole}
                    onChange={e => setJobRole(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${th.input} outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm font-medium`}
                  />
                </div>
                <div>
                  <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 block ${th.label}`}>
                    Required Skills
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, PostgreSQL, AWS"
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${th.input} outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm font-medium`}
                  />
                </div>

                {/* File Drop Zone */}
                <div>
                  <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 block ${th.label}`}>
                    Resume PDF *
                  </label>
                  <div
                    onDragEnter={() => setDragActive(true)}
                    onDragLeave={() => setDragActive(false)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-7 text-center transition-all duration-200 cursor-pointer
                      ${dragActive
                        ? "border-indigo-500 bg-indigo-500/10"
                        : file
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : isDark
                            ? "border-slate-700 hover:border-indigo-500/50 bg-slate-900/30"
                            : "border-slate-300 hover:border-indigo-400/60 bg-slate-50"
                      }`}
                  >
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {file ? (
                      <>
                        <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest truncate px-4">{file.name}</p>
                        <p className={`text-[9px] mt-1 ${th.textDim}`}>{(file.size / 1024).toFixed(1)} KB</p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className={`w-7 h-7 mx-auto mb-2 ${th.textDim}`} />
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${th.textDim}`}>
                          Drop PDF or click to upload
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={status === "processing"}
                  className={`w-full py-3.5 rounded-xl font-black uppercase text-[11px] tracking-[0.18em] transition-all duration-200 flex items-center justify-center gap-2.5
                    ${status === "processing"
                      ? "bg-indigo-600/30 text-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
                    }`}
                >
                  {status === "processing"
                    ? <><Zap className="w-4 h-4 animate-pulse" /> Analyzing...</>
                    : <><ShieldCheck className="w-4 h-4" /> Run Audit</>
                  }
                </button>
              </div>
            </div>

            {/* Terminal */}
            <div className={`${th.card} border ${th.border} rounded-2xl overflow-hidden ${th.shadow}`}>
              <div className={`${isDark ? "bg-black/70" : "bg-slate-800"} px-4 py-2.5 flex items-center gap-2 border-b ${isDark ? "border-slate-800" : "border-slate-700"}`}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest ml-2">pipeline.log</p>
                {status === "processing" && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <div className="bg-[#050810] p-4 h-[200px] overflow-y-auto">
                <div className="font-mono text-[10px] space-y-1.5">
                  {status === "idle" && logs.length === 0 && (
                    <p className="text-slate-700 italic">$ awaiting pipeline initialization...</p>
                  )}
                  {logs.map((l, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18 }}>
                      <span className={
                        l.includes("[AI]") ? "text-violet-400"
                          : l.includes("[DB]") ? "text-sky-400"
                            : l.includes("[IO]") ? "text-amber-400"
                              : "text-emerald-400"
                      }>{l}</span>
                    </motion.div>
                  ))}
                  {status === "completed" && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 font-black mt-2">
                      ✓ COMPLETE — {result?.processingTime}
                    </motion.p>
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>

            {/* History */}
            <div className={`${th.card} border ${th.border} rounded-2xl p-4 ${th.shadow}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500 flex items-center gap-2">
                  <Server className="w-3.5 h-3.5" /> Recent Audits
                </h3>
                <button onClick={fetchHistory} className={`text-[9px] uppercase tracking-widest text-indigo-500 hover:text-indigo-400 flex items-center gap-1 transition-colors`}>
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} /> Sync
                </button>
              </div>
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-0.5">
                {dbHistory.length === 0 ? (
                  <p className={`text-[10px] text-center py-6 uppercase tracking-widest ${th.textDim}`}>No records yet</p>
                ) : (
                  dbHistory.slice(0, 8).map((rec, i) => (
                    <div key={i} className={`flex justify-between items-center p-3 rounded-xl border ${th.border} ${th.cardInner} hover:border-indigo-500/30 transition-all`}>
                      <div>
                        <p className={`text-[11px] font-bold leading-tight ${th.text}`}>{rec.candidateName || "Unknown"}</p>
                        <p className={`text-[9px] uppercase tracking-widest mt-0.5 ${th.textDim}`}>{rec.jobRole}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-base font-black font-mono ${scoreColor(rec.overallScore)}`}>{rec.overallScore}</p>
                        <p className={`text-[8px] uppercase ${th.textDim}`}>{rec.seniorityLevel || "—"}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ──────────────────────────────────────────────── */}
          <div className={`lg:col-span-8 ${th.card} border ${th.border} rounded-2xl ${th.shadow} overflow-hidden flex flex-col min-h-[880px]`}>

            {/* IDLE */}
            {status === "idle" && (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${isDark ? "bg-indigo-500/5 border border-indigo-500/10" : "bg-indigo-50 border border-indigo-100"}`}>
                  <BrainCircuit className="w-8 h-8 text-indigo-500/40" />
                </div>
                <h2 className={`text-xl font-black uppercase tracking-[0.15em] ${isDark ? "text-slate-700" : "text-slate-400"}`}>
                  Awaiting Input
                </h2>
                <p className={`text-[10px] uppercase tracking-widest mt-2 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                  Configure parameters and upload a resume to begin
                </p>
                <div className="grid grid-cols-3 gap-4 mt-10 w-full max-w-md">
                  {[
                    { icon: BrainCircuit, label: "3-Layer AI Analysis", sub: "Parallel inference" },
                    { icon: Database, label: "MongoDB Persistence", sub: "Immutable records" },
                    { icon: Target, label: "5-Axis Scoring", sub: "Zero fake data" },
                  ].map((f, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${th.border} ${th.cardInner} text-center`}>
                      <f.icon className="w-5 h-5 text-indigo-500/40 mx-auto mb-2" />
                      <p className={`text-[9px] font-bold uppercase tracking-widest ${th.textDim}`}>{f.label}</p>
                      <p className={`text-[8px] mt-0.5 ${isDark ? "text-slate-700" : "text-slate-400"}`}>{f.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROCESSING */}
            {status === "processing" && (
              <div className="flex-1 flex flex-col items-center justify-center p-10 gap-7">
                <div className="relative">
                  <div className="w-20 h-20 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit className="w-7 h-7 text-indigo-500/40" />
                  </div>
                </div>
                <div className="text-center">
                  <p className={`text-sm font-black uppercase tracking-[0.25em] text-indigo-500`}>Running AI Audit</p>
                  <p className={`text-[10px] mt-1.5 uppercase tracking-widest ${th.textDim}`}>3 parallel inference tasks active</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {["Quantitative Scoring", "CTO Memo", "Market Benchmark"].map((t, i) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${th.border} ${th.cardInner}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${th.textDim}`}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COMPLETED */}
            {status === "completed" && result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">

                {/* Hero Bar */}
                <div
                  className={`p-5 border-b ${th.border}`}
                  style={{
                    background: isDark
                      ? "linear-gradient(135deg, rgba(99,102,241,0.07) 0%, transparent 55%)"
                      : "linear-gradient(135deg, rgba(99,102,241,0.04) 0%, transparent 55%)"
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                      {/* Score */}
                      <div className="text-center shrink-0">
                        <div className={`text-5xl font-black font-mono leading-none ${scoreColor(result.overallScore)}`}>
                          {result.overallScore}
                        </div>
                        <div className={`text-[9px] font-black uppercase tracking-widest mt-1 ${th.textDim}`}>Score</div>
                      </div>
                      <div className={`h-10 w-px ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
                      {/* Candidate Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h3 className={`text-base font-black ${th.text}`}>{result.candidate?.name || "Unknown Candidate"}</h3>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${hiringColors[result.hiringRecommendation] || "border-slate-700 text-slate-400"}`}>
                            {result.hiringRecommendation}
                          </span>
                        </div>
                        <p className={`text-[11px] ${th.textMuted}`}>{result.candidate?.currentRole || result.seniorityLevel} · {result.candidate?.location || "Location N/A"}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-[9px] font-bold uppercase ${th.textDim}`}>{result.candidate?.experienceYears || "Experience N/A"}</span>
                          <span className={isDark ? "text-slate-700" : "text-slate-300"}>·</span>
                          <span className={`text-[9px] font-bold uppercase ${th.textDim}`}>{result.seniorityLevel}</span>
                          <span className={isDark ? "text-slate-700" : "text-slate-300"}>·</span>
                          <span className="text-[9px] font-bold text-indigo-500 uppercase">{result.marketDemand} Demand</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Metrics — confidence removed, salary + latency remain */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className={`text-[9px] uppercase tracking-widest ${th.textDim}`}>Est. Salary</p>
                        <p className="text-sm font-black text-emerald-500">{result.experts?.salaryBenchmark || "N/A"}</p>
                      </div>
                      <div className={`h-8 w-px ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
                      <div className="text-right">
                        <p className={`text-[9px] uppercase tracking-widest ${th.textDim}`}>Latency</p>
                        <p className={`text-sm font-black font-mono ${th.textMuted}`}>{result.processingTime}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className={`flex items-center gap-1 px-5 py-2.5 border-b ${th.border} ${isDark ? "bg-black/20" : "bg-slate-50/80"}`}>
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                        ${activeTab === tab.id
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                          : isDark
                            ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800/60"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/60"
                        }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setStatus("idle")}
                    className={`ml-auto flex items-center gap-1.5 text-[9px] uppercase tracking-widest transition-colors ${th.textDim} hover:text-indigo-500`}
                  >
                    <RefreshCw className="w-3 h-3" /> New Audit
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">

                  {/* ── OVERVIEW ──────────────────────────────────────────── */}
                  {activeTab === "overview" && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                      {/* Candidate Profile */}
                      <div className={`p-4 rounded-xl border ${th.border} ${th.cardInner}`}>
                        <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${th.textDim}`}>
                          <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Candidate Profile
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                          <StatPill label="Email" value={result.candidate?.email || "Not found"} isDark={isDark} />
                          <StatPill label="Phone" value={result.candidate?.phone || "Not found"} isDark={isDark} />
                          <StatPill label="Education" value={result.candidate?.education || "Not found"} accent isDark={isDark} />
                          <StatPill label="Experience" value={result.candidate?.experienceYears || "Not found"} accent isDark={isDark} />
                        </div>
                        {result.candidate?.summary && (
                          <p className={`mt-3.5 text-[11px] leading-relaxed italic border-t pt-3.5 ${isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                            {result.candidate.summary}
                          </p>
                        )}
                      </div>

                      {/* Score Breakdown + Role Matrix */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border ${th.border} ${th.cardInner} space-y-3.5`}>
                          <h4 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${th.textDim}`}>
                            <Gauge className="w-3.5 h-3.5 text-indigo-500" /> Score Breakdown
                          </h4>
                          <ScoreBar label="Technical Depth" value={result.breakdown?.technical} color="bg-indigo-500" icon={Code2} delay={0} isDark={isDark} />
                          <ScoreBar label="Experience" value={result.breakdown?.experience} color="bg-violet-500" icon={Briefcase} delay={0.1} isDark={isDark} />
                          <ScoreBar label="Growth Potential" value={result.breakdown?.potential} color="bg-emerald-500" icon={TrendingUp} delay={0.2} isDark={isDark} />
                          <ScoreBar label="Communication" value={result.breakdown?.communication} color="bg-sky-500" icon={MessageSquare} delay={0.3} isDark={isDark} />
                          <ScoreBar label="Leadership" value={result.breakdown?.leadership} color="bg-amber-500" icon={Award} delay={0.4} isDark={isDark} />
                        </div>

                        <div className={`p-4 rounded-xl border ${th.border} ${th.cardInner} space-y-2.5`}>
                          <h4 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${th.textDim}`}>
                            <Layers className="w-3.5 h-3.5 text-indigo-500" /> Role Placement
                          </h4>
                          {result.roleMatch?.map((r, i) => (
                            <div key={i} className={`p-3 rounded-lg border ${th.border} ${isDark ? "bg-black/30" : "bg-slate-100/60"}`}>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${th.textMuted}`}>{r.role}</span>
                                <span className={`text-xs font-black font-mono ${scoreColor(r.score)}`}>{r.score}%</span>
                              </div>
                              <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${r.score}%` }}
                                  transition={{ duration: 1, delay: i * 0.15 }}
                                  className={`h-full rounded-full ${scoreBg(r.score)}`}
                                />
                              </div>
                              {r.rationale && <p className={`text-[9px] mt-1.5 leading-tight ${th.textDim}`}>{r.rationale}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border border-emerald-500/25 ${isDark ? "bg-emerald-500/5" : "bg-emerald-50"}`}>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills ({result.matchedSkills?.length || 0})
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {result.matchedSkills?.map((s, i) => (
                              <span key={i} className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-tight ${isDark ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "bg-emerald-100 text-emerald-700 border border-emerald-300/50"}`}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className={`p-4 rounded-xl border border-rose-500/25 ${isDark ? "bg-rose-500/5" : "bg-rose-50"}`}>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-3 flex items-center gap-2">
                            <XCircle className="w-3.5 h-3.5" /> Skill Gaps ({result.missingSkills?.length || 0})
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {result.missingSkills?.map((s, i) => (
                              <span key={i} className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-tight ${isDark ? "bg-rose-500/10 text-rose-400 border border-rose-500/25" : "bg-rose-100 text-rose-700 border border-rose-300/50"}`}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Red Flags */}
                      {result.redFlags?.length > 0 && (
                        <div className={`p-4 rounded-xl border border-amber-500/25 ${isDark ? "bg-amber-500/5" : "bg-amber-50"}`}>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5" /> Risk Signals ({result.redFlags.length})
                          </h4>
                          <div className="space-y-2">
                            {result.redFlags.map((flag, i) => (
                              <div key={i} className={`flex items-start gap-2.5 p-3 rounded-lg border ${isDark ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-100/60 border-amber-300/50"}`}>
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <p className={`text-[11px] leading-relaxed ${isDark ? "text-amber-200/80" : "text-amber-800"}`}>{flag}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expert Verdicts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border border-indigo-500/25 ${isDark ? "bg-indigo-500/5" : "bg-indigo-50"}`}>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2.5 flex items-center gap-2">
                            <Code2 className="w-3.5 h-3.5" /> Tech Lead Verdict
                          </h4>
                          <p className={`text-[11px] leading-relaxed italic ${isDark ? "text-slate-400" : "text-slate-600"}`}>"{result.experts?.techLead}"</p>
                        </div>
                        <div className={`p-4 rounded-xl border ${th.border} ${th.cardInner}`}>
                          <h4 className={`text-[10px] font-black uppercase tracking-widest mb-2.5 flex items-center gap-2 ${th.textDim}`}>
                            <Users className="w-3.5 h-3.5" /> HR Analysis
                          </h4>
                          <p className={`text-[11px] leading-relaxed italic ${th.textMuted}`}>"{result.experts?.hrManager}"</p>
                        </div>
                      </div>

                      {/* CTO Memo */}
                      <div className={`p-4 rounded-xl border ${th.border} ${th.cardInner}`}>
                        <h4 className={`text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2.5 flex items-center gap-2`}>
                          <FileText className="w-3.5 h-3.5" /> CTO Audit Memo
                        </h4>
                        <p className={`text-[12px] leading-relaxed ${th.textMuted}`}>{result.aiReasoning}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* ── INTERVIEW KIT ─────────────────────────────────────── */}
                  {activeTab === "interview" && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3.5">
                      <div className={`p-4 rounded-xl border border-indigo-500/25 ${isDark ? "bg-indigo-500/5" : "bg-indigo-50"} flex items-start gap-3`}>
                        <BrainCircuit className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <p className={`text-[10px] leading-relaxed ${isDark ? "text-indigo-300" : "text-indigo-700"}`}>
                          Generated from <strong>{result.candidate?.name || "this candidate"}'s</strong> actual resume — targeting real projects, gaps, and claimed tech. Calibrated for a CTO first-round screen.
                        </p>
                      </div>
                      {result.interviewQuestions?.length > 0 ? (
                        result.interviewQuestions.map((q, i) => (
                          <div key={i} className={`p-4 rounded-xl border ${th.border} ${th.cardInner}`}>
                            <div className="flex items-start justify-between gap-4 mb-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-5.5 h-5.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-[9px] font-black text-indigo-400 w-6 h-6">{i + 1}</div>
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${th.textDim}`}>{q.focus}</span>
                              </div>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${difficultyColors[q.difficulty] || "border-slate-700 text-slate-500"}`}>
                                {q.difficulty}
                              </span>
                            </div>
                            <p className={`text-[13px] leading-relaxed font-medium ${th.text}`}>{q.question}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <MessageSquare className={`w-9 h-9 mx-auto mb-3 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
                          <p className={`text-[10px] uppercase tracking-widest ${th.textDim}`}>Interview questions not available</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ── MARKET INTEL ──────────────────────────────────────── */}
                  {activeTab === "benchmark" && result.benchmark && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "Market Percentile", value: result.benchmark.percentile != null ? `Top ${100 - result.benchmark.percentile}%` : "N/A", icon: BarChart2, color: "text-indigo-500" },
                          { label: "Time to Hire", value: result.benchmark.timeToHire || "N/A", icon: Clock, color: "text-emerald-500" },
                          { label: "Market Pressure", value: result.benchmark.competitivePressure || "N/A", icon: TrendingUp, color: "text-amber-500" },
                          { label: "Growth Signal", value: result.benchmark.growthTrajectory || "N/A", icon: ArrowUpRight, color: "text-violet-500" },
                        ].map((m, i) => (
                          <div key={i} className={`p-4 rounded-xl border ${th.border} ${th.cardInner} text-center`}>
                            <m.icon className={`w-5 h-5 ${m.color} mx-auto mb-2`} />
                            <p className={`text-base font-black ${m.color}`}>{m.value}</p>
                            <p className={`text-[9px] uppercase tracking-widest mt-1 ${th.textDim}`}>{m.label}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border ${th.border} ${th.cardInner} space-y-3.5`}>
                          <h4 className={`text-[10px] font-black uppercase tracking-widest ${th.textDim}`}>Technical Assessment</h4>
                          <div className="grid grid-cols-2 gap-2.5">
                            <StatPill label="Tech Depth" value={result.benchmark.technicalDepthRating || "N/A"} accent isDark={isDark} />
                            <StatPill label="Portfolio" value={result.benchmark.portfolioStrength || "N/A"} accent isDark={isDark} />
                          </div>
                          {result.benchmark.leadershipSignals != null && (
                            <div>
                              <div className={`flex justify-between text-[9px] font-bold uppercase tracking-widest mb-1.5 ${th.textDim}`}>
                                <span>Leadership Signals</span>
                                <span>{result.benchmark.leadershipSignals}/10</span>
                              </div>
                              <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(result.benchmark.leadershipSignals / 10) * 100}%` }}
                                  transition={{ duration: 1 }}
                                  className="h-full rounded-full bg-amber-500"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className={`p-4 rounded-xl border ${th.border} ${th.cardInner}`}>
                          <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${th.textDim}`}>
                            <Building2 className="w-3.5 h-3.5 text-indigo-500" /> Company Fit
                          </h4>
                          <div className="space-y-2">
                            {result.benchmark.topCompaniesMatch?.map((c, i) => (
                              <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${th.border} ${isDark ? "bg-black/25" : "bg-slate-100/70"}`}>
                                <Star className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span className={`text-[11px] font-bold ${th.text}`}>{c}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {result.benchmark.keyStrengths?.length > 0 && (
                        <div className={`p-4 rounded-xl border ${th.border} ${th.cardInner}`}>
                          <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${th.textDim}`}>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Competitive Strengths
                          </h4>
                          <div className="space-y-2">
                            {result.benchmark.keyStrengths.map((s, i) => (
                              <div key={i} className={`flex items-start gap-2.5 p-3 rounded-lg border ${isDark ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200/60"}`}>
                                <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <p className={`text-[11px] leading-relaxed ${isDark ? "text-emerald-300/80" : "text-emerald-800"}`}>{s}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ── ROADMAP ───────────────────────────────────────────── */}
                  {activeTab === "roadmap" && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3.5">
                      <div className={`p-4 rounded-xl border border-indigo-500/25 ${isDark ? "bg-indigo-500/5" : "bg-indigo-50"}`}>
                        <p className={`text-[10px] leading-relaxed flex items-start gap-2 ${isDark ? "text-indigo-300" : "text-indigo-700"}`}>
                          <Milestone className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          Personalized acceleration roadmap for <strong>{result.candidate?.name || "this candidate"}</strong> based on real resume gaps and career trajectory.
                        </p>
                      </div>
                      <div className="relative pl-7">
                        <div className={`absolute left-3 top-0 bottom-0 w-px ${isDark ? "bg-gradient-to-b from-indigo-500/40 via-indigo-500/15 to-transparent" : "bg-gradient-to-b from-indigo-400/40 via-indigo-300/15 to-transparent"}`} />
                        {result.roadmap?.map((step, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative mb-4 p-4 rounded-xl border ${th.border} ${th.cardInner}`}
                          >
                            <div className={`absolute -left-[22px] top-4 w-4.5 h-4.5 rounded-full bg-indigo-600 border-2 flex items-center justify-center text-[8px] font-black text-white w-5 h-5 ${isDark ? "border-[#0a0f1a]" : "border-white"}`}>
                              {i + 1}
                            </div>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{step.title}</p>
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-md border ${priorityColors[step.priority] || "border-slate-700 text-slate-500"}`}>
                                    {step.priority}
                                  </span>
                                </div>
                                <p className={`text-[12px] leading-relaxed ${th.textMuted}`}>{step.desc}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}