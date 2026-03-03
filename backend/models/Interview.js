const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    userAnswer: {
        type: String,
        default: ''
    },
    aiScore: {   //0 to 10
        type: Number,
        default: 0
    },
    aifeedback: {
        type: String,
        default: ''
    }
});

const interviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobRole: {
        type: String,
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    questions: [questionSchema],
    overallScore: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    duration: {
        type: Number, // in seconds
        default: 0
    },
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);