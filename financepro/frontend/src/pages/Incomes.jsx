import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Edit2, Loader, ArrowLeft, ArrowRight, Sparkles, X } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

function Incomes({ user, token }) {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Table configurations
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentIncome, setCurrentIncome] = useState(null);

  // Inputs
  const [amount, setAmount] = useState('');
  const [incCategory, setIncCategory] = useState('Salary');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const categories = [
    "Bonus",
    "Business",
    "Cashback",
    "Dividends",
    "Freelancing",
    "Gifts",
    "Interest",
    "Investments",
    "Other",
    "Pension",
    "Refund",
    "Rental Income",
    "Salary"
  ];

  useEffect(() => {
    fetchIncomes();
  }, [month, year, search, category, page]);

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/income/${user.id}?month=${month}&year=${year}&search=${search}&category=${category}&page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setIncomes(result.data.incomeTransactions);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        setError(result.error || 'Failed to fetch incomes');
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
      const res = await fetch('http://localhost:5000/api/income', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          category: incCategory,
          amount,
          date,
          notes
        })
      });
      const result = await res.json();
      if (result.success) {
        setShowAddModal(false);
        resetForm();
        fetchIncomes();
      } else {
        alert(result.error || 'Failed to add income');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/income/${currentIncome.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          category: incCategory,
          amount,
          date,
          notes
        })
      });
      const result = await res.json();
      if (result.success) {
        setShowEditModal(false);
        resetForm();
        fetchIncomes();
      } else {
        alert(result.error || 'Failed to update income');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income transaction?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/income/${id}?user_id=${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        fetchIncomes();
      } else {
        alert(result.error || 'Failed to delete income');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const openEditModal = (inc) => {
    setCurrentIncome(inc);
    setAmount(inc.amount);
    setIncCategory(inc.category);
    setDate(new Date(inc.date).toISOString().split('T')[0]);
    setNotes(inc.notes || '');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setAmount('');
    setIncCategory('Salary');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  return (
    <div className="page-shell">
      <div className="page-hero">
        <div>
          <div className="section-kicker"><Sparkles size={12} /> Revenue flow</div>
          <h1 className="hero-title">Income Management</h1>
          <p className="hero-copy">Track and monitor your incoming streams, salaries, and freelancing revenues.</p>
        </div>
        <button onClick={() => { resetForm(); setShowAddModal(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={18} /> Add Income
        </button>
      </div>

      {/* Filter panel */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search income notes..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="form-input" 
            style={{ paddingLeft: '2.6rem' }}
          />
        </div>

        {/* Filters */}
        <CustomSelect 
          value={category} 
          onChange={(e) => { setCategory(e.target.value); setPage(1); }} 
          options={[
            { value: "", label: "All Categories" },
            ...categories.map(cat => ({ value: cat, label: cat }))
          ]}
          placeholder="All Categories"
          style={{ width: '160px' }}
        />

        <CustomSelect 
          value={month} 
          onChange={(e) => { setMonth(parseInt(e.target.value)); setPage(1); }} 
          options={Array.from({ length: 12 }, (_, i) => ({
            value: i + 1,
            label: new Date(2026, i, 1).toLocaleString('default', { month: 'long' })
          }))}
          style={{ width: '135px' }}
        />

        <CustomSelect 
          value={year} 
          onChange={(e) => { setYear(parseInt(e.target.value)); setPage(1); }} 
          options={[2024, 2025, 2026, 2027].map(yr => ({ value: yr, label: yr.toString() }))}
          style={{ width: '92px' }}
        />
      </div>

      {/* Main Income Table */}
      <div className="glass-card" style={{ padding: '0.85rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
          </div>
        ) : error ? (
          <div className="empty-state" style={{ color: 'var(--danger)' }}>{error}</div>
        ) : incomes.length === 0 ? (
          <div className="empty-state">No income records found matching your filters.</div>
        ) : (
          <div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Notes</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map(inc => (
                    <tr key={inc.id}>
                      <td>
                        <span className="badge badge-income">
                          {inc.category}
                        </span>
                      </td>
                      <td style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--success)' }}>+₹{inc.amount.toLocaleString('en-IN')}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{new Date(inc.date).toLocaleDateString()}</td>
                      <td style={{ color: 'var(--text-paragraph)' }}>{inc.notes || '-'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => openEditModal(inc)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '8px' }}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(inc.id)} className="btn btn-danger" style={{ padding: '0.4rem', borderRadius: '8px' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', marginTop: '1.5rem' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary" style={{ padding: '0.45rem 0.8rem' }}>
                  <ArrowLeft size={16} />
                </button>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-secondary" style={{ padding: '0.45rem 0.8rem' }}>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: '800', fontSize: '1.25rem' }}>Add Income</h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleAddSubmit}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <CustomSelect 
                    value={incCategory} 
                    onChange={(e) => setIncCategory(e.target.value)}
                    options={categories}
                    searchable={true}
                    placeholder="Select Category"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" step="0.01" className="form-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date Received</label>
                  <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" value={notes} onChange={(e) => setNotes(e.target.value)} rows="2" placeholder="Write source info..."></textarea>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Income</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: '800', fontSize: '1.25rem' }}>Edit Income</h3>
                <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <CustomSelect 
                    value={incCategory} 
                    onChange={(e) => setIncCategory(e.target.value)}
                    options={categories}
                    searchable={true}
                    placeholder="Select Category"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" step="0.01" className="form-input" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date Received</label>
                  <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" value={notes} onChange={(e) => setNotes(e.target.value)} rows="2"></textarea>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Incomes;
