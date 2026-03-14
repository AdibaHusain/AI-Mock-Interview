const Interview = require('../models/Interview');
const User = require('../models/User');
const Report = require('../models/Report');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// @route  POST /api/interview/generate
// @desc   Generate interview questions from job description
// @access Private
const generateInterview = async (req, res) => {
    const { jobRole, jobDescription } = req.body;

    if (!jobRole || !jobDescription) {
        return res.status(400).json({ message: 'Job role and description are required' });
    }

    try {
        const prompt = `You are an expert technical interviewer.
Question: "${question.question}"
Candidate's Answer: "${userAnswer}"

Evaluate the answer and respond ONLY in this JSON format, no extra text, no markdown:
{
  "score": <number from 0 to 10>,
  "feedback": "<2-3 line constructive feedback>",
  "refinedAnswer": "<A improved version of the candidate's answer with all important details, keywords and depth that was missing — written as if the candidate gave a perfect answer>"
}`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
        });

        const text = completion.choices[0].message.content.trim();
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
            questions: parsed.questions.map((q) => ({ question: q.question, type: q.type })),
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
        res.status(500).json({ message: error.message });
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

        if (interview.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.json(interview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route  POST /api/interview/:id/answer
// @desc   Submit answer and get AI score + feedback
// @access Private
const submitAnswer = async (req, res) => {
    const { questionIndex, userAnswer } = req.body;

    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview)
            return res.status(404).json({ message: "Interview not found" });

        if (interview.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: "Not authorized" });

        const question = interview.questions[questionIndex];
        if (!question)
            return res.status(400).json({ message: "Invalid question index" });

        const prompt = `You are an expert technical interviewer.
Question: "${question.question}"
Candidate's Answer: "${userAnswer}"

Evaluate the answer and respond ONLY in this JSON format, no extra text, no markdown:
{
  "score": <number from 0 to 10>,
  "feedback": "<2-3 line constructive feedback>"
}`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
        });

        const raw = completion.choices[0].message.content.trim();
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        interview.questions[questionIndex].userAnswer = userAnswer;
        interview.questions[questionIndex].aiScore = parsed.score;
        interview.questions[questionIndex].aiFeedback = parsed.feedback;
        await interview.save();

        res.json({ 
           score: parsed.score, 
           feedback: parsed.feedback,
           refinedAnswer: parsed.refinedAnswer 
       });
    } catch (error) {
        console.error("Submit answer error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @route  POST /api/interview/:id/report
// @desc   Generate final report after interview
// @access Private
const generateReport = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview)
            return res.status(404).json({ message: "Interview not found" });

        if (interview.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: "Not authorized" });

        const scores = interview.questions.map((q) => q.aiScore);
        const overallScore = scores.reduce((acc, s) => acc + s, 0) / scores.length;

        const qaSummary = interview.questions
            .map((q, i) => `Q${i + 1}: ${q.question}\nAnswer: ${q.userAnswer}\nScore: ${q.aiScore}/10`)
            .join("\n\n");

        const prompt = `You are an expert career coach reviewing a mock interview.
Job Role: ${interview.jobRole}
Overall Score: ${overallScore.toFixed(1)}/10

Interview Summary:
${qaSummary}

Respond ONLY in this JSON format, no extra text, no markdown:
{
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "improvementTips": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "summary": "<3-4 line overall performance summary>"
}`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
        });

        const raw = completion.choices[0].message.content.trim();
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        const report = await Report.create({
            interview: interview._id,
            user: req.user._id,
            overallScore: parseFloat(overallScore.toFixed(1)),
            strengths: parsed.strengths,
            weaknesses: parsed.weaknesses,
            improvementTips: parsed.improvementTips,
            summary: parsed.summary,
        });

        interview.status = "completed";
        interview.overallScore = overallScore;
        await interview.save();

        await User.findByIdAndUpdate(req.user._id, {
            $inc: { interviewsCount: 1 },
        });

        res.json(report);
    } catch (error) {
        console.error("Generate report error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    generateInterview,
    getInterviewHistory,
    getInterviewById,
    submitAnswer,
    generateReport,
};