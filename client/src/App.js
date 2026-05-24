import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OfficialRegisterPage from './pages/OfficialRegisterPage';
import MapPage from './pages/MapPage';
import ReportPage from './pages/ReportPage';
import IssueDetailPage from './pages/IssueDetailPage';
import DashboardPage from './pages/DashboardPage';
import MobileNav from './components/MobileNav';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { CitizenRoute, OfficialRoute, AuthRoute } from './components/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  const hideNavOn = ['/', '/login', '/register'];
  const isHidden = hideNavOn.includes(location.pathname) ||
    location.pathname.startsWith('/register/');

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/official-civicpulse-2026" element={<OfficialRegisterPage />} />
        <Route path="/map" element={<AuthRoute><MapPage /></AuthRoute>} />
        <Route path="/report" element={<CitizenRoute><ReportPage /></CitizenRoute>} />
        <Route path="/issues/:id" element={<AuthRoute><IssueDetailPage /></AuthRoute>} />
        <Route path="/dashboard" element={<OfficialRoute><DashboardPage /></OfficialRoute>} />
      </Routes>
      {!isHidden && <MobileNav />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;