import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  Wallet, 
  PieChart, 
  Shield, 
  Target, 
  FileText, 
  MessageSquare, 
  Play, 
  Mic, 
  Brain, 
  Activity, 
  Lock, 
  ChevronRight,
  DollarSign,
  ArrowDown
} from 'lucide-react';

function LandingPage({ onLoginClick, onRegisterClick }) {
  // Feature set requested (10 total)
  const features = [
    {
      title: 'AI Chat Assistant',
      desc: 'Ask questions, calculate balances, and analyze spending trends using our highly interactive chatbot companion.',
      icon: MessageSquare,
      color: '#8B5CF6', // Purple
      glowClass: 'glow-purple'
    },
    {
      title: 'Receipt OCR',
      desc: 'Upload or scan physical receipts to automatically parse, itemize, and log transaction details instantly.',
      icon: FileText,
      color: '#3B82F6', // Blue
      glowClass: 'glow-blue'
    },
    {
      title: 'Voice Expense Entry',
      desc: 'Log expenses hands-free. Speak naturally, and the AI parses amounts, categories, and merchants automatically.',
      icon: Mic,
      color: '#EC4899', // Pink
      glowClass: 'glow-pink'
    },
    {
      title: 'Expense Prediction',
      desc: 'Machine learning algorithms analyze your historical records to forecast next month\'s spending behavior.',
      icon: Brain,
      color: '#06B6D4', // Cyan
      glowClass: 'glow-cyan'
    },
    {
      title: 'Smart Reports',
      desc: 'Generate interactive financial summaries. Export clean CSV and Excel sheets with a single click.',
      icon: FileText,
      color: '#10B981', // Success Green
      glowClass: 'glow-blue'
    },
    {
      title: 'Budget Planner',
      desc: 'Set custom thresholds for spending categories and receive warning alerts before overspending happens.',
      icon: Target,
      color: '#F59E0B', // Warning Yellow
      glowClass: 'glow-purple'
    },
    {
      title: 'Savings Goals',
      desc: 'Create visual milestones for major purchases. Map progress, configure auto-saves, and stay motivated.',
      icon: Shield,
      color: '#3B82F6', // Blue
      glowClass: 'glow-blue'
    },
    {
      title: 'Fraud Detection',
      desc: 'AI-driven security scans transactions to detect suspicious charges, anomalies, or duplicate subscriptions.',
      icon: Lock,
      color: '#EF4444', // Danger Red
      glowClass: 'glow-pink'
    },
    {
      title: 'Financial Health Score',
      desc: 'Get a real-time health grading based on savings rates, budget adherence, and expense-to-income ratio.',
      icon: Activity,
      color: '#10B981', // Green
      glowClass: 'glow-cyan'
    },
    {
      title: 'Interactive Charts',
      desc: 'Explore trends with rich visualizations. Breakdown costs by categories, merchants, and periods.',
      icon: PieChart,
      color: '#8B5CF6', // Purple
      glowClass: 'glow-purple'
    }
  ];

  // Statistics section metrics
  const stats = [
    { value: '10K+', label: 'Active Users', gradient: 'from-blue-500 to-cyan-500' },
    { value: '50K+', label: 'Transactions Processed', gradient: 'from-purple-500 to-pink-500' },
    { value: '99%', label: 'AI Accuracy Rate', gradient: 'from-cyan-500 to-purple-500' },
    { value: '24/7', label: 'AI Assistant Support', gradient: 'from-pink-500 to-blue-500' }
  ];

  // Smooth scroll helper
  const scrollToFeatures = () => {
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', zIndex: 10, width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Sticky Blurred Glass Navigation Bar */}
      <nav className="landing-navbar">
        <div className="landing-nav-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="logo-mark" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', width: '32px', height: '32px', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#ffffff' }}>
              <Sparkles size={16} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: '850', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              FinancePro AI
            </span>
          </div>

          {/* Links for recruiters */}
          <div className="landing-nav-links">
            <span onClick={scrollToFeatures} className="landing-nav-link">Features</span>
            <span onClick={onLoginClick} className="landing-nav-link">AI Tools</span>
            <span onClick={onLoginClick} className="landing-nav-link">Pricing</span>
            <span onClick={onLoginClick} className="landing-nav-link">About</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={onLoginClick} className="landing-nav-btn login">
              Login
            </button>
            <button onClick={onRegisterClick} className="landing-nav-btn signup">
              Get Started <ArrowRight size={14} style={{ marginLeft: '4px', display: 'inline' }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        
        {/* Hero Section */}
        <section style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '5rem 2rem 6rem 2rem',
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '4rem',
          alignItems: 'center'
        }} className="hero-grid">
          
          {/* Left Hero Details */}
          <motion.div 
            initial={{ opacity: 0, x: -35 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
          >
            {/* Interactive Section Kicker Badge */}
            <div style={{
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 1rem',
              borderRadius: '99px',
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#8B5CF6',
              letterSpacing: '0.03em',
              textTransform: 'uppercase'
            }}>
              <Sparkles size={12} /> FinancePro AI
            </div>

            {/* Main Headline */}
            <h1 className="landing-gradient-text" style={{
              fontSize: 'clamp(2.5rem, 4.5vw, 3.8rem)',
              lineHeight: '1.08',
              fontWeight: '900',
              letterSpacing: '-0.04em',
            }}>
              Take Control of Your <br />
              <span className="landing-accent-gradient" style={{ fontWeight: '900' }}>Financial Future</span> with AI
            </h1>

            {/* Sub-headline Description */}
            <p style={{
              fontSize: '1.1rem',
              color: '#CBD5E1',
              lineHeight: '1.65',
              maxWidth: '540px'
            }}>
              Track expenses, manage budgets, scan receipts, predict spending, receive AI-powered financial insights, and achieve your savings goals with one intelligent platform.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button 
                onClick={onRegisterClick} 
                className="landing-nav-btn signup" 
                style={{ 
                  padding: '0.9rem 2rem', 
                  fontSize: '1rem', 
                  boxShadow: '0 0 25px rgba(139, 92, 246, 0.45)',
                }}
              >
                Get Started
              </button>
              <button 
                onClick={onLoginClick} 
                className="landing-nav-btn login" 
                style={{ padding: '0.9rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Play size={16} fill="white" style={{ color: 'white' }} /> Watch Demo
              </button>
            </div>

            {/* Animated Scroll Down Indicator */}
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              onClick={scrollToFeatures}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#94A3B8',
                fontSize: '0.85rem',
                cursor: 'pointer',
                marginTop: '2rem',
                alignSelf: 'flex-start'
              }}
            >
              <ArrowDown size={14} /> Scroll to explore features
            </motion.div>
          </motion.div>

          {/* Right Hero Dashboard Preview Mock */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.93 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
            style={{ position: 'relative', width: '100%', height: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* Ambient Backlight Glow */}
            <div style={{
              position: 'absolute',
              width: '380px',
              height: '380px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 70%)',
              filter: 'blur(50px)',
              zIndex: 0
            }} />

            {/* Main Application Container Preview */}
            <div className="landing-dashboard-mock" style={{ zIndex: 1, width: '100%', maxWidth: '460px', height: '360px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Mock Windows Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600', letterSpacing: '0.02em' }}>Personal Finance Manager</div>
                <Sparkles size={14} style={{ color: '#8B5CF6' }} />
              </div>

              {/* Chart Mockup */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Available Balance</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', marginTop: '2px' }}>₹4,52,400</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '700', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                    +14.2% MoM
                  </span>
                </div>

                <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.015)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.04)', position: 'relative', overflow: 'hidden', minHeight: '120px' }}>
                  {/* SVG Area graph representation */}
                  <svg width="100%" height="100%" viewBox="0 0 100 45" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="glowArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,45 L0,28 Q15,22 30,30 T60,18 T90,8 L100,6 L100,45 Z" fill="url(#glowArea)" />
                    <path d="M0,28 Q15,22 30,30 T60,18 T90,8 L100,6" fill="none" stroke="#8B5CF6" strokeWidth="2" />
                  </svg>
                  
                  {/* Value markers on graph */}
                  <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6', alignSelf: 'center' }}></span>
                    <span style={{ fontSize: '0.68rem', color: '#ffffff', fontWeight: '700' }}>Live AI Tracker</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlapping Floating AI Insights Card */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: '-4%',
                left: '2%',
                width: '210px',
                padding: '0.9rem 1.1rem',
                borderRadius: '18px',
                background: 'rgba(17, 24, 39, 0.9)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 15px 30px rgba(139, 92, 246, 0.15)',
                backdropFilter: 'blur(20px)',
                zIndex: 3,
                display: 'flex',
                gap: '0.75rem'
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'grid', placeItems: 'center', color: '#8B5CF6', flexShrink: 0 }}>
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>AI Insight</div>
                <div style={{ fontSize: '#ffffff', fontSize: '0.72rem', fontWeight: '600', color: '#CBD5E1', marginTop: '2px', lineHeight: '1.3' }}>
                  Reduced dining out saved you <strong>₹15,400</strong> this week.
                </div>
              </div>
            </motion.div>

            {/* Overlapping Floating Expense Prediction Card */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              style={{
                position: 'absolute',
                bottom: '-2%',
                right: '4%',
                width: '220px',
                padding: '0.9rem 1.1rem',
                borderRadius: '18px',
                background: 'rgba(17, 24, 39, 0.9)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                boxShadow: '0 15px 30px rgba(236, 72, 153, 0.15)',
                backdropFilter: 'blur(20px)',
                zIndex: 3,
                display: 'flex',
                gap: '0.75rem'
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.15)', display: 'grid', placeItems: 'center', color: '#EC4899', flexShrink: 0 }}>
                <Brain size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Expense Forecast</div>
                <div style={{ fontSize: '0.72rem', color: '#CBD5E1', marginTop: '2px', fontWeight: '600', lineHeight: '1.3' }}>
                  Next month spend predicted to decrease by <span style={{ color: '#10B981', fontWeight: '700' }}>8.4%</span>.
                </div>
              </div>
            </motion.div>

            {/* Overlapping Floating Budget Score Card */}
            <motion.div 
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              style={{
                position: 'absolute',
                top: '20%',
                right: '-6%',
                width: '150px',
                padding: '0.8rem 1rem',
                borderRadius: '16px',
                background: 'rgba(17, 24, 39, 0.9)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                boxShadow: '0 12px 25px rgba(6, 182, 212, 0.15)',
                backdropFilter: 'blur(20px)',
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem'
              }}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'grid', placeItems: 'center', color: '#06B6D4', flexShrink: 0 }}>
                <Target size={14} />
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: '700' }}>BUDGET SCORE</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '850', color: '#ffffff' }}>94/100</div>
              </div>
            </motion.div>

            {/* Overlapping Floating Recent Transactions */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              style={{
                position: 'absolute',
                bottom: '15%',
                left: '-10%',
                width: '200px',
                padding: '0.9rem 1.1rem',
                borderRadius: '18px',
                background: 'rgba(17, 24, 39, 0.92)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(25px)',
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem'
              }}
            >
              <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: '800', letterSpacing: '0.02em', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '0.4rem' }}>
                RECENT TRANSACTIONS
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#ffffff' }}>Starbucks</div>
                  <div style={{ fontSize: '0.6rem', color: '#94A3B8' }}>Food</div>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: '750', color: '#EF4444' }}>-₹450</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#ffffff' }}>Netflix subscription</div>
                  <div style={{ fontSize: '0.6rem', color: '#94A3B8' }}>Utilities</div>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: '750', color: '#EF4444' }}>-₹649</span>
              </div>
            </motion.div>

            {/* Overlapping Floating Financial Health Widget */}
            <motion.div 
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: '42%',
                right: '-4%',
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                backdropFilter: 'blur(10px)',
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 10px #10B981' }}></span>
              <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Health: Excellent</span>
            </motion.div>

            {/* Overlapping Floating Receipt Scanner */}
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              style={{
                position: 'absolute',
                top: '55%',
                left: '-8%',
                width: '185px',
                padding: '0.8rem 1rem',
                borderRadius: '16px',
                background: 'rgba(17, 24, 39, 0.9)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 12px 25px rgba(59, 130, 246, 0.15)',
                backdropFilter: 'blur(20px)',
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FileText size={14} style={{ color: '#3B82F6' }} />
                <span style={{ fontSize: '#94A3B8', fontSize: '0.62rem', fontWeight: '800' }}>OCR SCAN COMPLETE</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#CBD5E1', fontWeight: '600', lineHeight: '1.3' }}>
                Walmart bill logged: <strong>+₹2,499</strong> under shopping.
              </div>
            </motion.div>

            {/* Overlapping Floating Voice Expense Card */}
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              style={{
                position: 'absolute',
                bottom: '38%',
                right: '-8%',
                width: '170px',
                padding: '0.8rem 1rem',
                borderRadius: '16px',
                background: 'rgba(17, 24, 39, 0.9)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                boxShadow: '0 12px 25px rgba(6, 182, 212, 0.15)',
                backdropFilter: 'blur(20px)',
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Mic size={14} style={{ color: '#06B6D4' }} />
                <span style={{ fontSize: '#94A3B8', fontSize: '0.62rem', fontWeight: '800' }}>VOICE ENTRY PARSED</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#CBD5E1', fontStyle: 'italic', lineHeight: '1.3' }}>
                "Spent 500 on Uber" &rarr; Transportation
              </div>
            </motion.div>

          </motion.div>
        </section>

        {/* Dynamic Statistics Section */}
        <section style={{
          width: '100%',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(11, 16, 35, 0.4)',
          padding: '4rem 2rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem'
          }} className="stats-grid">
            {stats.map((s, idx) => (
              <motion.div 
                key={s.label}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="landing-stats-card"
              >
                <div style={{ fontSize: '3rem', fontWeight: '900', background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Suite Section */}
        <section id="features-section" style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '8rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '4rem'
        }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '99px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#3B82F6',
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}>
              <Sparkles size={10} /> Feature Suite
            </div>
            <h2 className="landing-gradient-text" style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
              Engineered for Next-Gen Money Management
            </h2>
            <p style={{ color: '#94A3B8', maxWidth: '600px', fontSize: '1rem', lineHeight: '1.5' }}>
              We combined cutting-edge artificial intelligence with premium dashboard analytics to simplify every aspect of your personal ledger.
            </p>
          </div>

          <div className="landing-features-grid">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: Math.min(idx * 0.08, 0.5) }}
                  className={`landing-feature-card ${f.glowClass}`}
                >
                  <div className="landing-feature-icon" style={{
                    background: `rgba(${parseInt(f.color.slice(1,3),16)}, ${parseInt(f.color.slice(3,5),16)}, ${parseInt(f.color.slice(5,7),16)}, 0.12)`,
                    color: f.color,
                    border: `1px solid ${f.color}25`
                  }}>
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>{f.title}</h3>
                  <p style={{ color: '#CBD5E1', fontSize: '0.9rem', lineHeight: '1.6' }}>{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Premium Bottom CTA Section */}
        <section style={{
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto 8rem auto',
          padding: '0 2rem',
        }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(11, 16, 35, 0.9) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              boxShadow: '0 20px 50px rgba(139, 92, 246, 0.1)',
              borderRadius: '32px',
              padding: '4.5rem 3rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* CTA Background Blurs */}
            <div style={{ position: 'absolute', width: '250px', height: '250px', background: 'rgba(139, 92, 246, 0.15)', filter: 'blur(60px)', top: '-50px', left: '-50px', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: '250px', height: '250px', background: 'rgba(6, 182, 212, 0.12)', filter: 'blur(60px)', bottom: '-50px', right: '-50px', borderRadius: '50%', pointerEvents: 'none' }} />

            <h2 className="landing-gradient-text" style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.02em', zIndex: 1 }}>
              Ready to Upgrade Your Money Game?
            </h2>
            <p style={{ color: '#CBD5E1', maxWidth: '580px', fontSize: '1.05rem', lineHeight: '1.6', zIndex: 1 }}>
              Join thousands of smart planners who use FinancePro AI to analyze spending trends, scan receipts automatically, and secure their financial savings.
            </p>
            <div style={{ zIndex: 1, marginTop: '0.5rem' }}>
              <button 
                onClick={onRegisterClick} 
                className="landing-nav-btn signup" 
                style={{ padding: '1rem 2.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Create Free Account <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        </section>

      </main>

      {/* Professional Footer */}
      <footer style={{
        width: '100%',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        background: '#040713',
        padding: '5rem 2rem 3rem 2rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.5fr repeat(3, 1fr)',
          gap: '3rem',
          marginBottom: '4rem',
          textAlign: 'left'
        }} className="footer-grid">
          
          {/* Column 1 - Brand info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', width: '28px', height: '28px', borderRadius: '8px', display: 'grid', placeItems: 'center', color: '#ffffff' }}>
                <Sparkles size={14} />
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: '850', letterSpacing: '-0.02em', color: '#ffffff' }}>
                FinancePro AI
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: '1.6', maxWidth: '260px' }}>
              Next-generation intelligence tools for automating, tracking, and securing your personal ledger.
            </p>
          </div>

          {/* Column 2 - Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Solutions</h4>
            <span onClick={onLoginClick} style={{ fontSize: '0.85rem', color: '#94A3B8', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94A3B8'}>Expense Audit</span>
            <span onClick={onLoginClick} style={{ fontSize: '0.85rem', color: '#94A3B8', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94A3B8'}>AI Insights</span>
            <span onClick={onLoginClick} style={{ fontSize: '0.85rem', color: '#94A3B8', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94A3B8'}>Receipt Scanner</span>
            <span onClick={onLoginClick} style={{ fontSize: '0.85rem', color: '#94A3B8', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94A3B8'}>Integrations</span>
          </div>

          {/* Column 3 - Resources */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</h4>
            <span onClick={onLoginClick} style={{ fontSize: '0.85rem', color: '#94A3B8', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94A3B8'}>About Us</span>
            <span onClick={onLoginClick} style={{ fontSize: '0.85rem', color: '#94A3B8', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94A3B8'}>Careers</span>
            <span onClick={onLoginClick} style={{ fontSize: '0.85rem', color: '#94A3B8', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94A3B8'}>Privacy Policy</span>
            <span onClick={onLoginClick} style={{ fontSize: '0.85rem', color: '#94A3B8', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94A3B8'}>Terms of Service</span>
          </div>

          {/* Column 4 - Social/Contact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Connect</h4>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94A3B8'}>GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94A3B8'}>LinkedIn</a>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>support@financepro.ai</span>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>+1 (555) 019-2834</span>
          </div>

        </div>

        {/* Footer Base copyright info */}
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
            &copy; 2026 FinancePro AI. All rights reserved. Designed to Stripe/Linear levels of visual excellence.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span onClick={onLoginClick} style={{ fontSize: '0.82rem', color: '#94A3B8', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94A3B8'}>Privacy</span>
            <span onClick={onLoginClick} style={{ fontSize: '0.82rem', color: '#94A3B8', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94A3B8'}>Terms</span>
            <span onClick={onLoginClick} style={{ fontSize: '0.82rem', color: '#94A3B8', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94A3B8'}>Security</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
