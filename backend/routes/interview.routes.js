const express = require("express");
const {
  generateInterview,
  getInterviews,
  getInterviewById,
  submitAnswer,
  completeInterview,
  deleteInterview,
} = require("../controllers/interview.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.post("/generate", generateInterview);
router.get("/", getInterviews);
router.get("/:id", getInterviewById);
router.post("/:id/answer", submitAnswer);
router.post("/:id/complete", completeInterview);
router.delete("/:id", deleteInterview);

module.exports = router;
