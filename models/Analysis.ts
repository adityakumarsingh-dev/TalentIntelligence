import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  jobRole: { type: String, required: true },
  candidateName: { type: String, default: "Unknown" },
  overallScore: { type: Number, required: true },
  confidence: Number,
  hiringRecommendation: { type: String, enum: ["Strong Hire", "Hire", "Consider", "Reject"] },
  seniorityLevel: { type: String, enum: ["Junior", "Mid-Level", "Senior", "Staff", "Principal"] },
  marketDemand: { type: String, enum: ["High", "Medium", "Low"] },
  breakdown: {
    technical: Number,
    experience: Number,
    potential: Number,
    communication: Number,
    leadership: Number
  },
  roleMatch: [{ role: String, score: Number, rationale: String }],
  matchedSkills: [String],
  missingSkills: [String],
  redFlags: [String],
  interviewQuestions: [{
    question: String,
    focus: String,
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] }
  }],
  benchmark: {
    percentile: Number,
    timeToHire: String,
    competitivePressure: String,
    topCompaniesMatch: [String],
    growthTrajectory: String,
    keyStrengths: [String],
    technicalDepthRating: String,
    portfolioStrength: String,
    leadershipSignals: Number
  },
  aiReasoning: String,
  processingTime: String,
  processingMs: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Analysis || mongoose.model('Analysis', AnalysisSchema);