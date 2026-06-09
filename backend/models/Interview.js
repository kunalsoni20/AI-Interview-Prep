const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  userDescription: {
    type: String
  },
  resumeText: {
    type: String
  },
  matchScore: {
    type: Number
  },
  technicalQuestions: [
    {
      question: { type: String },
      explanation: { type: String },
      suggestedAnswer: { type: String }
    }
  ],
  behavioralQuestions: [
    {
      question: { type: String },
      starGuidance: { type: String }
    }
  ],
  skillGaps: [
    {
      skill: { type: String },
      severity: { type: String, enum: ['high', 'medium', 'low'] }
    }
  ],
  preparationPlan: [
    {
      day: { type: Number },
      tasks: [{ type: String }]
    }
  ],
  resumeHtml: {
    type: String
  },
  questions: [
    {
      question: { type: String, required: true },
      userAnswer: { type: String },
      aiFeedback: { type: String }
    }
  ],
  completed: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema);
