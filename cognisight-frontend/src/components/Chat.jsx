import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';

export const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadHistory = async () => {
    try {
      const res = await chatAPI.getHistory();
      setMessages(res.data.history || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage(userText);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all chat history?')) return;
    await chatAPI.clearHistory();
    setMessages([]);
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>AI Chat Assistant</h2>
        <button onClick={handleClear} style={styles.clearBtn}>Clear</button>
      </div>

      {/* Chat body */}
      <div style={styles.chatArea}>
        {messages.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>🤖</div>
            <p>Ask anything to get started</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.row,
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                ...styles.bubble,
                ...(m.role === 'user' ? styles.userBubble : styles.botBubble),
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={styles.row}>
            <div style={{ ...styles.bubble, ...styles.botBubble, opacity: 0.7 }}>
              Thinking…
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputBar}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message…"
          style={styles.input}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            ...styles.sendBtn,
            opacity: loading ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

/* ---------------- styles ---------------- */

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(180deg,#071233 0%, #0f172a 100%)',
    borderRadius: '16px',
    overflow: 'hidden',
  },

  header: {
    padding: '14px 18px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.03)',
  },

  title: {
    margin: 0,
    color: '#f8fafc',
    fontSize: '18px',
    fontWeight: '700',
  },

  clearBtn: {
    background: 'transparent',
    border: 'none',
    color: '#f87171',
    cursor: 'pointer',
    fontSize: '14px',
  },

  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },

  empty: {
    margin: 'auto',
    textAlign: 'center',
    color: '#94a3b8',
  },

  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },

  row: {
    display: 'flex',
  },

  bubble: {
    maxWidth: '70%',
    padding: '12px 14px',
    borderRadius: '14px',
    fontSize: '14px',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },

  userBubble: {
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    color: 'white',
    borderBottomRightRadius: '4px',
  },

  botBubble: {
    background: 'rgba(255,255,255,0.08)',
    color: '#e5e7eb',
    borderBottomLeftRadius: '4px',
  },

  inputBar: {
    padding: '14px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    gap: '10px',
    background: 'rgba(255,255,255,0.03)',
  },

  input: {
    flex: 1,
    resize: 'none',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    color: '#f8fafc',
    outline: 'none',
    fontSize: '14px',
  },

  sendBtn: {
    padding: '10px 18px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
