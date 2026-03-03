const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    interview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    overallScore: { type: Number, required: true },
    strengths: [String],
    weaknesses: [String],
    improvementAreas: [String],
    fillerWordsCount: { type: Number, default: 0 },
    summary: { type: String},
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);