import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '500px', margin: '60px auto' }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '40px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '36px'
        }}>
          Create Account
        </h1>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: '600',
              fontSize: '15px',
              color: '#374151'
            }}>
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your full name"
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: '600',
              fontSize: '15px',
              color: '#374151'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: '600',
              fontSize: '15px',
              color: '#374151'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="•••••••• (min 6 characters)"
              minLength="6"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '16px',
              fontSize: '17px',
              fontWeight: '700',
              marginTop: '8px'
            }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p style={{
          textAlign: 'center',
          marginTop: '32px',
          color: '#6b7280',
          fontSize: '15px'
        }}>
          Already have an account? <Link to="/login" style={{ color: '#667eea', fontWeight: '600' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
