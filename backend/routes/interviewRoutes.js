const express = require("express");
const router = express.Router();
const {
  generateInterview,
  getInterviewHistory,
  getInterviewById,
  submitAnswer,
  generateReport,
} = require("../controllers/interviewController");
const { protect } = require("../middleware/authMiddleware");

router.post("/generate", protect, generateInterview);
router.get("/history", protect, getInterviewHistory);
router.get("/:id", protect, getInterviewById);
router.post("/:id/answer", protect, submitAnswer);
router.post("/:id/report", protect, generateReport);

module.exports = router;