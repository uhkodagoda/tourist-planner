import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-code">404</div>
        <h1>Page not found</h1>
        <p className="not-found-message">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn btn-gold">Back to Explore</Link>
          <Link to="/plan" className="btn btn-outline">View my plan</Link>
        </div>

        <div className="not-found-suggestions">
          <h3>You might be looking for</h3>
          <ul>
            <li><Link to="/">Explore places</Link></li>
            <li><Link to="/plan">My visit plan</Link></li>
            <li><Link to="/admin/login">Admin login</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}