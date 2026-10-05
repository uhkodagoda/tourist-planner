import React, { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../AuthContext.jsx';

const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'Admin@123';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.token, res.data.username);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopyDemo() {
    navigator.clipboard.writeText(`${DEMO_USERNAME} / ${DEMO_PASSWORD}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="login-page">
      <div className="login-form-side">
        <div className="login-form-container">
          <div className="login-logo">
            <div className="login-logo-icon"><Icon name="landmark" size={26} /></div>
            <div>
              <div className="login-logo-mark">Bokundara Trails</div>
              <div className="login-logo-sub">Admin Panel</div>
            </div>
          </div>

          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to manage places and visit plans</p>

          {error && (
            <div className="login-error">
              <span className="login-error-icon"><Icon name="alert" size={18} /></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="username">Username</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Icon name="user" size={18} /></span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Icon name="lock" size={18} /></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-show-password"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="login-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" className="login-forgot" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Signing in…
                </>
              ) : (
                <>Sign In<Icon name="arrowRight" size={16} className="icon-after" /></>
              )}
            </button>
          </form>

          <div className="login-demo">
            <div className="login-demo-header">
              <span><Icon name="key" size={14} className="icon-lead" />Demo credentials</span>
              <button type="button" className="login-demo-copy" onClick={handleCopyDemo}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="login-demo-body">
              <code>{DEMO_USERNAME}</code> / <code>{DEMO_PASSWORD}</code>
            </div>
          </div>
        </div>
      </div>

      <div className="login-info-side">
        <div className="login-info-decoration">
          <span className="login-circle login-circle-1" />
          <span className="login-circle login-circle-2" />
          <span className="login-circle login-circle-3" />
        </div>

        <div className="login-info-content">
          <span className="login-info-badge">ITE2953 &middot; University of Moratuwa</span>
          <h2>Manage your local tourism platform</h2>
          <p>
            Add, edit and manage places of interest. Track visit plans and keep information
            accurate for tourists exploring the Bokundara&ndash;Piliyandala area.
          </p>

          <ul className="login-features">
            <li>
              <span className="login-feature-icon"><Icon name="mapPin" size={20} /></span>
              <div>
                <strong>Manage places</strong>
                <span>Add, edit, delete places of interest</span>
              </div>
            </li>
            <li>
              <span className="login-feature-icon"><Icon name="chart" size={20} /></span>
              <div>
                <strong>Dashboard stats</strong>
                <span>Track plans, categories and popular places</span>
              </div>
            </li>
            <li>
              <span className="login-feature-icon"><Icon name="lock" size={20} /></span>
              <div>
                <strong>Secure access</strong>
                <span>JWT-protected admin routes</span>
              </div>
            </li>
          </ul>

          <div className="login-info-footer">
            <p>&copy; 2026 Bokundara Trails</p>
          </div>
        </div>
      </div>
    </div>
  );
}