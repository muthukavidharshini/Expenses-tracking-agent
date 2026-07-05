import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Loader, AlertTriangle, CheckCircle, Sparkles, X } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

function Budgets({ user, token }) {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);

  // Inputs
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');

  const categories = ["Food", "Transportation", "Entertainment", "Utilities", "Healthcare", "Shopping", "Rent", "Education", "Other"];

  useEffect(() => {
    fetchBudgetAnalysis();
  }, [month, year]);

  const fetchBudgetAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/budget-analysis/${user.id}?month=${month}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setAnalysisData(result.data);
      } else {
        setError(result.error || 'Failed to fetch budget performance');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to server failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/budget', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          category,
          monthly_limit: limit,
          month,
          year
        })
      });
      const result = await res.json();
      if (result.success) {
        setShowAddModal(false);
        setLimit('');
        fetchBudgetAnalysis();
      } else {
        alert(result.error || 'Failed to create budget');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/budget/${currentBudget.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          monthly_limit: limit
        })
      });
      const result = await res.json();
      if (result.success) {
        setShowEditModal(false);
        setLimit('');
        fetchBudgetAnalysis();
      } else {
        alert(result.error || 'Failed to update budget');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const handleDelete = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/budget/${budgetId}?user_id=${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        fetchBudgetAnalysis();
      } else {
        alert(result.error || 'Failed to delete budget');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const openEditModal = (catName, budgetedVal) => {
    getBudgetIdAndEdit(catName, budgetedVal);
  };

  const getBudgetIdAndEdit = async (catName, budgetedVal) => {
    try {
      const res = await fetch(`http://localhost:5000/api/budget/${user.id}?month=${month}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        const found = result.data.budgets.find(b => b.category === catName);
        if (found) {
          setCurrentBudget(found);
          setLimit(budgetedVal);
          setShowEditModal(true);
        } else {
          alert('Could not find budget record to update');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="page-hero">
        <div>
          <div className="section-kicker"><Sparkles size={12} /> Limits planner</div>
          <h1 className="hero-title">Budget Planner</h1>
          <p className="hero-copy">Establish category spending boundaries and track real-time allocations.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={18} /> Create Budget
        </button>
      </div>

      {/* Date Selectors */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <CustomSelect 
          value={month} 
          onChange={(e) => setMonth(parseInt(e.target.value))} 
          options={Array.from({ length: 12 }, (_, i) => ({
            value: i + 1,
            label: new Date(2026, i, 1).toLocaleString('default', { month: 'long' })
          }))}
          style={{ width: '150px' }}
        />
        <CustomSelect 
          value={year} 
          onChange={(e) => setYear(parseInt(e.target.value))} 
          options={[2024, 2025, 2026, 2027].map(yr => ({ value: yr, label: yr.toString() }))}
          style={{ width: '120px' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
        </div>
      ) : error ? (
        <div className="empty-state" style={{ color: 'var(--danger)' }}>{error}</div>
      ) : !analysisData ? (
        <div className="empty-state">No active budgets loaded for this cycle.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Summary Panel */}
          <div className="stats-grid">
            <div className="glass-card stat-card">
              <span className="stat-title">Total Budgeted</span>
              <div className="stat-value">₹{analysisData.summary.totalBudgeted.toLocaleString('en-IN')}</div>
              <div className="stat-meta" style={{ color: 'var(--text-muted)' }}>Limits combined</div>
            </div>
            <div className="glass-card stat-card">
              <span className="stat-title">Total Spent</span>
              <div className="stat-value" style={{ color: 'var(--accent)' }}>₹{analysisData.summary.totalSpent.toLocaleString('en-IN')}</div>
              <div className="stat-meta">{analysisData.summary.overallPercentage.toFixed(1)}% safe threshold utilized</div>
            </div>
            <div className="glass-card stat-card">
              <span className="stat-title">Remaining Buffer</span>
              <div className="stat-value" style={{ color: 'var(--success)' }}>₹{analysisData.summary.totalRemaining.toLocaleString('en-IN')}</div>
              <div className="stat-meta">Net remaining allowance</div>
            </div>
            <div className="glass-card stat-card">
              <span className="stat-title">Exceeded Categories</span>
              <div className="stat-value" style={{ color: analysisData.summary.categoriesOverBudget > 0 ? 'var(--danger)' : 'var(--success)' }}>
                {analysisData.summary.categoriesOverBudget}
              </div>
              <div className="stat-meta">Active limits warning alert</div>
            </div>
          </div>

          {/* Budget Analysis Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
            {Object.keys(analysisData.categoryAnalysis).length === 0 ? (
              <div className="glass-card empty-state">
                <p>No active category budgets established. Click Create Budget to outline monthly guidelines.</p>
              </div>
            ) : (
              Object.entries(analysisData.categoryAnalysis).map(([catName, details]) => {
                const percent = Math.min(100, details.percentage);
                const isOver = details.status === 'over';
                const isWarning = details.status === 'warning';
                const isNoBudget = details.status === 'no_budget';

                let barColor = 'success';
                if (isOver) barColor = 'danger';
                else if (isWarning) barColor = 'warning';

                return (
                  <motion.div 
                    key={catName} 
                    className="glass-card" 
                    style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                    whileHover={{ y: -2 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h4 style={{ fontWeight: '750', fontSize: '1.15rem', color: 'white' }}>{catName}</h4>
                        {isOver && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: '700', background: 'rgba(239, 68, 68, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>
                            <AlertTriangle size={13} /> Over Limit
                          </span>
                        )}
                        {isWarning && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', fontSize: '0.75rem', fontWeight: '700', background: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>
                            <AlertTriangle size={13} /> Warning (80%+)
                          </span>
                        )}
                        {details.budgeted > 0 && !isOver && !isWarning && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: '700', background: 'rgba(34, 197, 94, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>
                            <CheckCircle size={13} /> On Track
                          </span>
                        )}
                        {isNoBudget && (
                          <span style={{ background: 'var(--primary-glow)', color: 'var(--accent)', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: '600' }}>
                            No Budget Set
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ fontSize: '0.9rem', textAlign: 'right' }}>
                          <span style={{ fontWeight: '800', color: isOver ? 'var(--danger)' : 'white' }}>₹{details.spent.toLocaleString('en-IN')}</span>
                          <span style={{ color: 'var(--text-muted)' }}> / {details.budgeted > 0 ? `₹${details.budgeted.toLocaleString('en-IN')}` : 'Unregulated'}</span>
                        </div>

                        {!isNoBudget && (
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button onClick={() => openEditModal(catName, details.budgeted)} className="btn btn-secondary" style={{ padding: '0.45rem', borderRadius: '8px' }}>
                              <Edit2 size={13} />
                            </button>
                            <button 
                              onClick={async () => {
                                const res = await fetch(`http://localhost:5000/api/budget/${user.id}?month=${month}&year=${year}`, { headers: { 'Authorization': `Bearer ${token}` } });
                                const budgetList = await res.json();
                                const bRecord = budgetList.data.budgets.find(b => b.category === catName);
                                if (bRecord) handleDelete(bRecord.id);
                              }} 
                              className="btn btn-danger" 
                              style={{ padding: '0.45rem', borderRadius: '8px' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {details.budgeted > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div className="progress-container" style={{ height: '8px' }}>
                          <div className={`progress-bar ${barColor}`} style={{ width: `${percent}%` }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <span>{percent.toFixed(0)}% Budget Used</span>
                          <span style={{ fontWeight: '600', color: details.remaining >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {details.remaining >= 0 ? `₹${details.remaining.toFixed(0)} Remaining` : `₹${Math.abs(details.remaining).toFixed(0)} Exceeded`}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add Budget Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: '800', fontSize: '1.25rem' }}>Create Category Budget</h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleAddSubmit}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <CustomSelect 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    options={categories.filter(c => c !== 'Other')}
                    searchable={true}
                    placeholder="Select Category"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Limit (₹)</label>
                  <input type="number" className="form-input" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="e.g. 5000" required />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Budget</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Budget Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: '800', fontSize: '1.25rem' }}>Update Budget Limit</h3>
                <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input type="text" className="form-input" value={currentBudget ? currentBudget.category : ''} disabled style={{ opacity: 0.7 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Limit (₹)</label>
                  <input type="number" className="form-input" value={limit} onChange={(e) => setLimit(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Update Limit</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Budgets;
