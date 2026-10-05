import React from 'react';
import PlaceVisual from './PlaceVisual.jsx';

const CATEGORIES = ['Religious', 'Nature', 'Heritage', 'Cultural', 'Recreational'];

// FR-04, FR-05, FR-06 — shown as icon tiles with a live place count per category,
// similar to an "Explore by category" section.
export default function CategoryFilter({ active, onChange, counts = {}, total = 0 }) {
  return (
    <div className="category-tiles" role="group" aria-label="Filter places by category">
      <button
        type="button"
        className={`category-tile ${active === 'All' ? 'active' : ''}`}
        onClick={() => onChange('All')}
        aria-pressed={active === 'All'}
      >
        <span className="tile-icon tile-icon-all">◎</span>
        <span className="tile-name">All</span>
        <span className="tile-count">{total} places</span>
      </button>

      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          className={`category-tile ${active === cat ? 'active' : ''}`}
          onClick={() => onChange(cat)}
          aria-pressed={active === cat}
        >
          <span className={`tile-icon-wrap ${cat}`}>
            <PlaceVisual category={cat} height={44} />
          </span>
          <span className="tile-name">{cat}</span>
          <span className="tile-count">{counts[cat] || 0} places</span>
        </button>
      ))}
    </div>
  );
}
