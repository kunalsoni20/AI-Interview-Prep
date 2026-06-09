const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Interview = require('../models/Interview');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/generate', protect, async (req, res) => {
  try {
    const { jobTitle, difficulty } = req.body;

    let questions;
    
    try {
      const prompt = `Generate 5 ${difficulty} interview questions for a ${jobTitle} position. Return only the questions as a JSON array.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      try {
        questions = JSON.parse(response.choices[0].message.content);
      } catch {
        const questionText = response.choices[0].message.content;
        questions = questionText.split('\n').filter(q => q.trim()).map((q, i) => q.replace(/^\d+\.\s*/, ''));
      }
    } catch (openAIError) {
      console.log('OpenAI not available, using mock questions');
      // Fallback to mock questions if OpenAI fails
      const mockQuestions = {
        easy: [
          `Tell me about yourself and why you want to work as a ${jobTitle}`,
          'What are your greatest strengths?',
          'Where do you see yourself in 5 years?',
          'Why should we hire you?',
          'What motivates you in your work?'
        ],
        medium: [
          `Describe a challenging project you worked on as a ${jobTitle}`,
          'How do you handle tight deadlines?',
          'Tell me about a time you worked in a team',
          'What technical skills do you bring to this role?',
          'How do you stay updated with industry trends?'
        ],
        hard: [
          `What's the most complex problem you've solved as a ${jobTitle}?`,
          'How do you approach decision-making under pressure?',
          'Describe a time you had to learn a new technology quickly',
          'How do you handle constructive criticism?',
          'What strategies do you use for problem-solving?'
        ]
      };
      questions = mockQuestions[difficulty] || mockQuestions.medium;
    }

    const interview = await Interview.create({
      user: req.user._id,
      jobTitle,
      difficulty,
      questions: questions.map(q => ({ question: q }))
    });

    res.status(201).json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/answer/:id', protect, async (req, res) => {
  try {
    const { questionIndex, answer } = req.body;
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const question = interview.questions[questionIndex];
    question.userAnswer = answer;

    let feedbackData;
    
    try {
      const prompt = `Evaluate this interview answer. Question: "${question.question}" Answer: "${answer}". Provide constructive feedback and a score from 0-100. Return as JSON with "feedback" and "score" fields.`;

      const aiResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      try {
        feedbackData = JSON.parse(aiResponse.choices[0].message.content);
      } catch {
        feedbackData = { feedback: aiResponse.choices[0].message.content, score: 70 };
      }
    } catch (openAIError) {
      console.log('OpenAI not available, using mock feedback');
      // Fallback to mock feedback if OpenAI fails
      const answerLength = answer.length;
      let score, feedback;
      
      if (answerLength > 200) {
        score = Math.floor(Math.random() * 20) + 80;
        feedback = "Great answer! You provided a comprehensive response with good details. Your answer shows thoughtfulness and good communication skills.";
      } else if (answerLength > 100) {
        score = Math.floor(Math.random() * 20) + 65;
        feedback = "Good answer! You covered the basics well. Consider adding more specific examples to strengthen your response.";
      } else {
        score = Math.floor(Math.random() * 20) + 50;
        feedback = "Your answer is a bit brief. Try to elaborate more with specific examples and details to showcase your skills better.";
      }
      
      feedbackData = { feedback, score };
    }

    question.aiFeedback = feedbackData.feedback;

    await interview.save();
    res.json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/complete/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.completed = true;
    const scores = interview.questions
      .filter(q => q.userAnswer)
      .map(() => Math.floor(Math.random() * 30) + 70);
    
    interview.score = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : 0;

    await interview.save();
    res.json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
