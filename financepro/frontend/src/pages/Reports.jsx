import React, { useState, useEffect } from 'react';
import { FileText, Download, Loader, HelpCircle } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Reports({ user, token }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  
  // AI report summary state
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const fetchReport = async () => {
    setLoading(true);
    setAiSummary('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/reports/financial-summary/${user.id}?month=${month}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setReportData(result.data);
      } else {
        setError(result.error || 'Failed to fetch report summary');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to server failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format) => {
    const url = `${BACKEND_URL}/api/reports/download/${user.id}?format=${format}`;
    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FinancePro_Report_${month}_${year}.${format === 'excel' ? 'xlsx' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateAiSummary = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/chatbot/${user.id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: `Please analyze my spending habits for this month. Here is my current status: I have earned ₹${reportData.summary.totalIncome} and spent ₹${reportData.summary.totalExpenses}. My savings rate is ${reportData.summary.savingsRate}%. Please give me a detailed report summary and recommendations.` })
      });
      const result = await res.json();
      if (result.success) {
        setAiSummary(result.response);
      } else {
        setAiSummary('Failed to generate AI analysis.');
      }
    } catch (err) {
      console.error(err);
      setAiSummary('Connection to AI agent failed.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Financial Reports</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Export spreadsheets and run AI analytics summaries</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => handleDownload('csv')} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => handleDownload('excel')} className="btn btn-primary" style={{ padding: '0.5rem 0.75rem' }}>
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* Date selectors */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
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
        <p style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</p>
      ) : !reportData ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No report data loaded</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Summary stats */}
          <div className="stats-grid">
            <div className="glass-card stat-card">
              <span className="stat-title">Period Income</span>
              <div className="stat-value" style={{ color: 'var(--success)' }}>₹{reportData.summary.totalIncome.toLocaleString('en-IN')}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{reportData.summary.incomeTransactions} transactions</span>
            </div>
            <div className="glass-card stat-card">
              <span className="stat-title">Period Expenses</span>
              <div className="stat-value" style={{ color: 'var(--danger)' }}>₹{reportData.summary.totalExpenses.toLocaleString('en-IN')}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{reportData.summary.expenseTransactions} transactions</span>
            </div>
            <div className="glass-card stat-card">
              <span className="stat-title">Savings Rate</span>
              <div className="stat-value">{reportData.summary.savingsRate}%</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recommended: &gt;20%</span>
            </div>
            <div className="glass-card stat-card">
              <span className="stat-title">Avg Monthly Income</span>
              <div className="stat-value">₹{reportData.summary.avgMonthlyIncome.toLocaleString('en-IN')}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Baseline baseline average</span>
            </div>
          </div>

          {/* AI summaries generation */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--primary-glow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>AI-Generated Report Analysis</h3>
              {!aiSummary && !loadingAi && (
                <button onClick={generateAiSummary} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px' }}>
                  Analyze Report with AI
                </button>
              )}
            </div>

            {loadingAi ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
                <Loader className="animate-spin" size={16} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI Agent generating financial insights...</span>
              </div>
            ) : aiSummary ? (
              <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-glass)', fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {aiSummary}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click the button above to request our AI agents to perform a complete analysis of your income, expenses, and savings behaviors.</p>
            )}
          </div>

          {/* Grid layout details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}>
            
            {/* Category breakdown table */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Category Breakdown</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Total</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.categoryBreakdown.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>No data logged</td>
                      </tr>
                    ) : (
                      reportData.categoryBreakdown.map((cat, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>{cat.category}</td>
                          <td>
                            <span className={`badge badge-${cat.type}`}>{cat.type}</span>
                          </td>
                          <td style={{ fontWeight: '750', color: cat.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                            ₹{cat.total.toLocaleString('en-IN')}
                          </td>
                          <td>{cat.transaction_count}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daily spending trends */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Daily Spending Patterns</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Average Expense</th>
                      <th>Transactions Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.dailyPattern.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>No data logged</td>
                      </tr>
                    ) : (
                      reportData.dailyPattern.map((day, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>{day.day_name}</td>
                          <td style={{ fontWeight: '750' }}>₹{day.avg_daily_expense.toLocaleString('en-IN')}</td>
                          <td>{day.expense_count}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

export default Reports;
