const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  category: { type: String, default: "Technical" },
  difficulty: { type: String, default: "Medium" },
  idealAnswer: { type: String, default: "" },
  keyPoints: [{ type: String }],
  followUpQuestions: [{ type: String }],
  
  // User Answer & AI Evaluation
  userAnswer: { type: String, default: "" },
  userScore: { type: Number, default: null }, // 0 to 10
  rating: { type: String, default: "" }, // Excellent, Good, Average, Needs Improvement
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  missingPoints: [{ type: String }],
  feedback: { type: String, default: "" },
  improvementTips: [{ type: String }],
  answeredAt: { type: Date }
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },
    jobRole: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      default: "0-1 Years",
    },
    interviewType: {
      type: String,
      enum: ["Technical", "HR", "Behavioral", "Resume Based", "Mixed"],
      default: "Mixed",
    },
    numQuestions: {
      type: Number,
      default: 5,
    },
    interviewTitle: {
      type: String,
      default: "Interview Preparation Session",
    },
    questions: [questionSchema],
    overallScore: {
      type: Number,
      default: 0,
    },
    technicalScore: {
      type: Number,
      default: 0,
    },
    communicationScore: {
      type: Number,
      default: 0,
    },
    problemSolvingScore: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interview", interviewSchema);
