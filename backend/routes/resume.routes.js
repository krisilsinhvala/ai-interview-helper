const express = require("express");
const { uploadResume, getResume, tailorResume, deleteResume } = require("../controllers/resume.controller");
const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.use(protect);

router.post("/upload", upload.single("resume"), uploadResume);
router.get("/", getResume);
router.post("/tailor", tailorResume);
router.delete("/:id", deleteResume);

module.exports = router;
