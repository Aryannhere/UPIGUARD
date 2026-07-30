import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await API.get('/transactions/history');
      setTransactions(response.data);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const totalTransactions = transactions.length;
  const highRisk = transactions.filter(t => t.riskLevel === 'HIGH').length;
  const mediumRisk = transactions.filter(t => t.riskLevel === 'MEDIUM').length;
  const lowRisk = transactions.filter(t => t.riskLevel === 'LOW').length;

  const getRiskBadge = (risk) => {
    if (risk === 'HIGH') return 'badge-high';
    if (risk === 'MEDIUM') return 'badge-medium';
    return 'badge-low';
  };

  const statCards = [
    { label: 'Total Transactions', value: totalTransactions, icon: 'bi-list-ul', color: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
    { label: 'High Risk', value: highRisk, icon: 'bi-shield-x', color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
    { label: 'Medium Risk', value: mediumRisk, icon: 'bi-shield-exclamation', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
    { label: 'Low Risk', value: lowRisk, icon: 'bi-shield-check', color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
      <Navbar />

      <div className="container py-4">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 fade-in-up">
          <div>
            <h4 style={{ color: '#e2e8f0', fontWeight: '700', marginBottom: '4px' }}>
              Welcome back, <span className="gradient-text">{user?.fullName}</span> 👋
            </h4>
            <p style={{ color: '#64748b', marginBottom: 0, fontSize: '0.9rem' }}>
              Here's your fraud detection overview
            </p>
          </div>
          <a href="/transaction/new"
            className="btn-glow"
            style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
            <i className="bi bi-plus-lg me-2"></i>New Transaction
          </a>
        </div>

        {/* Stat Cards */}
        <div className="row g-3 mb-4">
          {statCards.map((card, i) => (
            <div className="col-md-3 col-6" key={i}>
              <div className="stat-card fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{
                  width: '46px', height: '46px',
                  background: `rgba(${card.color === '#6366f1' ? '99,102,241' : card.color === '#ef4444' ? '239,68,68' : card.color === '#f59e0b' ? '245,158,11' : '16,185,129'},0.2)`,
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: `0 0 15px ${card.glow}`
                }}>
                  <i className={`bi ${card.icon}`} style={{ color: card.color, fontSize: '1.3rem' }}></i>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#e2e8f0', lineHeight: 1 }}>
                  {card.value}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '6px' }}>
                  {card.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="glass-card fade-in-up">
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span className="section-title">
              <i className="bi bi-clock-history me-2" style={{ color: '#6366f1' }}></i>
              Recent Transactions
            </span>
            <a href="/transaction/history"
              style={{ color: '#818cf8', fontSize: '0.85rem', textDecoration: 'none' }}>
              View all <i className="bi bi-arrow-right"></i>
            </a>
          </div>

          <div style={{ padding: '8px 0' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div className="spinner-border" style={{ color: '#6366f1' }}></div>
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
                <i className="bi bi-inbox" style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}></i>
                No transactions yet
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table dark-table mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Receiver</th>
                      <th>Amount</th>
                      <th>Fraud Score</th>
                      <th>Risk</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((t, i) => (
                      <tr key={t.id}>
                        <td style={{ color: '#475569' }}>{i + 1}</td>
                        <td>
                        <div style={{ color: 'black', fontWeight: '500' }}>
                          {t.receiverName}
                        </div>
                          <div style={{ color: '#475569', fontSize: '0.8rem' }}>{t.receiverUpiId}</div>
                        </td>
                        <td style={{ color: '#e2e8f0', fontWeight: '600' }}>
                          ₹{t.amount.toLocaleString()}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="dark-progress" style={{ width: '60px' }}>
                              <div style={{
                                height: '6px', borderRadius: '10px',
                                width: `${t.fraudScore}%`,
                                background: t.riskLevel === 'HIGH' ? '#ef4444' : t.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'
                              }} />
                            </div>
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{t.fraudScore}%</span>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;