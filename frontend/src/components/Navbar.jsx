import React from 'react';
import Icon from './Icon.jsx';
import { NavLink } from 'react-router-dom';
import { usePlan } from '../PlanContext.jsx';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar({ darkMode, setDarkMode }) {
  const { plan } = usePlan();
  const { isAuthenticated, username, logout } = useAuth();

  return (
    <nav className="nav">
      <div className="nav-brand">
        <span className="mark">Bokundara Trails</span>
        <span className="place">Piliyandala &middot; day-visit planner</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Explore
        </NavLink>
        <NavLink to="/plan" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          My Plan
          {plan.length > 0 && <span className="nav-plan-badge">{plan.length}</span>}
        </NavLink>
        {isAuthenticated ? (
          <>
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Admin ({username})
            </NavLink>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); logout(); }}>
              Log out
            </a>
          </>
        ) : (
          <NavLink to="/admin/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Admin
          </NavLink>
        )}
        <button
          type="button"
          className="nav-link dark-toggle"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle dark mode"
        >
          <Icon name={darkMode ? 'sun' : 'moon'} size={18} />
        </button>
      </div>
    </nav>
  );
}