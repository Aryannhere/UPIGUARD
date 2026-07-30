import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="dark-navbar navbar navbar-expand-lg sticky-top">
      <div className="container">

        {/* Brand */}
        <Link
          className="navbar-brand d-flex align-items-center gap-2"
          to={isAdmin() ? '/admin' : '/dashboard'}
        >
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99,102,241,0.5)'
          }}>
            <i className="bi bi-shield-check text-white" style={{ fontSize: '1.1rem' }}></i>
          </div>
          <span className="fw-bold fs-5 gradient-text">UPIGUARD</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: '#e2e8f0' }}
        >
          <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'} fs-4`}></i>
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto ms-3">
            {!isAdmin() && (
              <>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center gap-1"
                    style={{ color: '#94a3b8' }}
                    to="/dashboard">
                    <i className="bi bi-grid-1x2"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center gap-1"
                    style={{ color: '#94a3b8' }}
                    to="/transaction/new">
                    <i className="bi bi-send"></i> New Transaction
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center gap-1"
                    style={{ color: '#94a3b8' }}
                    to="/transaction/history">
                    <i className="bi bi-clock-history"></i> History
                  </Link>
                </li>
              </>
            )}
            {isAdmin() && (
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center gap-1"
                  style={{ color: '#94a3b8' }}
                  to="/admin">
                  <i className="bi bi-speedometer2"></i> Admin Dashboard
                </Link>
              </li>
            )}
          </ul>

          {/* Right side */}
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '8px 14px'
              }}>
              <div style={{
                width: '28px', height: '28px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <i className="bi bi-person text-white" style={{ fontSize: '0.8rem' }}></i>
              </div>
              <span style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '500' }}>
                {user?.fullName}
              </span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.25)'}
              onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.15)'}
            >
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;