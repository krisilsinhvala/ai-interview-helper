const { GoogleGenAI } = require("@google/genai");

const getAiClient = () => {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (
    !apiKey ||
    apiKey === "your_google_gemini_api_key_here" ||
    apiKey === "your_gemini_api_key_here" ||
    apiKey === "YOUR_NEW_GEMINI_API_KEY"
  ) {
    throw new Error("Google Gemini API Key is not configured. Please set GOOGLE_GENAI_API_KEY in backend/.env.");
  }
  return new GoogleGenAI({ apiKey });
};

// Candidate models in order of preference
const MODELS = ["gemini-3.5-flash", "gemini-3.8-flash"];

// Retry wrapper with model fallback for handling 503 overload and 429 quota errors
const retryWithBackoff = async (fn, maxRetries = 2, baseDelay = 1500) => {
  let lastError = null;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn(model);
      } catch (error) {
        lastError = error;
        const errorStr = typeof error === "object" ? JSON.stringify(error) : String(error?.message || error);
        const isRetryable =
          errorStr.includes("503") ||
          errorStr.includes("UNAVAILABLE") ||
          errorStr.includes("capacity") ||
          errorStr.includes("429") ||
          errorStr.includes("RESOURCE_EXHAUSTED") ||
          errorStr.includes("Quota exceeded") ||
          error?.status === 503 ||
          error?.status === 429;

        if (isRetryable) {
          console.warn(`Model ${model} issue (attempt ${attempt}/${maxRetries}): ${error?.message?.substring(0, 80)}`);
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, baseDelay * attempt));
          } else {
            console.warn(`Model ${model} exhausted retries. Switching to fallback model...`);
          }
        } else {
          // If unrecoverable error (e.g. invalid API key format), throw
          throw error;
        }
      }
    }
  }

  // If all candidate models failed
  throw new Error("The AI service is currently experiencing high demand. Please wait a few seconds and click submit again.");
};

// Helper function to safely clean JSON responses from LLM code blocks
const parseJsonFromResponse = (text) => {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    return JSON.parse(cleanText);
  } catch (err) {
    console.error("JSON Parsing Error:", err.message);
    throw new Error("AI returned malformed JSON response. Please try again.");
  }
};

/**
 * Generates personalized interview questions based on resume, role, type, & experience
 */
const generateInterviewQuestions = async ({ resumeText, jobRole, experience, interviewType, numQuestions }) => {
  const ai = getAiClient();
  const count = numQuestions || 5;

  const prompt = `You are an expert technical recruiter and interviewer.
Generate ${count} tailored interview questions for a candidate applying for the role of "${jobRole}" with experience level "${experience}".
Interview Type: "${interviewType}".

Candidate Resume Context:
${resumeText && resumeText.trim().length > 10 ? resumeText.substring(0, 4000) : "No resume uploaded. Generate questions based on target job role and experience."}

Generate structured output JSON with the exact following schema:
{
  "interviewTitle": "${jobRole} ${interviewType} Interview",
  "questions": [
    {
      "question": "Clear, specific question text",
      "category": "${interviewType}",
      "difficulty": "Easy | Medium | Hard",
      "idealAnswer": "Comprehensive model answer covering key concepts",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "followUpQuestions": ["Follow up 1", "Follow up 2"]
    }
  ]
}

Ensure questions cover core requirements for ${jobRole}, technical depth (if Technical or Mixed), HR situational concepts (if HR or Mixed), STAR method questions (if Behavioral), and resume specifics (if Resume Based). Return ONLY valid raw JSON with no Markdown formatting or code block wrapper.`;

  try {
    const response = await retryWithBackoff((model) =>
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      })
    );

    const parsed = parseJsonFromResponse(response.text);
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("AI response missing questions array");
    }
    return parsed;
  } catch (error) {
    console.error("Error generating interview questions:", error.message || error);
    if (error.message && (error.message.includes("API_KEY") || error.message.includes("400"))) {
      throw new Error("Gemini API request failed. Please verify your GOOGLE_GENAI_API_KEY in backend/.env.");
    }
    throw error;
  }
};

/**
 * Evaluates user's answer to a specific interview question
 */
const evaluateInterviewAnswer = async ({ question, idealAnswer, category, userAnswer, jobRole, experience }) => {
  const ai = getAiClient();

  const prompt = `You are an expert interviewer evaluating a candidate's answer for the role of "${jobRole}" (${experience}).

Question: "${question}"
Category: "${category}"
Expected / Model Answer: "${idealAnswer || "N/A"}"
Candidate's Submitted Answer: "${userAnswer}"

Evaluate the candidate's answer thoroughly and fairly.
Return a structured JSON object with the exact schema:
{
  "score": 8, // Integer or float rating from 0 to 10
  "rating": "Excellent | Good | Average | Needs Improvement",
  "strengths": ["Clear communication", "Correct architectural understanding"],
  "weaknesses": ["Missed edge cases"],
  "missingPoints": ["Did not mention complexity constraints"],
  "idealAnswer": "Detailed refined answer tailored to candidate's level",
  "feedback": "Constructive 2-3 sentence feedback overview",
  "improvementTips": ["Tip 1", "Tip 2"]
}

Return ONLY valid raw JSON without markdown markers.`;

  try {
    const response = await retryWithBackoff((model) =>
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      })
    );

    return parseJsonFromResponse(response.text);
  } catch (error) {
    console.error("Error evaluating answer:", error.message || error);
    if (error.message && (error.message.includes("API_KEY") || error.message.includes("400"))) {
      throw new Error("Gemini API request failed. Please verify your GOOGLE_GENAI_API_KEY in backend/.env.");
    }
    throw error;
  }
};

/**
 * Generates ATS-tailored resume content matching target job description
 */
const tailorResumeWithAi = async ({ resumeText, jobDescription }) => {
  const ai = getAiClient();

  const prompt = `You are an expert ATS (Applicant Tracking System) resume consultant.
Tailor the following candidate resume for the target job description.

Candidate Resume Text:
${resumeText}

Target Job Description:
${jobDescription}

Generate structured JSON with the exact schema:
{
  "matchScore": 85, // Compatibility percentage (0-100)
  "tailoredSummary": "Professional summary optimized for target role",
  "highlightedSkills": ["Skill 1", "Skill 2"],
  "recommendedKeywords": ["Keyword 1", "Keyword 2"],
  "tailoredBulletPoints": ["Action bullet 1", "Action bullet 2"],
  "improvements": ["Suggestion 1", "Suggestion 2"]
}

Return ONLY valid raw JSON without code block wrapper.`;

  try {
    const response = await retryWithBackoff((model) =>
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      })
    );

    return parseJsonFromResponse(response.text);
  } catch (error) {
    console.error("Error tailoring resume:", error.message || error);
    if (error.message && (error.message.includes("API_KEY") || error.message.includes("400"))) {
      throw new Error("Gemini API request failed. Please verify your GOOGLE_GENAI_API_KEY in backend/.env.");
    }
    throw error;
  }
};

module.exports = {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  tailorResumeWithAi,
};
