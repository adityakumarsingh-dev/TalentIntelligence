import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Analysis from '@/models/Analysis';

export const runtime = 'nodejs';

// ── Model Strategy ────────────────────────────────────────────────────────────
// Task 1a — Scoring + Candidate:  llama-3.3-70b-versatile  (accuracy critical)
// Task 1b — Skills + Roadmap:     llama-3.1-8b-instant     (structured, fast)
// Task 2  — CTO Memo:             llama-3.1-8b-instant     (short text, fast)
// Task 3  — Benchmark:            llama-3.1-8b-instant     (JSON, very fast)
//
// All 4 run via Promise.all → true parallelism
// Previously: 3 calls, all on 70b → bottleneck was slowest 70b call
// Now: only 1 call on 70b, rest on 8b (5–8x faster per call)
// Expected latency: ~1.2s–1.8s vs previous ~2.5–4s
// ─────────────────────────────────────────────────────────────────────────────

const GROQ = (body: object) =>
  fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then(r => r.json());

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobRole, skills, resumeText } = body;

    if (!resumeText || resumeText.length < 100) {
      return NextResponse.json(
        { error: "INGESTION_FAILURE: Resume stream insufficient." },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Trim resume per task — less tokens = faster inference
    const resumeFull  = resumeText.slice(0, 5000); // scoring needs most context
    const resumeShort = resumeText.slice(0, 2500); // memo/benchmark/skills

    // ── TASK 1A: Core Scoring + Candidate Extraction ─────────────────────────
    // Uses 70b — only this task needs deep reasoning accuracy
    const task_scoring = GROQ({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 1400,
      messages: [
        {
          role: "system",
          content: `You are a CTO auditing a resume for the role: "${jobRole}". Skills required: ${skills || "general software engineering"}.

ZERO HALLUCINATION: Every field must come DIRECTLY from the resume. If missing → null. Never invent data.

SCORING SCALE (be strict):
- 0–1yr basic → 28–48 | 1–2yr some skills → 48–60 | 2–4yr decent → 60–72
- 4–6yr strong → 72–82 | 6–9yr exceptional → 82–90 | 10yr+ elite → 90–97
- Student/incomplete → 20–38

SALARY: India-realistic INR (e.g. "₹8–12 LPA", "₹22–30 LPA"). USD only if candidate is abroad.

Return ONLY valid JSON:
{
  "candidate": {
    "name": "exact from resume or null",
    "email": "exact from resume or null",
    "phone": "exact from resume or null",
    "location": "city/country or null",
    "currentRole": "latest job title or null",
    "experienceYears": "e.g. '3.5 years' or null",
    "education": "degree + institution or null",
    "linkedIn": "URL or null",
    "github": "URL or null",
    "summary": "one specific sentence about this candidate based on real resume content"
  },
  "overallScore": number,
  "hiringRecommendation": "Strong Hire" | "Hire" | "Consider" | "Reject",
  "confidence": number,
  "marketDemand": "High" | "Medium" | "Low",
  "seniorityLevel": "Junior" | "Mid-Level" | "Senior" | "Staff" | "Principal",
  "breakdown": {
    "technical": number,
    "experience": number,
    "potential": number,
    "communication": number,
    "leadership": number
  },
  "roleMatch": [
    { "role": "Frontend",      "score": number, "rationale": "one sentence from resume" },
    { "role": "Backend",       "score": number, "rationale": "one sentence from resume" },
    { "role": "Full Stack",    "score": number, "rationale": "one sentence from resume" },
    { "role": "DevOps / Infra","score": number, "rationale": "one sentence from resume" }
  ],
  "experts": {
    "techLead": "One sentence with candidate's real name, citing specific project/tech/metric from resume.",
    "hrManager": "One sentence with candidate's real name, citing career progression from resume.",
    "salaryBenchmark": "Realistic INR range e.g. '₹8–12 LPA'"
  }
}`
        },
        { role: "user", content: `Role: ${jobRole}\n\nResume:\n${resumeFull}` }
      ]
    });

    // ── TASK 1B: Skills + Interview Questions + Roadmap ──────────────────────
    // Uses 8b — structured JSON extraction, no deep reasoning needed
    const task_skills = GROQ({
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 900,
      messages: [
        {
          role: "system",
          content: `Extract skills and generate roadmap from this resume for role: "${jobRole}". Required skills: ${skills || "general software engineering"}.

RULES:
- matchedSkills: ONLY skills literally written in the resume. No inference.
- missingSkills: Real gaps a senior "${jobRole}" at Flipkart/Swiggy/Razorpay level needs. Minimum 5.
- redFlags: 2–3 real red flags (gaps, no metrics, short tenures). Empty array if none.
- interviewQuestions: 5 targeted questions based on candidate's actual resume content.

Return ONLY valid JSON:
{
  "matchedSkills": ["skills literally in resume"],
  "missingSkills": ["gaps vs senior role — min 5"],
  "redFlags": ["actual flags or empty array"],
  "interviewQuestions": [
    { "question": "targeted question", "focus": "area probed", "difficulty": "Easy" | "Medium" | "Hard" }
  ],
  "roadmap": [
    { "title": "30-Day Sprint",     "desc": "specific to candidate's critical gap", "priority": "Critical" | "High" | "Medium" },
    { "title": "90-Day Build",      "desc": "based on current skill level",         "priority": "Critical" | "High" | "Medium" },
    { "title": "6-Month Milestone", "desc": "realistic stretch given trajectory",   "priority": "Critical" | "High" | "Medium" },
    { "title": "1-Year Vision",     "desc": "long-term path based on experience",   "priority": "Critical" | "High" | "Medium" }
  ]
}`
        },
        { role: "user", content: `Role: ${jobRole}\nRequired skills: ${skills || "general"}\n\nResume:\n${resumeShort}` }
      ]
    });

    // ── TASK 2: CTO Memo ─────────────────────────────────────────────────────
    // Uses 8b — short text generation, no JSON needed
    const task_memo = GROQ({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content: `You are a CTO writing a confidential 3-sentence assessment. Output ONLY the 3 sentences — no subject line, no "To:", no "From:", no headers, no "[Your Name]", no memo formatting whatsoever. Just plain prose.

Rules:
- Use the candidate's ACTUAL name (extracted from resume). Never say "The candidate".
- Every sentence must reference something SPECIFIC from their resume: a real company name, project name, metric, or technology they listed.
- Sentence 1: Their single strongest technical capability — cite one specific project/metric/company from their resume as evidence.
- Sentence 2: The most critical skill gap that would block them at a top-tier company for ${jobRole}.
- Sentence 3: The single highest-ROI action they should take in the next 60 days — be concrete and actionable.
- No markdown, no bullet points, no line breaks between sentences. Just 3 clean sentences in one paragraph.`
        },
        { role: "user", content: `Role: ${jobRole}\nResume:\n${resumeShort}` }
      ]
    });

    // ── TASK 3: Competitive Benchmark ────────────────────────────────────────
    // Uses 8b — pure JSON, minimal reasoning needed
    const task_benchmark = GROQ({
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content: `Talent market analyst. Benchmark for India's tech market, role: "${jobRole}".
Return ONLY valid JSON:
{
  "percentile": number 1-99,
  "timeToHire": "e.g. '2–4 weeks'",
  "competitivePressure": "High" | "Medium" | "Low",
  "topCompaniesMatch": ["3-4 real companies fitting this candidate's actual seniority"],
  "growthTrajectory": "Accelerating" | "Steady" | "Plateauing" | "Declining",
  "keyStrengths": ["top 3 unique strengths visible in the resume"],
  "technicalDepthRating": "Expert" | "Proficient" | "Intermediate" | "Novice",
  "portfolioStrength": "Strong" | "Moderate" | "Weak" | "None",
  "leadershipSignals": number 0-10
}`
        },
        { role: "user", content: `Role: ${jobRole}\nSkills: ${skills || "general"}\nResume:\n${resumeShort}` }
      ]
    });

    // ── All 4 Tasks in True Parallel ─────────────────────────────────────────
    const [scoringRes, skillsRes, memoRes, benchmarkRes] = await Promise.all([
      task_scoring,
      task_skills,
      task_memo,
      task_benchmark,
    ]);

    // ── Parse Task 1A ─────────────────────────────────────────────────────────
    if (scoringRes.error) {
      console.error("TASK_SCORING_ERROR:", scoringRes.error);
      throw new Error(`Scoring task failed: ${scoringRes.error.message}`);
    }
    const scoringRaw = scoringRes.choices?.[0]?.message?.content;
    if (!scoringRaw) throw new Error("Empty scoring response.");
    let scoringData: any = JSON.parse(scoringRaw);

    // ── Parse Task 1B ─────────────────────────────────────────────────────────
    let skillsData: any = {
      matchedSkills: [], missingSkills: [], redFlags: [],
      interviewQuestions: [], roadmap: []
    };
    if (!skillsRes.error) {
      try {
        const raw = skillsRes.choices?.[0]?.message?.content;
        if (raw) skillsData = { ...skillsData, ...JSON.parse(raw) };
      } catch (e) { console.error("SKILLS_PARSE_ERROR:", e); }
    } else { console.error("TASK_SKILLS_ERROR:", skillsRes.error); }

    // ── Parse Task 2 ──────────────────────────────────────────────────────────
    let aiReasoning = "Executive audit unavailable — please rerun.";
    if (!memoRes.error) {
      const t = memoRes.choices?.[0]?.message?.content?.trim();
      if (t && t.length > 30) aiReasoning = t;
    } else { console.error("TASK_MEMO_ERROR:", memoRes.error); }

    // ── Parse Task 3 ──────────────────────────────────────────────────────────
    let benchmarkData: any = {
      percentile: null, timeToHire: null, competitivePressure: null,
      topCompaniesMatch: [], growthTrajectory: null, keyStrengths: [],
      technicalDepthRating: null, portfolioStrength: null, leadershipSignals: null
    };
    if (!benchmarkRes.error) {
      try {
        const raw = benchmarkRes.choices?.[0]?.message?.content;
        if (raw) benchmarkData = { ...benchmarkData, ...JSON.parse(raw) };
      } catch (e) { console.error("BENCHMARK_PARSE_ERROR:", e); }
    } else { console.error("TASK_BENCHMARK_ERROR:", benchmarkRes.error); }

    // ── Score Sanitization ────────────────────────────────────────────────────
    const sanitize = (val: any, min = 0, max = 100): number => {
      const n = parseFloat(val) || 0;
      if (n > 0 && n <= 10) return Math.round(n * 10); // 0–10 scale → percent
      return Math.round(Math.min(max, Math.max(min, n)));
    };

    scoringData.overallScore = sanitize(scoringData.overallScore);
    scoringData.confidence   = sanitize(scoringData.confidence);
    scoringData.breakdown    = {
      technical:     sanitize(scoringData.breakdown?.technical),
      experience:    sanitize(scoringData.breakdown?.experience),
      potential:     sanitize(scoringData.breakdown?.potential),
      communication: sanitize(scoringData.breakdown?.communication),
      leadership:    sanitize(scoringData.breakdown?.leadership),
    };

    if (Array.isArray(scoringData.roleMatch)) {
      scoringData.roleMatch = scoringData.roleMatch.map((r: any) => ({
        ...r, score: sanitize(r.score)
      }));
    } else {
      const s = scoringData.overallScore;
      scoringData.roleMatch = [
        { role: "Frontend",       score: s,                rationale: "Derived from overall score." },
        { role: "Backend",        score: Math.max(0,s-15), rationale: "Derived from overall score." },
        { role: "Full Stack",     score: Math.max(0,s-5),  rationale: "Derived from overall score." },
        { role: "DevOps / Infra", score: Math.max(0,s-25), rationale: "Derived from overall score." },
      ];
    }

    // ── Fallback Guards ───────────────────────────────────────────────────────
    if (!Array.isArray(skillsData.missingSkills) || skillsData.missingSkills.length === 0) {
      skillsData.missingSkills = [
        "Kubernetes & Container Orchestration", "Distributed System Design",
        "Observability & Distributed Tracing",  "CI/CD Pipeline Engineering",
        "Cloud-Native Architecture Patterns"
      ];
    }
    if (!Array.isArray(skillsData.redFlags))           skillsData.redFlags = [];
    if (!Array.isArray(skillsData.interviewQuestions)) skillsData.interviewQuestions = [];
    if (!Array.isArray(skillsData.matchedSkills))      skillsData.matchedSkills = [];

    if (!scoringData.candidate) {
      scoringData.candidate = {
        name: null, email: null, phone: null, location: null,
        currentRole: null, experienceYears: null, education: null,
        linkedIn: null, github: null,
        summary: "Candidate details could not be extracted — re-upload a cleaner resume."
      };
    }
    if (!scoringData.hiringRecommendation) {
      const s = scoringData.overallScore;
      scoringData.hiringRecommendation = s >= 80 ? "Strong Hire" : s >= 65 ? "Hire" : s >= 50 ? "Consider" : "Reject";
    }
    if (!scoringData.seniorityLevel) scoringData.seniorityLevel = "Mid-Level";

    const processingMs   = Date.now() - startTime;
    const processingTime = `${(processingMs / 1000).toFixed(2)}s`;

    // ── Merge all outputs ─────────────────────────────────────────────────────
    const finalData = {
      ...scoringData,
      ...skillsData,
      benchmark: benchmarkData,
      aiReasoning,
      processingTime,
      processingMs,
      dbRecordId: "pending",
    };

    // ── MongoDB: fire-and-forget (non-blocking, doesn't add to latency) ───────
    void (async () => {
      try {
        if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(process.env.MONGODB_URI as string);
        }
        await Analysis.create({
          jobRole,
          candidateName:        scoringData.candidate?.name || "Unknown",
          overallScore:         scoringData.overallScore,
          confidence:           scoringData.confidence,
          hiringRecommendation: scoringData.hiringRecommendation,
          seniorityLevel:       scoringData.seniorityLevel,
          marketDemand:         scoringData.marketDemand,
          breakdown:            scoringData.breakdown,
          roleMatch:            scoringData.roleMatch,
          matchedSkills:        skillsData.matchedSkills,
          missingSkills:        skillsData.missingSkills,
          redFlags:             skillsData.redFlags,
          interviewQuestions:   skillsData.interviewQuestions,
          benchmark:            benchmarkData,
          aiReasoning,
          processingTime,
          processingMs,
        });
      } catch (e) { console.error("MONGODB_NON_FATAL:", e); }
    })();

    return NextResponse.json({ success: true, data: finalData });

  } catch (err: any) {
    console.error("FATAL_PIPELINE_ERROR:", err);
    return NextResponse.json(
      { error: "PIPELINE_INTERNAL_FAILURE", details: err.message },
      { status: 500 }
    );
  }
}