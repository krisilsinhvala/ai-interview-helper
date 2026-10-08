const Resume = require("../models/Resume");
const { extractTextFromPDF } = require("../services/pdf.service");
const { tailorResumeWithAi } = require("../services/gemini.service");
const fs = require("fs");

// @desc    Upload PDF resume & extract text
// @route   POST /api/resume/upload
// @access  Private
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a PDF file" });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;

    // Extract text using pdf.service
    let extractedText = "";
    try {
      extractedText = await extractTextFromPDF(filePath);
    } catch (parseErr) {
      console.warn("PDF extraction warning:", parseErr.message);
      extractedText = "PDF uploaded successfully, but text extraction yielded empty content or scanned format.";
    }

    // Check if user already has a resume, update or create new
    let resume = await Resume.findOne({ userId: req.user._id });

    if (resume) {
      // Remove old file if exists
      if (fs.existsSync(resume.filePath) && resume.filePath !== filePath) {
        try { fs.unlinkSync(resume.filePath); } catch (e) {}
      }

      resume.fileName = fileName;
      resume.filePath = filePath;
      resume.extractedText = extractedText;
      resume.fileSize = fileSize;
      resume.uploadedAt = Date.now();
      await resume.save();
    } else {
      resume = await Resume.create({
        userId: req.user._id,
        fileName,
        filePath,
        extractedText,
        fileSize,
      });
    }

    res.status(200).json({
      success: true,
      message: "Resume uploaded and text extracted successfully",
      resume: {
        _id: resume._id,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        extractedTextSnippet: extractedText ? extractedText.substring(0, 300) + "..." : "",
        uploadedAt: resume.uploadedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's current resume
// @route   GET /api/resume
// @access  Private
const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });

    if (!resume) {
      return res.status(200).json({
        success: true,
        hasResume: false,
        resume: null,
      });
    }

    res.status(200).json({
      success: true,
      hasResume: true,
      resume: {
        _id: resume._id,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        extractedText: resume.extractedText,
        uploadedAt: resume.uploadedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Tailor resume for target job description using Gemini AI
// @route   POST /api/resume/tailor
// @access  Private
const tailorResume = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription || jobDescription.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Please provide a target job description." });
    }

    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(400).json({ success: false, message: "Please upload a resume before tailoring." });
    }

    // Use extracted text if available, otherwise tell AI to work with just the job description
    const resumeText = (resume.extractedText && !resume.extractedText.includes("text extraction yielded empty content") && !resume.extractedText.includes("Could not extract text"))
      ? resume.extractedText
      : "Resume text could not be extracted from PDF. Please analyze the job description and provide general ATS optimization recommendations.";

    const tailoredReport = await tailorResumeWithAi({
      resumeText,
      jobDescription: jobDescription.trim(),
    });

    res.json({
      success: true,
      tailoredReport,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user's resume
// @route   DELETE /api/resume/:id
// @access  Private
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    if (fs.existsSync(resume.filePath)) {
      try { fs.unlinkSync(resume.filePath); } catch (e) {}
    }

    await resume.deleteOne();

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getResume,
  tailorResume,
  deleteResume,
};
