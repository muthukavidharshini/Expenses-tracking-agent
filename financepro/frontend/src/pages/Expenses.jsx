import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Edit2, Copy, Eye, Loader, ArrowLeft, ArrowRight, Sparkles, Receipt, Mic, DollarSign, X } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

function Expenses({ user, token, globalSearch = '', setGlobalSearch }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState(globalSearch || '');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  
  // Input fields
  const [amount, setAmount] = useState('');
  const [expCategory, setExpCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [tags, setTags] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  const categories = ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Rent', 'Education', 'Other'];
  const quickAmounts = [100, 250, 500, 1000];

  useEffect(() => {
    if (globalSearch) {
      setSearch(globalSearch);
      setPage(1);
    }
  }, [globalSearch]);

  useEffect(() => {
    fetchExpenses();
  }, [month, year, search, category, sortBy, sortOrder, page]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/expense/${user.id}?month=${month}&year=${year}&search=${search}&category=${category}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setExpenses(result.data.expenseTransactions);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        setError(result.error || 'Failed to fetch expenses');
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
      const tagsArray = tags.split(',').map((t) => t.trim()).filter((t) => t !== '');
      const res = await fetch('http://localhost:5000/api/expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: user.id, category: expCategory, amount, date, notes, merchant, paymentMethod, tags: tagsArray, receiptUrl })
      });
      const result = await res.json();
      if (result.success) {
        setShowAddModal(false);
        resetForm();
        fetchExpenses();
      } else {
        alert(result.error || 'Failed to add expense');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = tags.split(',').map((t) => t.trim()).filter((t) => t !== '');
      const res = await fetch(`http://localhost:5000/api/expense/${currentExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: user.id, category: expCategory, amount, date, notes, merchant, paymentMethod, tags: tagsArray, receiptUrl })
      });
      const result = await res.json();
      if (result.success) {
        setShowEditModal(false);
        resetForm();
        fetchExpenses();
      } else {
        alert(result.error || 'Failed to update expense');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/expense/${id}?user_id=${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        fetchExpenses();
      } else {
        alert(result.error || 'Failed to delete expense');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/expense/duplicate/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        fetchExpenses();
      } else {
        alert(result.error || 'Failed to duplicate expense');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const openEditModal = (exp) => {
    setCurrentExpense(exp);
    setAmount(exp.amount);
    setExpCategory(exp.category);
    setDate(new Date(exp.date).toISOString().split('T')[0]);
    setNotes(exp.notes || '');
    setMerchant(exp.merchant || '');
    setPaymentMethod(exp.paymentMethod || 'Cash');
    setTags(exp.tags ? exp.tags.join(', ') : '');
    setReceiptUrl(exp.receiptUrl || '');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setAmount('');
    setExpCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setMerchant('');
    setPaymentMethod('Cash');
    setTags('');
    setReceiptUrl('');
  };

  return (
    <div className="page-shell">
      <div className="page-hero">
        <div>
          <div className="section-kicker"><Sparkles size={12} /> Expense flow</div>
          <h1 className="hero-title">Expenses Tracking</h1>
          <p className="hero-copy">Monitor and filter your daily debits, upload receipts, and manage transactions.</p>
        </div>
        <button onClick={() => { resetForm(); setShowAddModal(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Filter and sorting headers */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Text */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search vendor, merchant tags..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setGlobalSearch?.(e.target.value);
                setPage(1);
              }}
              className="form-input"
              style={{ paddingLeft: '2.6rem' }}
            />
          </div>

          {/* Category Dropdown */}
          <CustomSelect 
            value={category} 
            onChange={(e) => { setCategory(e.target.value); setPage(1); }} 
            options={[
              { value: "", label: "All Categories" },
              ...categories.map(cat => ({ value: cat, label: cat }))
            ]}
            placeholder="All Categories"
            style={{ width: '150px' }}
          />

          {/* Month Dropdown */}
          <CustomSelect 
            value={month} 
            onChange={(e) => { setMonth(parseInt(e.target.value)); setPage(1); }} 
            options={Array.from({ length: 12 }, (_, i) => ({
              value: i + 1,
              label: new Date(2026, i, 1).toLocaleString('default', { month: 'long' })
            }))}
            style={{ width: '135px' }}
          />

          {/* Year Dropdown */}
          <CustomSelect 
            value={year} 
            onChange={(e) => { setYear(parseInt(e.target.value)); setPage(1); }} 
            options={[2024, 2025, 2026, 2027].map(yr => ({ value: yr, label: yr.toString() }))}
            style={{ width: '92px' }}
          />

          {/* Sort field */}
          <CustomSelect 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            options={[
              { value: 'date', label: 'Sort: Date' },
              { value: 'amount', label: 'Sort: Amount' }
            ]}
            style={{ width: '120px' }}
          />

          {/* Order field */}
          <CustomSelect 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)} 
            options={[
              { value: 'desc', label: 'Newest' },
              { value: 'asc', label: 'Oldest' }
            ]}
            style={{ width: '110px' }}
          />
        </div>
      </div>

      {/* Main transactions container */}
      <div className="glass-card" style={{ padding: '0.85rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
          </div>
        ) : error ? (
          <div className="empty-state" style={{ color: 'var(--danger)' }}>{error}</div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">No transaction records found matching your filters.</div>
        ) : (
          <div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Merchant</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th>Receipt</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td style={{ fontWeight: '700', color: 'white' }}>{exp.merchant || 'Store'}</td>
                      <td>
                        <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--accent)', border: '1px solid rgba(124,58,237,0.15)' }}>
                          {exp.category}
                        </span>
                      </td>
                      <td style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--danger)' }}>-₹{exp.amount.toLocaleString('en-IN')}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{new Date(exp.date).toLocaleDateString()}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{exp.paymentMethod}</td>
                      <td>
                        {exp.receiptUrl ? (
                          <a 
                            href={exp.receiptUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn btn-secondary" 
                            style={{ padding: '0.35rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', display: 'inline-flex', gap: '0.2rem', alignItems: 'center' }}
                          >
                            <Eye size={12} /> View
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => openEditModal(exp)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '8px' }} title="Edit">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDuplicate(exp.id)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '8px' }} title="Duplicate">
                            <Copy size={13} />
                          </button>
                          <button onClick={() => handleDelete(exp.id)} className="btn btn-danger" style={{ padding: '0.4rem', borderRadius: '8px' }} title="Delete">
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
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary" style={{ padding: '0.45rem 0.8rem' }}>
                  <ArrowLeft size={16} />
                </button>
                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-secondary" style={{ padding: '0.45rem 0.8rem' }}>
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
                <h3 style={{ fontWeight: '800', fontSize: '1.25rem' }}>Add Expense</h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              
              <form onSubmit={handleAddSubmit}>
                <div className="form-group">
                  <label className="form-label">Merchant / Vendor</label>
                  <input type="text" className="form-input" value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Domino's, Amazon, Electricity..." required />
                </div>
                
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Quick Amount</label>
                  <div className="chip-row">
                    {quickAmounts.map((val) => (
                      <button key={val} type="button" className="floating-chip" onClick={() => setAmount(String(val))}>+ ₹{val}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Amount (₹)</label>
                    <input type="number" step="0.01" className="form-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <CustomSelect 
                      value={expCategory} 
                      onChange={(e) => setExpCategory(e.target.value)}
                      options={categories}
                      searchable={true}
                      placeholder="Select Category"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction Date</label>
                  <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <CustomSelect 
                      value={paymentMethod} 
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      options={[
                        { value: 'Cash', label: 'Cash' },
                        { value: 'Credit Card', label: 'Credit Card' },
                        { value: 'Debit Card', label: 'Debit Card' },
                        { value: 'UPI', label: 'UPI' }
                      ]}
                      placeholder="Select Payment Method"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (comma separated)</label>
                    <input type="text" className="form-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="travel, work, private" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Receipt Image URL</label>
                  <input type="url" className="form-input" value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)} placeholder="https://example.com/receipt.jpg" />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" value={notes} onChange={(e) => setNotes(e.target.value)} rows="2" placeholder="Write additional context..." />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Expense</button>
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
                <h3 style={{ fontWeight: '800', fontSize: '1.25rem' }}>Edit Expense</h3>
                <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label className="form-label">Merchant / Vendor</label>
                  <input type="text" className="form-input" value={merchant} onChange={(e) => setMerchant(e.target.value)} required />
                </div>
                
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Quick Amount</label>
                  <div className="chip-row">
                    {quickAmounts.map((val) => (
                      <button key={val} type="button" className="floating-chip" onClick={() => setAmount(String(val))}>+ ₹{val}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Amount (₹)</label>
                    <input type="number" step="0.01" className="form-input" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <CustomSelect 
                      value={expCategory} 
                      onChange={(e) => setExpCategory(e.target.value)}
                      options={categories.map(c => ({ value: c, label: c }))}
                      searchable={true}
                      placeholder="Select Category"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction Date</label>
                  <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <CustomSelect 
                      value={paymentMethod} 
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      options={[
                        { value: 'Cash', label: 'Cash' },
                        { value: 'Credit Card', label: 'Credit Card' },
                        { value: 'Debit Card', label: 'Debit Card' },
                        { value: 'UPI', label: 'UPI' }
                      ]}
                      placeholder="Select Payment Method"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (comma separated)</label>
                    <input type="text" className="form-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="travel, work, private" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Receipt Image URL</label>
                  <input type="url" className="form-input" value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)} placeholder="https://example.com/receipt.jpg" />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" value={notes} onChange={(e) => setNotes(e.target.value)} rows="2" />
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

export default Expenses;
