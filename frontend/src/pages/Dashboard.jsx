import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [userDescription, setUserDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('jobTitle', jobTitle);
      formData.append('jobDescription', jobDescription);
      formData.append('userDescription', userDescription);
      
      if (selectedFile) {
        formData.append('resume', selectedFile);
      }

      const response = await axios.post(
        'http://localhost:5000/api/interview-reports/generate',
        formData,
        {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      navigate(`/report/${response.data._id}`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert(`Error generating report: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '40px',
          fontSize: '42px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: '800'
        }}>
          🚀 Generate Interview Prep
        </h1>

        <div style={{ display: 'grid', gap: '40px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '28px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '600',
                fontSize: '16px',
                color: '#374151'
              }}>
                Job Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Frontend Engineer, Product Manager, Data Scientist"
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '600',
                fontSize: '16px',
                color: '#374151'
              }}>
                Job Description <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here..."
                rows="10"
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '600',
                fontSize: '16px',
                color: '#374151'
              }}>
                Your Background / Info
              </label>
              <textarea
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                placeholder="Tell us about your experience, skills, and background..."
                rows="4"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '600',
                fontSize: '16px',
                color: '#374151'
              }}>
                Upload Your Resume (PDF/DOCX)
              </label>
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                background: selectedFile ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'white'
              }}
                onClick={() => document.getElementById('resume-upload').click()}
              >
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                {selectedFile ? (
                  <div>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                    <p style={{ fontWeight: '600', color: '#166534', fontSize: '16px', marginBottom: '5px' }}>
                      {selectedFile.name}
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📎</div>
                    <p style={{ fontWeight: '600', color: '#374151', fontSize: '16px', marginBottom: '5px' }}>
                      Click to upload your resume
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                      Supports PDF and DOCX files
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '18px',
                fontSize: '18px',
                fontWeight: '700',
                marginTop: '12px'
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  ⏳ Generating Interview Prep...
                </span>
              ) : (
                '✨ Generate Interview Report'
              )}
            </button>
          </form>

          <div style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            padding: '32px',
            borderRadius: '20px',
            borderLeft: '6px solid #0ea5e9'
          }}>
            <h3 style={{ color: '#0c4a6e', marginBottom: '20px', fontSize: '22px', fontWeight: '700' }}>💡 How to Get the Best Results</h3>
            <ul style={{ marginLeft: '24px', color: '#4b5563', fontSize: '16px' }}>
              <li style={{ marginBottom: '12px' }}><strong>Paste the FULL job description</strong> - include requirements, responsibilities, and qualifications</li>
              <li style={{ marginBottom: '12px' }}><strong>Upload your resume</strong> - the more info we have, the more tailored your prep will be</li>
              <li style={{ marginBottom: '12px' }}><strong>Be specific about your background</strong> - tell us about your experience, skills, and achievements</li>
              <li style={{ marginBottom: '12px' }}><strong>Research the company</strong> - you can add that to your background section</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
