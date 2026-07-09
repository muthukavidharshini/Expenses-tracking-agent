import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Heart,
  Loader,
  Sparkles,
  CalendarRange,
  Target as TargetIcon,
  Zap,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import AIInsights from '../components/AIInsights';
import SmartWidgets from '../components/SmartWidgets';

function Dashboard({ user, token, setActivePage }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchDashboardData();
  }, [month, year]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/dashboard/${user.id}?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to server failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell" style={{ minHeight: '70vh', justifyContent: 'center', alignItems: 'center' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 4rem', textAlign: 'center' }}>
          <Loader className="animate-spin" size={36} style={{ color: 'var(--primary)' }} />
          <h4 style={{ fontWeight: '600' }}>Analyzing financial pipelines...</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Synthesizing active income and expense transactions.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--danger)', maxWidth: '500px', margin: '2rem auto' }}>
        <h3 style={{ marginBottom: '0.75rem', fontWeight: '800' }}>Connection Interrupted</h3>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-paragraph)' }}>{error}</p>
        <button onClick={fetchDashboardData} className="btn btn-primary">
          Reconnect Server
        </button>
      </div>
    );
  }

  // Color mappings
  const COLORS = ['#8B5CF6', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#10B981', '#EC4899'];
  
  const incomeVsExpenseData = [
    { name: 'Income', Amount: data.totalIncome },
    { name: 'Expenses', Amount: data.totalExpenses }
  ];
  
  const pieData = (data.expensesByCategory || []).map((item) => ({ name: item.category, value: item.total }));
  const categoryChartData = pieData.length > 0 ? pieData : [{ name: 'No Expenses', value: 1 }];
  const balanceDelta = data.totalIncome - data.totalExpenses;
  const currentSavings = Math.max(0, balanceDelta);
  const todaySpend = Math.max(120, Math.round(data.totalExpenses / 30));
 
  const statsList = [
    { 
      title: 'Total balance', 
      value: `₹${data.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      meta: 'All-time net balance', 
      icon: Wallet, 
      accent: '#3B82F6' 
    },
    { 
      title: 'Monthly income', 
      value: `₹${data.totalIncome.toLocaleString('en-IN')}`, 
      meta: data.monthlyGrowth >= 0 ? `+${data.monthlyGrowth}% vs last month` : `${data.monthlyGrowth}% vs last month`, 
      icon: TrendingUp, 
      accent: '#22C55E' 
    },
    { 
      title: 'Monthly expenses', 
      value: `₹${data.totalExpenses.toLocaleString('en-IN')}`, 
      meta: `Est. Today spend ~ ₹${todaySpend.toLocaleString('en-IN')}`, 
      icon: TrendingDown, 
      accent: '#EF4444' 
    },
    { 
      title: 'Financial health', 
      value: `${data.financialHealthScore}%`, 
      meta: 'Savings and budget score', 
      icon: Heart, 
      accent: data.financialHealthScore >= 80 ? '#22C55E' : data.financialHealthScore >= 60 ? '#F59E0B' : '#EF4444' 
    }
  ];

  return (
    <div className="page-shell">
      
      {/* Welcome header kicker */}
      <div className="page-hero">
        <div>
          <div className="section-kicker">
            <Sparkles size={12} /> Live Overview
          </div>
          <h1 className="hero-title">Welcome back, {user.name}</h1>
          <p className="hero-copy">Monitor active pipelines, budgets, and savings analytics for the current cycle.</p>
        </div>
        
        {/* Month Year Select Filters */}
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <CustomSelect 
            value={month} 
            onChange={(e) => setMonth(parseInt(e.target.value))} 
            options={Array.from({ length: 12 }, (_, i) => ({
              value: i + 1,
              label: new Date(2026, i, 1).toLocaleString('default', { month: 'long' })
            }))}
            style={{ width: '135px' }}
          />
          <CustomSelect 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))} 
            options={[2024, 2025, 2026, 2027].map(yr => ({ value: yr, label: yr.toString() }))}
            style={{ width: '90px' }}
          />
        </div>
      </div>

      {/* Main metrics summary counters */}
      <div className="stats-grid">
        {statsList.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div 
              key={card.title} 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, delay: idx * 0.05 }} 
              className="glass-card stat-card"
            >
              <div className="stat-header">
                <span className="stat-title">{card.title}</span>
                <div className="stat-icon" style={{ color: card.accent, background: `${card.accent}15`, borderColor: `${card.accent}25` }}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="stat-value" style={{ 
                background: idx === 0 ? 'var(--primary-gradient)' : 'none',
                WebkitBackgroundClip: idx === 0 ? 'text' : 'none',
                WebkitTextFillColor: idx === 0 ? 'transparent' : 'none',
                color: idx !== 0 ? card.accent : 'inherit'
              }}>
                {card.value}
              </div>
              <div className="stat-meta">{card.meta}</div>
            </motion.div>
          );
        })}
      </div>

      {/* AI Suggestions Box */}
      <AIInsights data={data} />

      {/* Smart Widgets Panel */}
      <SmartWidgets data={data} />

      {/* Recharts Analytics Displays */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Income vs Expenditure Bar Chart */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '750' }}>Income vs Expenditure</h3>
            <span className="summary-pill"><CalendarRange size={13} /> Monthly Balance</span>
          </div>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenseData} barGap={8}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                  contentStyle={{ 
                    background: 'var(--bg-card)', 
                    borderColor: 'var(--border-glass)', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    color: 'white',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8rem'
                  }} 
                />
                <Bar dataKey="Amount" radius={[8, 8, 0, 0]} maxBarSize={55}>
                  <Cell fill="url(#incomeGrad)" />
                  <Cell fill="url(#expenseGrad)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Spending Mix Pie Chart */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '750' }}>Spending Mix Breakdown</h3>
          <div style={{ width: '100%', height: '260px' }}>
            {categoryChartData.length === 0 || (categoryChartData.length === 1 && categoryChartData[0].name === 'No Expenses') ? (
              <div className="empty-state" style={{ padding: '4rem 1rem' }}>No expenses logged for this month.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryChartData} innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                    {categoryChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(3,7,18,0.5)" strokeWidth={1} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--bg-card)', 
                      borderColor: 'var(--border-glass)', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      color: 'white',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.8rem'
                    }} 
                  />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingTop: '0.5rem' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent transactions and Category budgets layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.85fr', gap: '1.5rem', alignItems: 'start' }} className="dashboard-grid">
        
        {/* Recent Transactions list */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '750' }}>Recent Transactions</h3>
            <button onClick={() => setActivePage('expenses')} className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', borderRadius: '99px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Category</th><th>Type</th><th>Amount</th><th>Date</th></tr>
              </thead>
              <tbody>
                {data.recentTransactions.length === 0 ? (
                  <tr><td colSpan="4" className="empty-state">No transactions yet. Click Quick Add to log one!</td></tr>
                ) : data.recentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: '600', color: 'white' }}>{tx.category}</td>
                    <td><span className={`badge badge-${tx.type}`}>{tx.type}</span></td>
                    <td style={{ fontWeight: '800', color: tx.type === 'income' ? 'var(--success)' : 'var(--text-primary)' }}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(tx.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Budgets performance status gauges */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '750' }}>Category Budgets</h3>
            <button onClick={() => setActivePage('budgets')} className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', borderRadius: '99px', fontSize: '0.78rem' }}>
              Plan
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
            {data.budgets.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem 0' }}>Configure a budget category limit to stay on track.</div>
            ) : data.budgets.map((budget) => {
              const percent = Math.min(100, (budget.spent / budget.monthly_limit) * 100);
              const colorClass = percent > 90 ? 'danger' : percent > 75 ? 'warning' : 'success';
              return (
                <div key={budget.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: '600', color: 'white' }}>{budget.category}</span>
                    <span style={{ color: 'var(--text-muted)' }}>₹{budget.spent} / ₹{budget.monthly_limit}</span>
                  </div>
                  <div className="progress-container">
                    <div className={`progress-bar ${colorClass}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
