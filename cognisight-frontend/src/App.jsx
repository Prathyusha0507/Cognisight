import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { About } from './pages/About';
import { Layout } from './pages/Layout';
import { Dashboard } from './components/Dashboard';
import { Chat } from './components/Chat';
import { ChangePassword } from './pages/ChangePassword';
import { IDE } from './pages/IDE';
// ✅ 1. Import the new Documentation page
import { Documentation } from './pages/Documentation'; 
import Tc from './components/Tc'

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '1rem' }}>Loading...</div>
        </div>
      </div>
    );
  }
  
  return token ? children : <Navigate to="/" />;
};

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/ide" element={<IDE />} />
          {/* ✅ 2. Add the Route */}
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/Tc" element={<Tc />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}