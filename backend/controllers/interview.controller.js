const Interview = require("../models/Interview");
const Resume = require("../models/Resume");
const { generateInterviewQuestions, evaluateInterviewAnswer } = require("../services/gemini.service");

// @desc    Generate new interview session
// @route   POST /api/interviews/generate
// @access  Private
const generateInterview = async (req, res, next) => {
  try {
    const { jobRole, experience, interviewType, numQuestions } = req.body;

    if (!jobRole) {
      return res.status(400).json({ success: false, message: "Job Role is required" });
    }

    // Retrieve user's resume text if available
    const resume = await Resume.findOne({ userId: req.user._id });
    const resumeText = resume ? resume.extractedText : "";

    // Call Gemini Service
    const aiResult = await generateInterviewQuestions({
      resumeText,
      jobRole,
      experience: experience || "0-1 Years",
      interviewType: interviewType || "Mixed",
      numQuestions: parseInt(numQuestions) || 5,
    });

    const formattedQuestions = aiResult.questions.map((q) => ({
      question: q.question,
      category: q.category || interviewType || "Technical",
      difficulty: q.difficulty || "Medium",
      idealAnswer: q.idealAnswer || "",
      keyPoints: q.keyPoints || [],
      followUpQuestions: q.followUpQuestions || [],
    }));

    const interview = await Interview.create({
      userId: req.user._id,
      resumeId: resume ? resume._id : null,
      jobRole,
      experience: experience || "0-1 Years",
      interviewType: interviewType || "Mixed",
      numQuestions: formattedQuestions.length,
      interviewTitle: aiResult.interviewTitle || `${jobRole} ${interviewType || "Mixed"} Interview`,
      questions: formattedQuestions,
    });

    res.status(201).json({
      success: true,
      message: "Interview generated successfully",
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user interviews
// @route   GET /api/interviews
// @access  Private
const getInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-questions.idealAnswer");

    res.json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single interview details
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview session not found" });
    }

    res.json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit answer for a question in interview
// @route   POST /api/interviews/:id/answer
// @access  Private
const submitAnswer = async (req, res, next) => {
  try {
    const { questionId, questionIndex, userAnswer } = req.body;

    if (!userAnswer || userAnswer.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Please enter an answer before submitting" });
    }

    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview session not found" });
    }

    let questionItem;
    if (questionId) {
      questionItem = interview.questions.id(questionId);
    } else if (typeof questionIndex === "number" && interview.questions[questionIndex]) {
      questionItem = interview.questions[questionIndex];
    }

    if (!questionItem) {
      return res.status(404).json({ success: false, message: "Question not found in this interview session" });
    }

    // Call Gemini AI Evaluation
    const evaluation = await evaluateInterviewAnswer({
      question: questionItem.question,
      idealAnswer: questionItem.idealAnswer,
      category: questionItem.category,
      userAnswer,
      jobRole: interview.jobRole,
      experience: interview.experience,
    });

    // Update question evaluation fields
    questionItem.userAnswer = userAnswer;
    questionItem.userScore = evaluation.score || 0;
    questionItem.rating = evaluation.rating || "Average";
    questionItem.strengths = evaluation.strengths || [];
    questionItem.weaknesses = evaluation.weaknesses || [];
    questionItem.missingPoints = evaluation.missingPoints || [];
    questionItem.feedback = evaluation.feedback || "";
    questionItem.improvementTips = evaluation.improvementTips || [];
    questionItem.answeredAt = Date.now();

    if (evaluation.idealAnswer) {
      questionItem.idealAnswer = evaluation.idealAnswer;
    }

    await interview.save();

    res.json({
      success: true,
      message: "Answer evaluated successfully",
      evaluation: {
        score: questionItem.userScore,
        rating: questionItem.rating,
        strengths: questionItem.strengths,
        weaknesses: questionItem.weaknesses,
        missingPoints: questionItem.missingPoints,
        idealAnswer: questionItem.idealAnswer,
        feedback: questionItem.feedback,
        improvementTips: questionItem.improvementTips,
      },
      question: questionItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete interview session & calculate overall scores
// @route   POST /api/interviews/:id/complete
// @access  Private
const completeInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview session not found" });
    }

    const answeredQuestions = interview.questions.filter((q) => q.userScore !== null && q.userScore !== undefined);

    let totalScore = 0;
    let techScoreSum = 0;
    let techCount = 0;
    let commScoreSum = 0;

    answeredQuestions.forEach((q) => {
      totalScore += q.userScore;
      if (q.category === "Technical" || q.category === "Resume Based") {
        techScoreSum += q.userScore;
        techCount++;
      }
      commScoreSum += q.userScore;
    });

    const count = answeredQuestions.length || 1;
    const overallScore = parseFloat((totalScore / count).toFixed(1));
    const technicalScore = Math.round(((techCount > 0 ? techScoreSum / techCount : overallScore) / 10) * 100);
    const communicationScore = Math.round(((commScoreSum / count) / 10) * 100);
    const problemSolvingScore = Math.round(((overallScore * 0.9 + (technicalScore / 100) * 1.0) / 2) * 10);

    interview.overallScore = overallScore;
    interview.technicalScore = Math.min(100, Math.max(0, technicalScore));
    interview.communicationScore = Math.min(100, Math.max(0, communicationScore));
    interview.problemSolvingScore = Math.min(100, Math.max(0, problemSolvingScore));
    interview.completed = true;
    interview.completedAt = Date.now();

    await interview.save();

    res.json({
      success: true,
      message: "Interview completed",
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete interview session
// @route   DELETE /api/interviews/:id
// @access  Private
const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview session not found" });
    }

    res.json({
      success: true,
      message: "Interview session deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateInterview,
  getInterviews,
  getInterviewById,
  submitAnswer,
  completeInterview,
  deleteInterview,
};
