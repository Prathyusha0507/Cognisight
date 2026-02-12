import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Welcome back, {user?.username}! 👋</h1>
        <p style={styles.subtitle}>
          Your AI-powered workspace is ready to help you succeed.
        </p>
      </header>
      

      <div style={styles.cardsGrid}>
        
        <div style={styles.card}>
          <div style={styles.cardIcon}>🛠️</div>
          <h3 style={styles.cardTitle}>Projectbuilder</h3>
          <p style={styles.cardText}>
            ✨ Where development meets intelligence. ✨
          </p>
          <a href="/ide" style={styles.cardButton}>
            Start Building →
          </a>
        </div>
        <div style={styles.card}>
          <div style={styles.cardIcon}>🤖</div>
          <h3 style={styles.cardTitle}>AI Assistant</h3>
          <p style={styles.cardText}>
            Chat with our AI for instant help and insights
          </p>
          <a href="/chat" style={styles.cardButton}>
            Start Chatting →
          </a>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>📑</div>
          <h3 style={styles.cardTitle}>Documentation</h3>
          <p style={styles.cardText}>
            Learn about features and best practices
          </p>
          <a href="/documentation" style={styles.cardButton}>
            Generate doc →
          </a>
        </div>
        <div style={styles.card}>
          <div style={styles.cardIcon}>📝</div>
          <h3 style={styles.cardTitle}>TestCase Generator</h3>
          <p style={styles.cardText}>
            Learn about features and best practices
          </p>
          <a href="/Tc" style={styles.cardButton}>
            Generate TestCases →
          </a>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>⚙️</div>
          <h3 style={styles.cardTitle}>Settings</h3>
          <p style={styles.cardText}>
            Customize your preferences and account
          </p>
          <a href="/change-password" style={styles.cardButton}>
            Manage Account →
          </a>
        </div>
      </div>

      <div style={styles.quickAccessCard}>
        <h2 style={styles.quickAccessTitle}>Quick Access</h2>
        <div style={styles.quickAccessButtons}>
          <a href="/chat" style={{...styles.quickButton, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)'}}>
            Open Chat
          </a>
          <a href="/about" style={{...styles.quickButton, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)'}}>
            Learn More
          </a>
          <a href="/change-password" style={{...styles.quickButton, background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
            Security
          </a>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem'
  },
  header: {
    marginBottom: '3rem'
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#d9e0efff',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#95f874ff'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  card: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease'
  },
  cardIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#0f172a'
  },
  cardText: {
    color: '#64748b',
    marginBottom: '1rem',
    fontSize: '14px'
  },
  cardButton: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: '0.3s'
  },
  quickAccessCard: {
    background: 'white',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    padding: '2rem'
  },
  quickAccessTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: '1.5rem'
  },
  quickAccessButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem'
  },
  quickButton: {
    padding: '1rem',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '600',
    transition: '0.3s'
  }
};
