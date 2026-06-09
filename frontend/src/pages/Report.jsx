import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const Report = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/interviews/${id}`);
      setReport(res.data);
    } catch (error) {
      console.error(error);
      alert('Failed to load report');
    }
    setLoading(false);
  };

  const downloadResume = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/interview-reports/${id}/resume`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Tailored-Resume-${report.jobTitle}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert('Failed to download resume');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '90vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏳</div>
          <p style={{ fontSize: '24px', fontWeight: '600' }}>Generating your interview preparation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <Link to="/history" style={{ textDecoration: 'none' }}>
          <button className="btn btn-secondary">
            ← Back to History
          </button>
        </Link>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={downloadResume}>
            📄 Download Tailored Resume
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '40px', paddingBottom: '30px', borderBottom: '2px solid #f3f4f6' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🚀</div>
          <h1 style={{ 
            fontSize: '40px',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: '800'
          }}>
            {report.jobTitle}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '8px', fontWeight: '500' }}>
            Complete Interview Preparation Guide
          </p>
          <p style={{ color: '#9ca3af', fontSize: '15px' }}>
            Generated on {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '60px 40px', 
          borderRadius: '24px', 
          textAlign: 'center',
          marginBottom: '40px',
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', opacity: 0.95, letterSpacing: '1px' }}>
            PROFILE MATCH SCORE
          </div>
          <div style={{ 
            fontSize: '96px', 
            fontWeight: '900', 
            marginBottom: '12px',
            textShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            {report.matchScore}%
          </div>
          <p style={{ fontSize: '20px', opacity: 0.98, fontWeight: '600' }}>
            {report.matchScore >= 80 ? 'Excellent match! You are a very strong candidate! 🌟' : 
             report.matchScore >= 70 ? 'Great match! Focus on the improvement areas below 📈' : 
             'Good potential - follow the preparation plan carefully 💪'}
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          borderBottom: '2px solid #f3f4f6', 
          marginBottom: '36px',
          overflowX: 'auto',
          gap: '8px',
          paddingBottom: '4px'
        }}>
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'technical', label: '💻 Technical' },
            { id: 'behavioral', label: '🎯 Behavioral' },
            { id: 'gaps', label: '🔍 Skill Gaps' },
            { id: 'plan', label: '📅 Prep Plan' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 28px',
                border: 'none',
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'transparent',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: activeTab === tab.id ? '700' : '600',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                borderRadius: '16px',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(102,126,234,0.3)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '10px 0' }}>
          {activeTab === 'overview' && (
            <div>
              <h3 style={{ marginBottom: '28px', color: '#374151', fontSize: '24px', fontWeight: '700' }}>Quick Overview</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
                gap: '20px' 
              }}>
                <div className="card" style={{ 
                  margin: 0, 
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
                  borderLeft: '6px solid #0ea5e9',
                  padding: '28px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>💻</div>
                  <h4 style={{ color: '#0c4a6e', marginBottom: '12px', fontSize: '20px', fontWeight: '700' }}>Technical Questions</h4>
                  <p style={{ fontSize: '40px', fontWeight: '900', color: '#0ea5e9', margin: 0 }}>
                    {report.technicalQuestions?.length || 0}
                  </p>
                </div>
                <div className="card" style={{ 
                  margin: 0, 
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
                  borderLeft: '6px solid #22c55e',
                  padding: '28px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
                  <h4 style={{ color: '#166534', marginBottom: '12px', fontSize: '20px', fontWeight: '700' }}>Behavioral Questions</h4>
                  <p style={{ fontSize: '40px', fontWeight: '900', color: '#22c55e', margin: 0 }}>
                    {report.behavioralQuestions?.length || 0}
                  </p>
                </div>
                <div className="card" style={{ 
                  margin: 0, 
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
                  borderLeft: '6px solid #f59e0b',
                  padding: '28px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                  <h4 style={{ color: '#92400e', marginBottom: '12px', fontSize: '20px', fontWeight: '700' }}>Skill Gaps</h4>
                  <p style={{ fontSize: '40px', fontWeight: '900', color: '#f59e0b', margin: 0 }}>
                    {report.skillGaps?.length || 0}
                  </p>
                </div>
                <div className="card" style={{ 
                  margin: 0, 
                  background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)', 
                  borderLeft: '6px solid #a855f7',
                  padding: '28px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
                  <h4 style={{ color: '#7e22ce', marginBottom: '12px', fontSize: '20px', fontWeight: '700' }}>Preparation Days</h4>
                  <p style={{ fontSize: '40px', fontWeight: '900', color: '#a855f7', margin: 0 }}>
                    {report.preparationPlan?.length || 0}
                  </p>
                </div>
              </div>
              <div className="card" style={{ marginTop: '32px', background: '#f8fafc', border: '2px dashed #cbd5e1' }}>
                <h4 style={{ marginBottom: '16px', color: '#374151', fontSize: '18px', fontWeight: '700' }}>💡 How to Use This Guide</h4>
                <ul style={{ marginLeft: '20px', color: '#4b5563', fontSize: '16px' }}>
                  <li style={{ marginBottom: '10px' }}>Go through each tab for detailed preparation materials</li>
                  <li style={{ marginBottom: '10px' }}>Practice all the technical and behavioral questions</li>
                  <li style={{ marginBottom: '10px' }}>Follow the 5-day preparation plan step-by-step</li>
                  <li style={{ marginBottom: '10px' }}>Download and customize your tailored resume</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div>
              <h3 style={{ marginBottom: '32px', color: '#374151', fontSize: '24px', fontWeight: '700' }}>Technical Interview Questions</h3>
              {report.technicalQuestions?.map((q, index) => (
                <div key={index} className="card" style={{ 
                  marginBottom: '28px', 
                  border: '2px solid #f3f4f6',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                    <span style={{ 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: '900',
                      fontSize: '18px',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
                    }}>
                      {index + 1}
                    </span>
                    <h4 style={{ color: '#374151', margin: 0, fontSize: '20px', fontWeight: '700', paddingTop: '6px' }}>
                      {q.question}
                    </h4>
                  </div>
                  {q.explanation && (
                    <div style={{ 
                      background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)', 
                      padding: '18px 24px', 
                      borderRadius: '14px', 
                      marginBottom: '18px',
                      marginLeft: '60px',
                      borderLeft: '4px solid #14b8a6'
                    }}>
                      <p style={{ margin: 0, color: '#115e59', fontWeight: '600', fontSize: '15px' }}>
                        💡 <strong>Why this question is asked:</strong> {q.explanation}
                      </p>
                    </div>
                  )}
                  {q.suggestedAnswer && (
                    <div style={{ 
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
                      padding: '22px 26px', 
                      borderRadius: '16px', 
                      marginLeft: '60px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        marginBottom: '14px', 
                        color: '#166534', 
                        fontWeight: '800',
                        fontSize: '17px'
                      }}>
                        ✨ Suggested Answer
                      </div>
                      <div style={{ 
                        color: '#166534', 
                        lineHeight: '1.8', 
                        whiteSpace: 'pre-line',
                        fontSize: '16px'
                      }}>
                        {q.suggestedAnswer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'behavioral' && (
            <div>
              <h3 style={{ marginBottom: '32px', color: '#374151', fontSize: '24px', fontWeight: '700' }}>STAR Format Behavioral Questions</h3>
              {report.behavioralQuestions?.map((q, index) => (
                <div key={index} className="card" style={{ 
                  marginBottom: '28px', 
                  border: '2px solid #f3f4f6',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                    <span style={{ 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: '900',
                      fontSize: '18px',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
                    }}>
                      {index + 1}
                    </span>
                    <h4 style={{ color: '#374151', margin: 0, fontSize: '20px', fontWeight: '700', paddingTop: '6px' }}>
                      {q.question}
                    </h4>
                  </div>
                  {q.starGuidance && (
                    <div style={{ 
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
                      padding: '24px 28px', 
                      borderRadius: '16px', 
                      marginLeft: '60px',
                      border: '1px solid #fcd34d'
                    }}>
                      <div style={{ 
                        color: '#92400e', 
                        fontWeight: '800',
                        fontSize: '17px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        ⭐ STAR Method Guidance
                      </div>
                      <div style={{ 
                        color: '#78350f', 
                        lineHeight: '1.9', 
                        whiteSpace: 'pre-line',
                        fontSize: '16px'
                      }}>
                        {q.starGuidance}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'gaps' && (
            <div>
              <h3 style={{ marginBottom: '28px', color: '#374151', fontSize: '24px', fontWeight: '700' }}>Skill Gaps & Areas to Focus On</h3>
              <div style={{ display: 'grid', gap: '18px' }}>
                {report.skillGaps?.map((gap, index) => (
                  <div key={index} className="card" style={{ 
                    marginBottom: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '24px 28px',
                    background: gap.severity === 'high' 
                      ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                      : gap.severity === 'medium'
                      ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                      : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    border: '2px solid',
                    borderColor: gap.severity === 'high' ? '#fecaca' : gap.severity === 'medium' ? '#fef3c7' : '#bbf7d0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '32px' }}>
                        {gap.severity === 'high' ? '🔴' : gap.severity === 'medium' ? '🟡' : '🟢'}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '18px', color: '#374151', fontWeight: '700' }}>{gap.skill}</h4>
                    </div>
                    <span className={`score-badge ${gap.severity === 'high' ? 'score-low' : gap.severity === 'medium' ? 'score-medium' : 'score-high'}`} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '700' }}>
                      {gap.severity.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="card" style={{ marginTop: '32px', background: '#f8fafc' }}>
                <h4 style={{ marginBottom: '16px', color: '#374151', fontSize: '18px', fontWeight: '700' }}>📚 Recommendations for Improvement</h4>
                <ul style={{ marginLeft: '20px', color: '#4b5563', fontSize: '16px' }}>
                  <li style={{ marginBottom: '10px' }}>Study the high-severity gaps first - they'll have the biggest impact</li>
                  <li style={{ marginBottom: '10px' }}>Use online courses (Coursera, Udemy) to upskill in these areas</li>
                  <li style={{ marginBottom: '10px' }}>Build small projects to practice these skills</li>
                  <li style={{ marginBottom: '10px' }}>Prepare stories about how you're learning and improving</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'plan' && (
            <div>
              <h3 style={{ marginBottom: '32px', color: '#374151', fontSize: '24px', fontWeight: '700' }}>5-Day Interview Preparation Plan</h3>
              {report.preparationPlan?.map((day, index) => (
                <div key={index} className="card" style={{ 
                  marginBottom: '24px', 
                  border: '2px solid #f3f4f6',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '18px', 
                    marginBottom: '20px',
                    paddingBottom: '16px',
                    borderBottom: '2px solid #f9fafb'
                  }}>
                    <span style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '18px', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: '900',
                      fontSize: '24px',
                      boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
                    }}>
                      {day.day}
                    </span>
                    <div>
                      <h4 style={{ color: '#374151', margin: 0, fontSize: '22px', fontWeight: '800' }}>
                        Day {day.day}
                      </h4>
                      <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px', fontWeight: '500' }}>
                        {day.day === 1 ? 'Foundation & Research' : 
                         day.day === 2 ? 'Technical Deep Dive' :
                         day.day === 3 ? 'Practice & Mock Interviews' :
                         day.day === 4 ? 'Refinement & Story Prep' : 'Final Prep & Relaxation'}
                      </p>
                    </div>
                  </div>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '78px',
                    listStyle: 'none'
                  }}>
                    {day.tasks?.map((task, taskIndex) => (
                      <li key={taskIndex} style={{ 
                        marginBottom: '14px', 
                        fontSize: '16px', 
                        color: '#4b5563',
                        padding: '12px 16px',
                        background: '#fafafa',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontWeight: '500'
                      }}>
                        <span style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: '50%', 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                          color: 'white', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: '700',
                          fontSize: '14px'
                        }}>✓</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;
