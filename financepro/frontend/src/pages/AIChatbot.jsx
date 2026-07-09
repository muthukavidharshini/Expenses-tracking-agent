import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  UploadCloud, 
  Loader, 
  Bot, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function AIChatbot({ user, token }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  
  // OCR Scan states
  const [receiptUrl, setReceiptUrl] = useState('');
  const [loadingOcr, setLoadingOcr] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  // Voice states
  const [recording, setRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Insights & Forecasts states
  const [insights, setInsights] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const messagesEndRef = useRef(null);

  // Initializing speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setRecording(false);
      };

      rec.onerror = () => {
        setRecording(false);
      };

      rec.onend = () => {
        setRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  // Fetch initial chat history, insights and forecast
  useEffect(() => {
    fetchChatHistory();
    fetchInsightsAndForecast();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/chatbot/history/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success && result.history.length > 0) {
        setMessages(result.history);
      } else {
        // Welcome message
        setMessages([
          {
            role: 'assistant',
            message: `Hello! 👋 I am your FinancePro AI Assistant. Ask me questions about your monthly spending, configure budgets, predict expenses, or seek savings advice!`
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInsightsAndForecast = async () => {
    setLoadingInsights(true);
    try {
      const insRes = await fetch(`${BACKEND_URL}/api/chatbot/insights/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const insResult = await insRes.json();
      if (insResult.success) {
        setInsights(insResult.insights);
      }

      const foreRes = await fetch(`${BACKEND_URL}/api/chatbot/predictions/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const foreResult = await foreRes.json();
      if (foreResult.success) {
        setForecast(foreResult.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', message: userMsg }]);
    setLoadingChat(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/chatbot/${user.id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: userMsg })
      });
      const result = await res.json();
      if (result.success) {
        setMessages(prev => [...prev, { role: 'assistant', message: result.response }]);
        // Refresh insights/goals/budgets just in case user added transaction
        fetchInsightsAndForecast();
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', message: 'Sorry, I failed to process that request.' }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleVoiceRecord = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (recording) {
      recognition.stop();
      setRecording(false);
    } else {
      setRecording(true);
      recognition.start();
    }
  };

  const handleOcrSubmit = async (e) => {
    e.preventDefault();
    if (!receiptUrl.trim()) return;

    setLoadingOcr(true);
    setOcrResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/chatbot/ocr/${user.id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl: receiptUrl })
      });
      const result = await res.json();
      if (result.success) {
        setOcrResult(result.scanDetails);
        setReceiptUrl('');
        // Add OCR logging message
        setMessages(prev => [...prev, {
          role: 'assistant',
          message: `📄 **Receipt Processed Successfully (OCR Agent)**\n\n🏪 **Merchant:** ${result.scanDetails.merchant}\n💵 **Amount:** ₹${result.scanDetails.amount} *(Tax: ₹${result.scanDetails.tax})*\n🏷️ **Auto-logged Category:** Food\n\n*Transaction registered in database!*`
        }]);
        fetchInsightsAndForecast();
      } else {
        alert(result.error || 'Failed to scan receipt');
      }
    } catch (err) {
      console.error(err);
      alert('Connection to server failed');
    } finally {
      setLoadingOcr(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BrainCircuit style={{ color: 'var(--primary)' }} /> AI Finance Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Talk to agents, predict forecasts, scan receipts, and monitor insights</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}>
        
        {/* Left Column: Chat Assistant panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* AI Chatbot Terminal */}
          <div className="glass-card chat-window" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>AI Assistant Agent</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multi-agent coordinator online</p>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`message-bubble ${msg.role === 'user' ? 'user' : 'bot'}`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {msg.message}
                </div>
              ))}
              {loadingChat && (
                <div className="message-bubble bot" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader className="animate-spin" size={16} /> Thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                onClick={handleVoiceRecord} 
                className={`btn ${recording ? 'btn-danger' : 'btn-secondary'}`}
                style={{ padding: '0.75rem', borderRadius: '12px' }}
                title="Speak your transaction"
              >
                {recording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              
              <input 
                type="text" 
                placeholder={recording ? 'Listening...' : 'Type a command, e.g. "I spent ₹350 on petrol at HP"' }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
                disabled={recording}
                required
              />
              
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.25rem' }} disabled={loadingChat || recording}>
                <Send size={18} />
              </button>
            </form>
          </div>

          {/* Receipt Image OCR Scanner */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UploadCloud size={18} /> Receipt OCR Scanner (Ocr Agent)
            </h3>
            
            <form onSubmit={handleOcrSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="url" 
                placeholder="Paste receipt image URL (e.g. https://example.com/receipt.jpg)..."
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                className="form-input"
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loadingOcr} style={{ whiteSpace: 'nowrap' }}>
                {loadingOcr ? <Loader className="animate-spin" size={16} /> : 'Scan Receipt'}
              </button>
            </form>
            
            {ocrResult && (
              <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-glass)', fontSize: '0.85rem' }}>
                <h4 style={{ fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)' }}>
                  <CheckCircle size={16} /> Extraction Complete
                </h4>
                <p><strong>Merchant:</strong> {ocrResult.merchant}</p>
                <p><strong>Amount:</strong> ₹{ocrResult.amount}</p>
                <p><strong>Tax:</strong> ₹{ocrResult.tax}</p>
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.5rem' }}>
                  <p style={{ fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Items List:</p>
                  {ocrResult.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>{item.name} (x{item.quantity})</span>
                      <span>₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Insights & Forecasts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Spending Insights Panel (Savings Advisor & Fraud Detection) */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles style={{ color: 'var(--warning)' }} /> Spending Insights & Fraud Alerts
            </h3>

            {loadingInsights ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <Loader className="animate-spin" size={24} />
              </div>
            ) : insights.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No recent alerts or suggestions</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {insights.map((ins, idx) => {
                  let alertBg = 'rgba(99, 102, 241, 0.1)';
                  let alertBorder = 'rgba(99, 102, 241, 0.2)';
                  let alertColor = 'var(--text-primary)';

                  if (ins.type === 'warning') {
                    alertBg = 'rgba(245, 158, 11, 0.1)';
                    alertBorder = 'rgba(245, 158, 11, 0.2)';
                    alertColor = 'var(--warning)';
                  } else if (ins.type === 'danger') {
                    alertBg = 'rgba(239, 68, 68, 0.1)';
                    alertBorder = 'rgba(239, 68, 68, 0.2)';
                    alertColor = 'var(--danger)';
                  }

                  return (
                    <div key={idx} style={{ background: alertBg, border: `1px solid ${alertBorder}`, padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <h4 style={{ fontWeight: '700', color: alertColor, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <AlertTriangle size={16} /> {ins.title}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-line', lineHeight: '1.4' }}>{ins.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Expense Predictions & Charts */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp /> Expense Prediction (Forecast Agent)
            </h3>

            {loadingInsights ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <Loader className="animate-spin" size={24} />
              </div>
            ) : !forecast ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No historical forecast available</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projected Spend</span>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--danger)' }}>₹{forecast.predictedSpending.toFixed(0)}</h4>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Budget Risk</span>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: forecast.budgetRisk === 'High Risk' ? 'var(--danger)' : 'var(--success)' }}>
                      {forecast.budgetRisk}
                    </h4>
                  </div>
                </div>

                {/* Prediction comparison AreaChart */}
                <div style={{ height: '180px', width: '100%', marginTop: '0.5rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecast.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-glass)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} />
                      <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-glass)', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="Spending" stroke="var(--primary)" fill="var(--primary-glow)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default AIChatbot;
