const express = require("express");
const router = express.Router();
const {
  generateInterview,
  getInterviewHistory,
  getInterviewById,
} = require("../controllers/interviewController");
const { protect } = require("../middleware/authMiddleware");

router.post("/generate", protect, generateInterview);
router.get("/history", protect, getInterviewHistory);
router.get("/:id", protect, getInterviewById);

module.exports = router;