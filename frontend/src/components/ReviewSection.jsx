
import React, { useEffect, useMemo, useState } from 'react';
import Icon from './Icon.jsx';
import api from '../api.js';
import { useToast } from '../ToastContext.jsx';

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
const MAX_COMMENT = 500;

// "2 days ago" style date; falls back to an empty string for bad dates
function timeAgo(value) {
  const t = new Date(value).getTime();
  if (!t) return '';
  const diff = Math.min(0, Math.round((t - Date.now()) / 1000)); // seconds, never in the future
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return 'just now';
}

function Stars({ value, size = 16 }) {
  const filled = Math.round(value);
  return (
    <span className="rv-stars" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={size} filled={n <= filled} className={n <= filled ? 'icon-star' : 'icon-star-empty'} />
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="rv-picker" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={`rv-picker-star ${n <= shown ? 'on' : ''}`}
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(0)}
          onClick={() => onChange(n)}
        >
          <Icon name="star" size={30} filled={n <= shown} />
        </button>
      ))}
      <span className="rv-picker-label">{LABELS[shown] || 'Select a rating'}</span>
    </div>
  );
}

export default function ReviewSection({ placeId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  function loadReviews() {
    setLoading(true);
    api.get(`/reviews/${placeId}`)
      .then((res) => setReviews(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(loadReviews, [placeId]);

  const stats = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0];
    reviews.forEach((r) => { counts[r.rating] = (counts[r.rating] || 0) + 1; });
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    return { counts, avg };
  }, [reviews]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your name.');
    if (!rating) return setError('Please choose a star rating.');
    if (!comment.trim()) return setError('Please write a short review.');
    setError(null);
    setSubmitting(true);
    try {
      await api.post('/reviews', {
        place_id: placeId,
        reviewer_name: name.trim(),
        rating,
        comment: comment.trim()
      });
      setName('');
      setRating(0);
      setComment('');
      showToast('Thanks for your review!', 'success');
      loadReviews();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit your review.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rv">
      <h4 className="rv-heading">Visitor reviews</h4>

      {loading && <p className="loading-note">Loading reviews…</p>}

      {!loading && reviews.length === 0 && (
        <div className="rv-empty">
          <Icon name="star" size={26} className="icon-star-empty" />
          <p>No reviews yet. Be the first to share your experience.</p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <>
          <div className="rv-summary">
            <div className="rv-score">
              <div className="rv-score-num">{stats.avg.toFixed(1)}</div>
              <Stars value={stats.avg} size={18} />
              <div className="rv-score-count">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</div>
            </div>
            <div className="rv-bars">
              {[5, 4, 3, 2, 1].map((n) => (
                <div key={n} className="rv-bar-row">
                  <span className="rv-bar-label">{n}</span>
                  <Icon name="star" size={12} filled className="icon-star" />
                  <div className="rv-bar-track">
                    <div className="rv-bar-fill" style={{ width: `${(stats.counts[n] / reviews.length) * 100}%` }} />
                  </div>
                  <span className="rv-bar-count">{stats.counts[n]}</span>
                </div>
              ))}
            </div>
          </div>

          <ul className="rv-list">
            {reviews.map((r) => (
              <li key={r.review_id} className="rv-item">
                <div className="rv-avatar" style={{ background: `hsl(${(r.reviewer_name.charCodeAt(0) * 37) % 360} 35% 38%)` }} aria-hidden="true">
                  {r.reviewer_name.trim().charAt(0).toUpperCase()}
                </div>
                <div className="rv-item-body">
                  <div className="rv-item-head">
                    <span className="rv-name">{r.reviewer_name}</span>
                    <span className="rv-date">{timeAgo(r.created_at)}</span>
                  </div>
                  <Stars value={r.rating} size={14} />
                  <p className="rv-comment">{r.comment}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <form onSubmit={handleSubmit} className="rv-form" noValidate>
        <h5>Write a review</h5>
        {error && <div className="error-banner">{error}</div>}

        <div className="field">
          <label htmlFor="rv-name">Your name</label>
          <input id="rv-name" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nimal" />
        </div>

        <div className="field">
          <label>Your rating</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        <div className="field">
          <label htmlFor="rv-comment">Your review</label>
          <textarea
            id="rv-comment"
            rows={4}
            maxLength={MAX_COMMENT}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like? Any tips for other visitors?"
          />
          <span className="rv-count">{comment.length}/{MAX_COMMENT}</span>
        </div>

        <button type="submit" className="btn btn-gold" disabled={submitting}>
          {submitting ? 'Posting…' : 'Post review'}
        </button>
      </form>
    </section>
  );
}