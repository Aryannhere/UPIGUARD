import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/axios';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('transactions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, txnRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/transactions'),
        API.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setTransactions(txnRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/toggle`);
      fetchData();
    } catch (err) {
      console.error('Failed to toggle user status', err);
    }
  };

  const getRiskColor = (risk) => {
    if (risk === 'HIGH') return '#ef4444';
    if (risk === 'MEDIUM') return '#f59e0b';
    return '#10b981';
  };

  const getRiskBadge = (risk) => {
    if (risk === 'HIGH') return 'badge-high';
    if (risk === 'MEDIUM') return 'badge-medium';
    return 'badge-low';
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: 'bi-people', color: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
    { label: 'Total Transactions', value: stats.totalTransactions, icon: 'bi-list-ul', color: '#06b6d4', glow: 'rgba(6,182,212,0.3)' },
    { label: 'High Risk', value: stats.highRisk, icon: 'bi-shield-x', color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
    { label: 'Medium Risk', value: stats.mediumRisk, icon: 'bi-shield-exclamation', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
    { label: 'Low Risk', value: stats.lowRisk, icon: 'bi-shield-check', color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
  ] : [];

  const tabs = [
    { id: 'transactions', label: 'Transactions', icon: 'bi-list-ul' },
    { id: 'users', label: 'Users', icon: 'bi-people' },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <div className="spinner-border" style={{ color: '#6366f1', width: '3rem', height: '3rem' }}></div>
          <p style={{ color: '#64748b', marginTop: '16px' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
      <Navbar />

      <div className="container py-4">

        {/* Header */}
        <div className="fade-in-up" style={{ marginBottom: '28px' }}>
          <h4 style={{ color: '#e2e8f0', fontWeight: '700', marginBottom: '4px' }}>
            <i className="bi bi-speedometer2 me-2" style={{ color: '#6366f1' }}></i>
            Admin Dashboard
          </h4>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            System-wide fraud detection overview
          </p>
        </div>

        {/* Stat Cards */}
        <div className="row g-3 mb-4">
          {statCards.map((card, i) => (
            <div className="col-md col-6" key={i}>
              <div className="stat-card fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{
                  width: '42px', height: '42px',
                  borderRadius: '10px',
                  background: `${card.glow.replace('0.3', '0.15')}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '14px',
                  boxShadow: `0 0 15px ${card.glow}`
                }}>
                  <i className={`bi ${card.icon}`} style={{ color: card.color, fontSize: '1.2rem' }}></i>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#e2e8f0', lineHeight: 1 }}>
                  {card.value}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '6px' }}>
                  {card.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', padding: '4px',
          marginBottom: '20px', width: 'fit-content'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 20px', borderRadius: '8px',
                border: 'none', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: '500',
                transition: 'all 0.2s ease',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#64748b',
                boxShadow: activeTab === tab.id
                  ? '0 0 15px rgba(99,102,241,0.4)' : 'none'
              }}
            >
              <i className={`bi ${tab.icon} me-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="glass-card fade-in-up">
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              <span className="section-title">
                All Transactions ({transactions.length})
              </span>
            </div>
            <div className="table-responsive">
              <table className="table dark-table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sender</th>
                    <th>Receiver</th>
                    <th>Amount</th>
                    <th>Fraud Score</th>
                    <th>Risk</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={t.id}>
                      <td style={{ color: '#475569' }}>{i + 1}</td>
                      <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        {t.senderUpiId}
                      </td>
                      <td>
                        <div style={{ color: '#e2e8f0', fontWeight: '500' }}>{t.receiverName}</div>
                        <div style={{ color: '#475569', fontSize: '0.8rem' }}>{t.receiverUpiId}</div>
                      </td>
                      <td style={{ color: '#e2e8f0', fontWeight: '600' }}>
                        ₹{t.amount?.toLocaleString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="dark-progress" style={{ width: '50px' }}>
                            <div style={{
                              height: '6px', borderRadius: '10px',
                              width: `${t.fraudScore}%`,
                              background: getRiskColor(t.riskLevel)
                            }} />
                          </div>
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                            {t.fraudScore}%
                          </span>
                        </div>
                      </td>
                      <td><span className={getRiskBadge(t.riskLevel)}>{t.riskLevel}</span></td>
                      <td>
                        <span className={t.status === 'FLAGGED' ? 'badge-flagged' : 'badge-success-tx'}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ color: '#475569', fontSize: '0.85rem' }}>
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="glass-card fade-in-up">
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              <span className="section-title">
                All Users ({users.length})
              </span>
            </div>
            <div className="table-responsive">
              <table className="table dark-table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Transactions</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id}>
                      <td style={{ color: '#475569' }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px', height: '32px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', color: '#fff', fontWeight: '600'
                          }}>
                            {u.fullName?.charAt(0)}
                          </div>
                          <span style={{ color: '#e2e8f0', fontWeight: '500' }}>{u.fullName}</span>
                        </div>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.9rem' }}>{u.email}</td>
                      <td style={{ color: '#64748b', fontSize: '0.9rem' }}>{u.phone}</td>
                      <td style={{ color: '#94a3b8' }}>{u.totalTransactions}</td>
                      <td>
                        <span style={{
                          background: u.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          border: `1px solid ${u.isActive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          color: u.isActive ? '#34d399' : '#f87171',
                          borderRadius: '6px', padding: '4px 10px',
                          fontSize: '0.85rem', fontWeight: '500'
                        }}>
                          {u.isActive ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          style={{
                            background: u.isActive ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                            border: `1px solid ${u.isActive ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                            color: u.isActive ? '#f87171' : '#34d399',
                            borderRadius: '8px', padding: '6px 14px',
                            cursor: 'pointer', fontSize: '0.85rem',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {u.isActive ? 'Block' : 'Unblock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;