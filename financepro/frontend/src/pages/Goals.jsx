import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Target, Calendar, Loader, Award } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Goals({ user, token }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [desiredDate, setDesiredDate] = useState('');
  const [category, setCategory] = useState('Vacation');

  const categories = ["Vacation", "Bike", "Laptop", "Emergency Fund", "House", "Other"];

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/goal/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setGoals(result.data);
      } else {
        setError(result.error || 'Failed to fetch goals');
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
      const res = await fetch(`${BACKEND_URL}/api/goal`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          name,
          targetAmount,
          currentAmount: currentAmount || 0,
          desiredDate,
          category
        })
      });
      const result = await res.json();
      if (result.success) {
        setShowAddModal(false);
        resetForm();
        fetchGoals();
      } else {
        alert(result.error || 'Failed to create goal');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/goal/${currentGoal._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          currentAmount
        })
      });
      const result = await res.json();
      if (result.success) {
        setShowProgressModal(false);
        setCurrentAmount('');
        fetchGoals();
      } else {
        alert(result.error || 'Failed to update progress');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/goal/${id}?user_id=${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        fetchGoals();
      } else {
        alert(result.error || 'Failed to delete goal');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const openProgressModal = (goal) => {
    setCurrentGoal(goal);
    setCurrentAmount(goal.currentAmount);
    setShowProgressModal(true);
  };

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDesiredDate('');
    setCategory('Vacation');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Savings Goals</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log targets, allocate savings, and track milestones</p>
        </div>
        <button onClick={() => { resetForm(); setShowAddModal(true); }} className="btn btn-primary">
          <Plus size={18} />
          Create Goal
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
        </div>
      ) : error ? (
        <p style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</p>
      ) : goals.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Target size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No Savings Goals Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Set targets for items like a new laptop, emergency reserves, or travel.</p>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">Create Your First Goal</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {goals.map(goal => {
            const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            return (
              <div key={goal._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', border: isCompleted ? '1px solid var(--success)' : '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-income" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                      {goal.category}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{goal.name}</h3>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button onClick={() => openProgressModal(goal)} className="btn btn-secondary" style={{ padding: '0.35rem', borderRadius: '8px' }}>
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => handleDelete(goal._id)} className="btn btn-danger" style={{ padding: '0.35rem', borderRadius: '8px' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: '600' }}>₹{goal.currentAmount.toLocaleString('en-IN')} saved</span>
                    <span style={{ color: 'var(--text-muted)' }}>Target: ₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="progress-container" style={{ height: '10px' }}>
                    <div className="progress-bar success" style={{ width: `${percent}%` }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    <span style={{ fontWeight: '700', color: isCompleted ? 'var(--success)' : 'var(--primary)' }}>
                      {isCompleted ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Award size={14} /> Milestoned!</span>
                      ) : `${percent.toFixed(0)}% reached`}
                    </span>
                    {goal.desiredDate && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                        <Calendar size={12} /> {new Date(goal.desiredDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '800' }}>Create Goal</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">Goal Name</label>
                <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Macbook Pro, Emergency Fund" required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <CustomSelect 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  options={categories}
                  searchable={true}
                  placeholder="Select Category"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Target Amount (₹)</label>
                  <input type="number" className="form-input" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Savings (₹)</label>
                  <input type="number" className="form-input" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Target Date</label>
                <input type="date" className="form-input" value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress update Modal */}
      {showProgressModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '800' }}>Allocate Savings</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Update accumulated savings towards goal: **{currentGoal ? currentGoal.name : ''}**
            </p>
            <form onSubmit={handleProgressSubmit}>
              <div className="form-group">
                <label className="form-label">Current Savings Amount (₹)</label>
                <input type="number" className="form-input" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowProgressModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Update Savings</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Goals;
