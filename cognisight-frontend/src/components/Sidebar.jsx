import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitial = (username) => username?.charAt(0).toUpperCase() || 'U';

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <h1 style={styles.logoText}>Cognisight</h1>
      </div>

      <div style={styles.profileBox}>
        <div style={styles.avatarCircle}>
          {getInitial(user?.username)}
        </div>
        <p style={styles.profileName}>{user?.username}</p>
        <p style={styles.profileEmail}>{user?.email}</p>

        <div style={styles.profileDropdownWrapper}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={styles.profileTrigger}
          >
            ⋮ Menu
          </button>
          {showDropdown && (
            <div style={styles.profileDropdown}>
              <Link to="/dashboard" style={styles.dropdownLink}>Dashboard</Link>
              <Link to="/change-password" style={styles.dropdownLink}>Change Password</Link>
              <div style={styles.dropdownDivider}></div>
              <button
                onClick={handleLogout}
                style={{...styles.dropdownLink, color: '#dc2626', width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: '12px 16px', cursor: 'pointer'}}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <nav style={styles.nav}>
        <ul style={styles.navList}>
          <li><Link to="/dashboard" style={styles.navLink}>📊 Dashboard</Link></li>
          <li><Link to="/chat" style={styles.navLink}>💬 Chat</Link></li>
          <li><Link to="/about" style={styles.navLink}>ℹ️ About</Link></li>
        </ul>
      </nav>

      <div style={styles.footer}>
        <p style={styles.footerText}>© 2024 Cognisight</p>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '25px 20px',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto'
  },
  logo: {
    textAlign: 'center',
    marginBottom: '30px',
    borderBottom: '1px solid #334155',
    paddingBottom: '20px'
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0
  },
  profileBox: {
    padding: '20px 16px',
    borderBottom: '1px solid #334155',
    textAlign: 'center'
  },
  avatarCircle: {
    width: '56px',
    height: '56px',
    margin: '0 auto 8px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  profileName: {
    color: '#e5e7eb',
    fontWeight: '600',
    fontSize: '16px',
    margin: '4px 0'
  },
  profileEmail: {
    color: '#9ca3af',
    fontSize: '12px',
    margin: '2px 0'
  },
  profileDropdownWrapper: {
    position: 'relative',
    marginTop: '12px'
  },
  profileTrigger: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    color: '#cbd5e1',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: '0.3s'
  },
  profileDropdown: {
    position: 'absolute',
    top: '40px',
    right: 0,
    backgroundColor: 'white',
    color: '#1e293b',
    borderRadius: '8px',
    boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    zIndex: 50,
    minWidth: '200px'
  },
  dropdownLink: {
    display: 'block',
    padding: '12px 16px',
    textDecoration: 'none',
    color: '#1e293b',
    fontSize: '14px',
    transition: '0.3s'
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: '#e5e7eb'
  },
  nav: {
    flex: 1,
    padding: '1rem 0'
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  navLink: {
    display: 'block',
    padding: '10px 18px',
    color: '#cbd5e1',
    textDecoration: 'none',
    fontSize: '17px',
    borderRadius: '6px',
    transition: '0.3s',
    marginBottom: '8px'
  },
  footer: {
    paddingTop: '12px',
    borderTop: '1px solid #334155',
    textAlign: 'center'
  },
  footerText: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0
  }
};
