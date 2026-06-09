import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const History = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/interviews', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setReports(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await axios.delete(`http://localhost:5000/api/interview-reports/${id}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        fetchReports();
      } catch (error) {
        console.error(error);
        alert('Error deleting report');
      }
    }
  };

  const clearAllHistory = async () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      try {
        await axios.delete('http://localhost:5000/api/interview-reports/', {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        fetchReports();
      } catch (error) {
        console.error(error);
        alert('Error clearing history');
      }
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
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <p style={{ fontSize: '20px', fontWeight: '600' }}>Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <h1 style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '42px',
          margin: 0
        }}>
          Interview History
        </h1>
        {reports.length > 0 && (
          <button
            onClick={clearAllHistory}
            className="btn btn-secondary"
            style={{ borderColor: '#ef4444', color: '#ef4444' }}
          >
            Clear All History
          </button>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="card" style={{
          textAlign: 'center',
          padding: '80px 40px'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '24px' }}>📊</div>
          <h2 style={{ marginBottom: '16px', color: '#374151' }}>No Reports Yet</h2>
          <p style={{ marginBottom: '32px', color: '#6b7280' }}>
            Generate your first interview report to get started!
          </p>
          <Link to="/dashboard">
            <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '18px' }}>
              Generate Report
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '24px' }}>
          {reports.map((report) => (
            <div key={report._id} className="card" style={{
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '24px',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: '1', minWidth: '250px' }}>
                  <h3 style={{
                    marginBottom: '12px',
                    color: '#374151',
                    fontSize: '24px'
                  }}>
                    {report.jobTitle}
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    marginBottom: '16px',
                    fontSize: '14px'
                  }}>
                    {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Link to={`/report/${report._id}`}>
                      <button className="btn btn-primary" style={{ padding: '10px 24px' }}>
                        View Report
                      </button>
                    </Link>
                    <button
                      onClick={() => deleteReport(report._id)}
                      className="btn btn-secondary"
                      style={{
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        padding: '10px 24px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div style={{
                  minWidth: '120px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '48px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {report.matchScore}%
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: '600',
                    marginTop: '4px'
                  }}>
                    Match Score
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
