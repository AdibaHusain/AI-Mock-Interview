const Interview = require('../models/Interview');
const {GoogleGenerativeAI} = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route  POST /api/interview/generate
// @desc   Generate interview questions from job description
// @access Private

const generateInterview = async (req, res) => {
    const { jobRole, jobDescription } = req.body;

    if (!jobRole || !jobDescription) {
        return res.status(400).json({ message: 'Job role and description are required' });
    }

    try {
        const model= genAI.getGenerativeModel({model: 'gemini-1.5-flash'});
        const prompt = `You are an expert technical interviewer at a top tech company.
        Job Role: ${jobRole}
        Job Description: ${jobDescription}

        Generate exactly 6 interview questions for this role. 
      Mix of: 2 technical, 2 behavioral, 1 system design, 1 situational.
      
      Respond ONLY in this exact JSON format, no extra text:
      {
        "questions": [
          { "question": "...", "type": "technical" },
          { "question": "...", "type": "behavioral" },
          { "question": "...", "type": "technical" },
          { "question": "...", "type": "behavioral" },
          { "question": "...", "type": "system_design" },
          { "question": "...", "type": "situational" }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const text =result.response.text();

    const cleaned = text.replace(/```json|```/g, "").trim();
    let parsed;

    try {
       parsed = JSON.parse(cleaned);
    } catch (err) {
    console.error("JSON Parse Error:", cleaned);
    return res.status(500).json({ message: "AI returned invalid format." });
   }

    const interview = await Interview.create({
      user: req.user._id,
      jobRole,
      jobDescription,
      questions: parsed.questions.map((q) => ({ question: q.question , type: q.type })),
      status: "pending",
    });

    // Increment user's interview count
    req.user.interviewsCount += 1;
    await req.user.save();

    res.status(201).json({
      interviewId: interview._id,
      jobRole: interview.jobRole,
      questions: interview.questions,
    });
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ message: "Failed to generate questions. Try again." });
  }
};

// @route  GET /api/interview/history
// @desc   Get all past interviews of logged-in user
// @access Private
const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("jobRole status overallScore createdAt");

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/interview/:id
// @desc   Get single interview by ID
// @access Private
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({
  _id: req.params.id,
  user: req.user._id,
});

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Make sure user owns this interview
    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateInterview, getInterviewHistory, getInterviewById };

