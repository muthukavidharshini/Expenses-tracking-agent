import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  FileText,
  MessageSquare,
  LogOut,
  Sun,
  Moon,
  Bell,
  Menu,
  Search,
  Sparkles,
  ArrowRight,
  Settings,
  Plus,
  X,
  CreditCard,
  Check,
  Zap,
  Globe
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Incomes from './pages/Incomes';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import AIChatbot from './pages/AIChatbot';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import AIAssistant from './components/AIAssistant';
import AnimatedBackground from './components/AnimatedBackground';
import CustomSelect from './components/CustomSelect';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [themeMode, setThemeMode] = useState('dark');
  const [systemTheme, setSystemTheme] = useState('dark');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);

  // Quick Add Expense States
  const [quickAmount, setQuickAmount] = useState('');
  const [quickMerchant, setQuickMerchant] = useState('');
  const [quickCategory, setQuickCategory] = useState('Food');
  const [quickDate, setQuickDate] = useState(new Date().toISOString().split('T')[0]);
  const [quickNotes, setQuickNotes] = useState('');
  const [quickPaymentMethod, setQuickPaymentMethod] = useState('Cash');
  const [quickTags, setQuickTags] = useState('');

  const resolvedTheme = themeMode === 'system' ? systemTheme : themeMode;
  const isDarkMode = resolvedTheme === 'dark';

  useEffect(() => {
    const savedUser = localStorage.getItem('finance_user');
    const savedToken = localStorage.getItem('finance_token');
    const savedTheme = localStorage.getItem('finance_theme_mode') || 'dark';
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const updateSystemTheme = () => setSystemTheme(media.matches ? 'dark' : 'light');
    updateSystemTheme();
    media.addEventListener?.('change', updateSystemTheme);

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }

    setThemeMode(savedTheme);
    document.body.classList.toggle('dark-theme', savedTheme === 'dark' || (savedTheme === 'system' && media.matches));

    return () => media.removeEventListener?.('change', updateSystemTheme);
  }, []);

  useEffect(() => {
    const effectiveTheme = themeMode === 'system' ? systemTheme : themeMode;
    document.body.classList.toggle('dark-theme', effectiveTheme === 'dark');
    localStorage.setItem('finance_theme_mode', themeMode);
  }, [themeMode, systemTheme]);

  useEffect(() => {
    if (user && token) {
      fetchNotifications();
    }
  }, [user, token, activePage]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/notification/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/notification/read-all/${user.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await res.json();
      if (result.success) {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Mark all read notifications error:', err);
    }
  };

  const handleLogin = (userData, userToken) => {
    localStorage.setItem('finance_user', JSON.stringify(userData));
    localStorage.setItem('finance_token', userToken);
    setUser(userData);
    setToken(userToken);
    setShowAuthModal(false);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('finance_user');
    localStorage.removeItem('finance_token');
    setUser(null);
    setToken(null);
    setSidebarOpen(false);
  };

  const toggleTheme = () => {
    const nextTheme = themeMode === 'dark' ? 'light' : themeMode === 'light' ? 'system' : 'dark';
    setThemeMode(nextTheme);
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    const query = globalSearch.trim().toLowerCase();
    if (!query) return;

    if (query.includes('report') || query.includes('analytics') || query.includes('export')) {
      setActivePage('reports');
    } else if (query.includes('budget') || query.includes('limit')) {
      setActivePage('budgets');
    } else if (query.includes('goal') || query.includes('save') || query.includes('target')) {
      setActivePage('goals');
    } else if (query.includes('assistant') || query.includes('chat') || query.includes('ask')) {
      setActivePage('chatbot');
    } else if (query.includes('income') || query.includes('salary') || query.includes('revenue')) {
      setActivePage('incomes');
    } else if (query.includes('settings') || query.includes('theme') || query.includes('profile')) {
      setActivePage('settings');
    } else {
      setActivePage('expenses');
    }

    setSidebarOpen(false);
  };

  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = quickTags.split(',').map((t) => t.trim()).filter((t) => t !== '');
      const res = await fetch('http://localhost:5000/api/expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          category: quickCategory,
          amount: quickAmount,
          date: quickDate,
          notes: quickNotes,
          merchant: quickMerchant,
          paymentMethod: quickPaymentMethod,
          tags: tagsArray
        })
      });
      const result = await res.json();
      if (result.success) {
        setShowQuickAddModal(false);
        // Reset states
        setQuickAmount('');
        setQuickMerchant('');
        setQuickCategory('Food');
        setQuickDate(new Date().toISOString().split('T')[0]);
        setQuickNotes('');
        setQuickPaymentMethod('Cash');
        setQuickTags('');
        
        // Refresh active views
        if (activePage === 'dashboard' || activePage === 'expenses') {
          window.location.reload();
        }
      } else {
        alert(result.error || 'Failed to add transaction');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'incomes', label: 'Income', icon: TrendingUp },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'chatbot', label: 'AI Assistant', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard user={user} token={token} setActivePage={setActivePage} />;
      case 'expenses':
        return <Expenses user={user} token={token} globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />;
      case 'incomes':
        return <Incomes user={user} token={token} />;
      case 'budgets':
        return <Budgets user={user} token={token} />;
      case 'goals':
        return <Goals user={user} token={token} />;
      case 'reports':
        return <Reports user={user} token={token} />;
      case 'chatbot':
        return <AIChatbot user={user} token={token} />;
      case 'settings':
        return (
          <div className="page-shell">
            <div className="page-hero">
              <div>
                <div className="section-kicker"><Sparkles size={13} /> Preferences</div>
                <h1 className="hero-title">System Settings</h1>
                <p className="hero-copy">Configure your dark dashboard preferences, profiles, and localized variables.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Settings size={18} /> Profile Details</h3>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={user.name} disabled style={{ opacity: 0.7 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={user.email} disabled style={{ opacity: 0.7 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Plan</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: '700', fontSize: '0.9rem' }}>
                    <Zap size={16} /> Premium AI OS Active
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Globe size={18} /> Localization & Theme</h3>
                <div className="form-group">
                  <label className="form-label">Theme Mode</label>
                  <CustomSelect 
                    value={themeMode} 
                    onChange={(e) => setThemeMode(e.target.value)}
                    options={[
                      { value: 'dark', label: 'Dark Theme (Standard)' },
                      { value: 'light', label: 'Light Theme' },
                      { value: 'system', label: 'Follow System' }
                    ]}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency Symbol</label>
                  <CustomSelect 
                    value="INR"
                    onChange={() => {}}
                    disabled={true}
                    options={[
                      { value: 'INR', label: '₹ (INR)' },
                      { value: 'USD', label: '$ (USD)' },
                      { value: 'EUR', label: '€ (EUR)' }
                    ]}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <input type="text" className="form-input" value="English (US)" disabled style={{ opacity: 0.7 }} />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard user={user} token={token} setActivePage={setActivePage} />;
    }
  };

  // If there's no authenticated user session, show landing page and auth overlay
  if (!user) {
    return (
      <div className="app-shell" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <AnimatedBackground />
        
        <LandingPage 
          onLoginClick={() => { setIsRegistering(false); setShowAuthModal(true); }}
          onRegisterClick={() => { setIsRegistering(true); setShowAuthModal(true); }}
        />

        <AnimatePresence>
          {showAuthModal && (
            <div className="modal-overlay" style={{ zIndex: 200 }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card modal-content"
                style={{ position: 'relative', width: '100%', maxWidth: '440px', padding: '2rem 1.75rem' }}
              >
                <button 
                  onClick={() => setShowAuthModal(false)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
                {isRegistering ? (
                  <Register onRegister={() => setIsRegistering(false)} onSwitch={() => setIsRegistering(false)} />
                ) : (
                  <Login onLogin={handleLogin} onSwitch={() => setIsRegistering(true)} />
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="app-shell">
      <AnimatedBackground />

      <div className="app-container">
        {/* Vercel-like Premium Left Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">
            <div className="logo-mark">
              <Sparkles size={18} />
            </div>
            <span>FinancePro AI</span>
          </div>

          <ul className="nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <button
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActivePage(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon size={18} />
                    {item.label}
                    {item.id === 'chatbot' && (
                      <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', fontSize: '0.62rem', padding: '0.15rem 0.4rem', borderRadius: '99px', color: 'var(--text-secondary)' }}>
                        Live
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Vercel styled Upgrade card inside sidebar */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
            border: '1px solid rgba(124, 58, 237, 0.25)',
            borderRadius: '16px',
            padding: '1rem',
            marginBottom: '1rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <h5 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.25rem', color: 'white' }}>Unlock Pro Analytics</h5>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Access unlimited budgets, automated OCR scans, and monthly forecasting.</p>
            <button className="btn btn-primary" style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem' }}>
              Upgrade to Premium
            </button>
          </div>

          <div className="sidebar-footer">
            <div className="profile-card">
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary-gradient)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: '800', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(124,58,237,0.3)' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={toggleTheme} className="btn btn-secondary" style={{ flex: 1, padding: '0.55rem' }} title="Toggle Theme">
                {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ flex: 1, padding: '0.55rem', color: 'var(--danger)' }} title="Sign Out">
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </aside>

        {/* Right workspace content */}
        <main className="main-content">
          <header className="topbar">
            <button className="mobile-toggle" onClick={() => setSidebarOpen((open) => !open)}>
              <Menu size={18} />
            </button>

            <form className="search-shell" onSubmit={handleGlobalSearch}>
              <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '0.65rem' }} />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search resources or ask AI assistant…"
              />
              <button type="submit" style={{ display: 'none' }} />
            </form>

            <div className="topbar-actions">
              {/* Month Selector display indicator */}
              <span className="summary-pill" style={{ fontSize: '0.78rem', fontWeight: '600' }}>
                {currentMonthName}
              </span>

              {/* Quick Add Expense Trigger Button */}
              <button 
                onClick={() => setShowQuickAddModal(true)} 
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '99px' }}
              >
                <Plus size={16} /> <span className="hide-mobile">Add Transaction</span>
              </button>

              {/* AI assistant Chat shortcut */}
              <button 
                onClick={() => setActivePage('chatbot')}
                className="btn btn-secondary" 
                style={{ padding: '0.55rem', borderRadius: '50%', border: activePage === 'chatbot' ? '1px solid var(--primary)' : '1px solid var(--border-glass)' }}
                title="AI Assistant Chat"
              >
                <Sparkles size={16} style={{ color: activePage === 'chatbot' ? 'var(--accent)' : 'inherit' }} />
              </button>

              {/* Notification bell */}
              <button
                className="btn btn-secondary"
                style={{ padding: '0.55rem', position: 'relative', borderRadius: '50%' }}
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) fetchNotifications();
                }}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.6rem', display: 'grid', placeItems: 'center', fontWeight: '800' }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </header>

          {/* Interactive Slide-out Notification Drawer */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="glass-card" 
                style={{ 
                  position: 'absolute', 
                  top: '72px', 
                  right: '2.5rem', 
                  width: '320px', 
                  maxHeight: '380px', 
                  overflowY: 'auto', 
                  zIndex: 130, 
                  padding: '1.25rem',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.7)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notifications</h4>
                  <button onClick={handleMarkAllRead} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '700' }}>
                    Mark all read
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>No new notifications.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id} style={{ marginBottom: '0.65rem', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border-glass)', background: n.read ? 'transparent' : 'rgba(124, 58, 237, 0.06)' }}>
                      <h5 style={{ fontWeight: '700', fontSize: '0.8rem', marginBottom: '0.15rem' }}>{n.title}</h5>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-paragraph)', marginBottom: '0.25rem' }}>{n.message}</p>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Router Page Wrapped in Frame Motion */}
          <div style={{ flex: 1, position: 'relative', zIndex: 10 }}>
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Global Quick Add Expense Modal Overlay */}
      <AnimatePresence>
        {showQuickAddModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card modal-content"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: '800', fontSize: '1.2rem' }}>Quick Add Expense</h3>
                <button onClick={() => setShowQuickAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleQuickAddSubmit}>
                <div className="form-group">
                  <label className="form-label">Merchant / Vendor</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={quickMerchant} 
                    onChange={(e) => setQuickMerchant(e.target.value)} 
                    placeholder="Amazon, Starbucks, Rent..." 
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Amount (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-input" 
                      value={quickAmount} 
                      onChange={(e) => setQuickAmount(e.target.value)} 
                      placeholder="500" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <CustomSelect 
                      value={quickCategory} 
                      onChange={(e) => setQuickCategory(e.target.value)}
                      options={['Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Rent', 'Education', 'Other']}
                      searchable={true}
                      placeholder="Select Category"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={quickDate} onChange={(e) => setQuickDate(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <CustomSelect 
                      value={quickPaymentMethod} 
                      onChange={(e) => setQuickPaymentMethod(e.target.value)}
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
                    <input type="text" className="form-input" value={quickTags} onChange={(e) => setQuickTags(e.target.value)} placeholder="office, coffee, food" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" value={quickNotes} onChange={(e) => setQuickNotes(e.target.value)} rows="2" placeholder="Write expense details..." />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowQuickAddModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Transaction</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating AI assistant chat drawer component (don't show when chatbot is active) */}
      {user && activePage !== 'chatbot' && <AIAssistant user={user} token={token} />}
    </div>
  );
}

export default App;
