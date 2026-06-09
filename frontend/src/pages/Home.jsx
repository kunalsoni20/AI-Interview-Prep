import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container">
      <div style={{
        textAlign: 'center',
        padding: '80px 20px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '56px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: '800'
        }}>
          🚀 AI Interview Prep
        </h1>
        <p style={{
          fontSize: '22px',
          color: '#d1d5db',
          marginBottom: '48px',
          lineHeight: '1.6'
        }}>
          Ace your next interview with AI-powered preparation
        </p>

        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '80px'
        }}>
          <Link to="/login">
            <button className="btn btn-primary" style={{ padding: '16px 48px', fontSize: '18px', fontWeight: '700' }}>
              Get Started
            </button>
          </Link>
          <Link to="/register">
            <button className="btn btn-secondary" style={{ padding: '16px 48px', fontSize: '18px', fontWeight: '700' }}>
              Sign Up Free
            </button>
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '28px',
          marginTop: '60px'
        }}>
          <div className="card" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🤖</div>
            <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '22px' }}>AI-Powered Questions</h3>
            <p style={{ color: '#d1d5db' }}>
              Get personalized interview questions tailored to your target role
            </p>
          </div>

          <div className="card" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '22px' }}>Smart Analysis</h3>
            <p style={{ color: '#d1d5db' }}>
              Detailed match score and skill gap analysis for your resume
            </p>
          </div>

          <div className="card" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📄</div>
            <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '22px' }}>Resume Builder</h3>
            <p style={{ color: '#d1d5db' }}>
              Generate tailored, ATS-friendly resumes in PDF format
            </p>
          </div>

          <div className="card" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📅</div>
            <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '22px' }}>Study Plans</h3>
            <p style={{ color: '#d1d5db' }}>
              Comprehensive 5-day preparation plans for success
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
