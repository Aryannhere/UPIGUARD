import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/axios';

function NewTransaction() {
  const [formData, setFormData] = useState({
    senderUpiId: '',
    receiverUpiId: '',
    receiverName: '',
    amount: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const response = await API.post('/transactions/submit', {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    if (risk === 'HIGH') return '#ef4444';
    if (risk === 'MEDIUM') return '#f59e0b';
    return '#10b981';
  };

  const getRiskIcon = (risk) => {
    if (risk === 'HIGH') return 'bi-shield-x';
    if (risk === 'MEDIUM') return 'bi-shield-exclamation';
    return 'bi-shield-check';
  };

  const getRiskMessage = (risk) => {
    if (risk === 'HIGH') return '🚨 High fraud risk detected! Transaction has been flagged.';
    if (risk === 'MEDIUM') return '⚠️ Moderate risk detected. Please verify before proceeding.';
    return '✅ Transaction appears safe. Low fraud risk detected.';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
      <Navbar />

      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-7">

            {/* Header */}
            <div className="fade-in-up" style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#e2e8f0', fontWeight: '700', marginBottom: '4px' }}>
                <i className="bi bi-send me-2" style={{ color: '#6366f1' }}></i>
                New UPI Transaction
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Submit a transaction to check for fraud
              </p>
            </div>

            {/* Form Card */}
            <div className="glass-card fade-in-up" style={{ padding: '32px', marginBottom: '24px' }}>

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
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="dark-label">Your UPI ID</label>
                    <input
                      type="text" name="senderUpiId"
                      className="form-control dark-input"
                      placeholder="yourname@okaxis"
                      value={formData.senderUpiId}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="dark-label">Receiver UPI ID</label>
                    <input
                      type="text" name="receiverUpiId"
                      className="form-control dark-input"
                      placeholder="receiver@okicici"
                      value={formData.receiverUpiId}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="dark-label">Receiver Name</label>
                    <input
                      type="text" name="receiverName"
                      className="form-control dark-input"
                      placeholder="Enter receiver name"
                      value={formData.receiverName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="dark-label">Amount (₹)</label>
                    <input
                      type="number" name="amount"
                      className="form-control dark-input"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required min="1"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-glow"
                  disabled={loading}
                  style={{ width: '100%', marginTop: '24px', padding: '14px', fontSize: '1rem' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Analyzing transaction...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-check me-2"></i>
                      Submit & Analyze Fraud
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Result Card */}
            {result && (
              <div className="fade-in-up glass-card" style={{
                padding: '32px',
                border: `1px solid ${getRiskColor(result.riskLevel)}40`,
                boxShadow: `0 0 30px ${getRiskColor(result.riskLevel)}20`
              }}>

                {/* Score Circle */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <div className={`score-circle ${result.riskLevel?.toLowerCase()}`}>
                    <div style={{
                      fontSize: '2rem', fontWeight: '800',
                      color: getRiskColor(result.riskLevel)
                    }}>
                      {result.fraudScore}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      Fraud Score
                    </div>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <span style={{
                      background: `${getRiskColor(result.riskLevel)}20`,
                      border: `1px solid ${getRiskColor(result.riskLevel)}40`,
                      color: getRiskColor(result.riskLevel),
                      borderRadius: '8px', padding: '6px 20px',
                      fontWeight: '700', fontSize: '0.9rem',
                      letterSpacing: '0.05em'
                    }}>
                      <i className={`bi ${getRiskIcon(result.riskLevel)} me-2`}></i>
                      {result.riskLevel} RISK
                    </span>
                  </div>

                  <p style={{
                    color: '#94a3b8', marginTop: '12px',
                    fontSize: '0.9rem'
                  }}>
                    {getRiskMessage(result.riskLevel)}
                  </p>
                </div>

                {/* Details */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px', padding: '20px'
                }}>
                  {[
                    { label: 'Amount', value: `₹${result.amount?.toLocaleString()}` },
                    { label: 'Status', value: result.status, color: getRiskColor(result.riskLevel) },
                    { label: 'Receiver', value: result.receiverName },
                    { label: 'Transaction ID', value: `#${result.id}` },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                    }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{item.label}</span>
                      <span style={{
                        color: item.color || '#e2e8f0',
                        fontWeight: '600', fontSize: '0.95rem'
                      }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewTransaction;