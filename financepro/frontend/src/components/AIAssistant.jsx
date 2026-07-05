import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Mic,
  Sparkles,
  TrendingUp,
  Target,
  AlertCircle,
  BarChart3
} from 'lucide-react';

function AIAssistant({ user, token }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      message: '👋 Hey! I\'m your FinancePro AI Assistant. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    'How much did I spend today?',
    'Generate monthly report',
    'Find unnecessary expenses',
    'Savings forecast',
    'Budget status',
    'Spending trends'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (msg = input) => {
    if (!msg.trim()) return;

    setMessages(prev => [...prev, { role: 'user', message: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/chatbot/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: msg })
      });
      const result = await res.json();
      if (result.success) {
        setMessages(prev => [...prev, { role: 'assistant', message: result.response }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="ai-floating-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        {isOpen ? <X size={28} color="white" /> : <MessageCircle size={28} color="white" />}
      </motion.button>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-assistant-panel"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="ai-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                <span className="ai-panel-title">FinancePro AI</span>
              </div>
              <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="ai-panel-content">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  className={`ai-message ${msg.role}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {msg.message}
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  className="ai-message assistant"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ delay: i * 0.1, duration: 0.6, repeat: Infinity }}
                        style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="ai-suggestions">
                {suggestions.slice(0, 4).map((suggestion, idx) => (
                  <motion.button
                    key={idx}
                    className="ai-suggestion-btn"
                    onClick={() => handleSendMessage(suggestion)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Footer Input */}
            <div className="ai-panel-footer">
              <div className="ai-input-box">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
              </div>
              <motion.button
                onClick={() => handleSendMessage()}
                disabled={loading || !input.trim()}
                style={{
                  background: input.trim() ? 'var(--primary)' : 'var(--border-glass)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  width: '44px',
                  height: '44px',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                whileHover={input.trim() ? { scale: 1.05 } : {}}
                whileTap={input.trim() ? { scale: 0.95 } : {}}
              >
                <Send size={18} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AIAssistant;
