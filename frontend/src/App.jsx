import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Explore from './pages/Explore.jsx';
import PlaceDetail from './pages/PlaceDetail.jsx';
import VisitPlan from './pages/VisitPlan.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import { PlanProvider } from './PlanContext.jsx';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import { ToastProvider } from './ToastContext.jsx';

function RequireAdmin({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

// NEW: keeps the browser tab title in sync with whichever page is showing.
function usePageTitle() {
  const location = useLocation();

  useEffect(() => {
    const titles = {
      '/': 'Explore — Bokundara Trails',
      '/plan': 'My Plan — Bokundara Trails',
      '/admin/login': 'Admin Login — Bokundara Trails',
      '/admin': 'Admin Dashboard — Bokundara Trails'
    };

    const path = location.pathname;
    let title = 'Bokundara Trails — Day-Visit Planner';

    if (titles[path]) {
      title = titles[path];
    } else if (path.startsWith('/places/')) {
      title = 'Place Details — Bokundara Trails';
    }

    document.title = title;
  }, [location]);
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  usePageTitle();

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <AuthProvider>
      <PlanProvider>
        <ToastProvider>
        <div className="app-shell">
          <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
          <main>
            <Routes>
              <Route path="/" element={<Explore />} />
              <Route path="/places/:id" element={<PlaceDetail />} />
              <Route path="/plan" element={<VisitPlan />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminDashboard />
                  </RequireAdmin>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="footer">
            <span className="footer-brand">Bokundara Trails</span>
            <p>Local Tourist Day-Visit Planner and Information System</p>
            <p className="footer-note">ITE2953 Programming Group Project &mdash; University of Moratuwa</p>
          </footer>
        </div>
        </ToastProvider>
      </PlanProvider>
    </AuthProvider>
  );
}