import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-column">
          <span className="footer-brand">Bokundara Trails</span>
          <p className="footer-desc">
            A web-based visit-planning system that helps you discover places and plan a
            one-day trip within 25 km of Bokundara, Piliyandala.          </p>
        </div>

        <nav className="footer-column" aria-label="Footer">
          <h4>Quick links</h4>
          <ul className="footer-links">
            <li><Link to="/">Explore places</Link></li>
            <li><Link to="/plan">My visit plan</Link></li>
            <li>
              <a href="https://github.com/uhkodagoda/tourist-planner" target="_blank" rel="noopener noreferrer" className="footer-icon-link">
                <Icon name="github" size={16} />
                Source code
              </a>
            </li>
          </ul>
        </nav>

        <div className="footer-column">
          <h4>Project info</h4>
          <p className="footer-note">
            ITE2953 – Programming Group Project<br />
            University of Moratuwa
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Designed and developed by U H Kodagoda (E2410514)</p>
      </div>
    </footer>
  );
}