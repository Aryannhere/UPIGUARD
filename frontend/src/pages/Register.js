import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await API.post('/auth/register', formData);
      const { token, email, fullName, role } = response.data;
      login({ email, fullName, role }, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Background blobs */}
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        top: '-100px', right: '-100px', borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute', width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
        bottom: '-50px', left: '-50px', borderRadius: '50%'
      }} />

      <div className="fade-in-up" style={{ width: '100%', maxWidth: '440px', padding: '20px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '70px', height: '70px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '20px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(99,102,241,0.5)',
            marginBottom: '16px'
          }}>
            <i className="bi bi-shield-check text-white" style={{ fontSize: '2rem' }}></i>
          </div>
          <h2 className="gradient-text fw-bold" style={{ fontSize: '2rem' }}>UPIGUARD</h2>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Create your account</p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '36px' }}>
          <h5 style={{ color: '#e2e8f0', marginBottom: '24px', fontWeight: '600' }}>
            Get Started 🚀
          </h5>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', borderRadius: '10px',
              padding: '12px 16px', marginBottom: '20px', fontSize: '0.9rem'
            }}>
              <i className="bi bi-exclamation-circle me-2"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label className="dark-label">Full Name</label>
              <input
                type="text" name="fullName"
                className="form-control dark-input"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label className="dark-label">Email Address</label>
              <input
                type="email" name="email"
                className="form-control dark-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label className="dark-label">Phone Number</label>
              <input
                type="tel" name="phone"
                className="form-control dark-input"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label className="dark-label">Password</label>
              <input
                type="password" name="password"
                className="form-control dark-input"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="btn-glow w-100"
              disabled={loading}
              style={{ width: '100%', padding: '13px' }}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Creating account...</>
              ) : (
                <><i className="bi bi-person-plus me-2"></i>Create Account</>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: '#64748b', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', fontWeight: '600', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;