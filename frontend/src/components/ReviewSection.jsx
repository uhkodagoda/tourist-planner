import React, { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import api from '../api.js';
import { useToast } from '../ToastContext.jsx';

export default function ReviewSection({ placeId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
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

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setError('Please fill in your name and a comment.');
      return;
    }
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
      setRating(5);
      setComment('');
      showToast('Thanks for your review!', 'success');
      loadReviews();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="review-section info-block">
      <h4>
        Visitor reviews
        {avgRating && <span className="avg-rating"> &middot; {avgRating} <Icon name="star" size={13} filled className="icon-star" /> ({reviews.length})</span>}
      </h4>

      {loading && <p className="loading-note">Loading reviews…</p>}

      {!loading && reviews.length === 0 && (
        <p className="info-note">No reviews yet — be the first to share your experience.</p>
      )}

      <ul className="review-list">
        {reviews.map((r) => (
          <li key={r.review_id} className="review-item">
            <div className="review-item-head">
              <span className="review-name">{r.reviewer_name}</span>
              <span className="review-stars">{[1, 2, 3, 4, 5].map((n) => (<Icon key={n} name="star" size={14} filled={n <= r.rating} className={n <= r.rating ? 'icon-star' : 'icon-star-empty'} />))}</span>
            </div>
            <p className="review-comment">{r.comment}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="review-form">
        <h5>Leave a review</h5>
        {error && <div className="error-banner">{error}</div>}
        <div className="field-row">
          <div className="field">
            <label htmlFor="reviewer-name">Your name</label>
            <input id="reviewer-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="review-rating">Rating</label>
            <select id="review-rating" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'star' : 'stars'}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="review-comment">Comment</label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you think of this place?"
            required
          />
        </div>
        <button type="submit" className="btn btn-gold btn-sm" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit review'}
        </button>
      </form>
    </div>
  );
}