import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Interview = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [interview, setInterview] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [answered, setAnswered] = useState([])

  useEffect(() => {
    loadInterview()
  }, [id])

  const loadInterview = async () => {
    const res = await axios.get(`http://localhost:5000/api/interviews/${id}`)
    setInterview(res.data)
    const answeredIndices = res.data.questions
      .map((q, i) => q.userAnswer ? i : -1)
      .filter(i => i !== -1)
    setAnswered(answeredIndices)
    if (answeredIndices.length > 0) {
      setCurrentQuestion(answeredIndices[answeredIndices.length - 1])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post(`http://localhost:5000/api/interviews/answer/${id}`, {
        questionIndex: currentQuestion,
        answer
      })
      setInterview(res.data)
      setAnswered([...answered, currentQuestion])
    } catch (err) {
      console.error(err)
      alert('Failed to submit answer')
    }
    setLoading(false)
  }

  const handleComplete = async () => {
    try {
      await axios.post(`http://localhost:5000/api/interviews/complete/${id}`)
      navigate('/history')
    } catch (err) {
      console.error(err)
      alert('Failed to complete interview')
    }
  }

  if (!interview) return <div style={{ color: 'white' }}>Loading...</div>

  const question = interview.questions[currentQuestion]
  const allAnswered = answered.length === interview.questions.length

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '16px' }}>{interview.jobTitle} Interview</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Difficulty: {interview.difficulty.charAt(0).toUpperCase() + interview.difficulty.slice(1)}
        </p>
        
        <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
          {interview.questions.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrentQuestion(i)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: answered.includes(i) 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : i === currentQuestion 
                  ? '#e5e7eb' 
                  : '#f3f4f6',
                color: answered.includes(i) ? 'white' : '#374151',
                fontWeight: 'bold'
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className="question-card">
          <h3 style={{ marginBottom: '16px' }}>Question {currentQuestion + 1}</h3>
          <p style={{ fontSize: '18px', marginBottom: '16px' }}>{question.question}</p>

          {question.userAnswer ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <strong>Your Answer:</strong>
                <p style={{ marginTop: '8px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                  {question.userAnswer}
                </p>
              </div>
              {question.aiFeedback && (
                <div className="feedback">
                  <strong>AI Feedback:</strong>
                  <p style={{ marginTop: '8px' }}>{question.aiFeedback}</p>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <textarea
                rows="6"
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Getting Feedback...' : 'Submit Answer'}
              </button>
            </form>
          )}
        </div>

        {allAnswered && !interview.completed && (
          <button className="btn btn-primary" onClick={handleComplete} style={{ width: '100%' }}>
            Complete Interview
          </button>
        )}
      </div>
    </div>
  )
}

export default Interview
