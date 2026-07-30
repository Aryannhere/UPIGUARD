import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/axios';

function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

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

  const filtered = transactions
    .filter(t => filter === 'ALL' || t.riskLevel === filter)
    .filter(t =>
      search === '' ||
      t.receiverName?.toLowerCase().includes(search.toLowerCase()) ||
      t.receiverUpiId?.toLowerCase().includes(search.toLowerCase())
    );

  const filterButtons = ['ALL', 'LOW', 'MEDIUM', 'HIGH'];

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
      <Navbar />

      <div className="container py-4">

        {/* Header */}
        <div className="fade-in-up" style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#e2e8f0', fontWeight: '700', marginBottom: '4px' }}>
            <i className="bi bi-clock-history me-2" style={{ color: '#6366f1' }}></i>
            Transaction History
          </h4>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {transactions.length} total transactions
          </p>
        </div>

        <div className="glass-card fade-in-up">

          {/* Filters */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: '12px'
          }}>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              {
                <input
                  type="text"
                  className="form-control dark-input"
                  placeholder="🔍  Search by name or UPI ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: '250px' }}
                />
              }
            </div>

            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {filterButtons.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '8px',
                    border: '1px solid',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    borderColor: filter === f ? '#6366f1' : 'rgba(255,255,255,0.1)',
                    background: filter === f
                      ? 'rgba(99,102,241,0.2)'
                      : 'rgba(255,255,255,0.03)',
                    color: filter === f ? '#818cf8' : '#64748b',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ padding: '8px 0' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div className="spinner-border" style={{ color: '#6366f1' }}></div>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
                <i className="bi bi-inbox" style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}></i>
                No transactions found
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table dark-table mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Sender UPI</th>
                      <th>Receiver</th>
                      <th>Amount</th>
                      <th>Fraud Score</th>
                      <th>Risk</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t, i) => (
                      <tr key={t.id}>
                        <td style={{ color: '#475569' }}>{i + 1}</td>
                        <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                          {t.senderUpiId}
                        </td>
                        <td>
                          <div style={{ color: '#000000', fontWeight: '500' }}>
                            {t.receiverName}
                          </div>
                          <div style={{ color: '#475569', fontSize: '0.8rem' }}>
                            {t.receiverUpiId}
                          </div>
                        </td>
                        <td style={{ color: '#e2e8f0', fontWeight: '600' }}>
                          ₹{t.amount.toLocaleString()}
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
                        <td>
                          <span className={getRiskBadge(t.riskLevel)}>
                            {t.riskLevel}
                          </span>
                        </td>
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

export default History;