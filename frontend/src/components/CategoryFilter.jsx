import React from 'react';
import Icon from './Icon.jsx';
import PlaceVisual from './PlaceVisual.jsx';

const CATEGORIES = ['Religious', 'Nature', 'Heritage', 'Cultural', 'Recreational'];

const placesLabel = (n) => `${n} ${n === 1 ? 'place' : 'places'}`;

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
        <span className="tile-icon tile-icon-all"><Icon name="dashboard" size={22} /></span>
        <span className="tile-name">All</span>
        <span className="tile-count">{placesLabel(total)}</span>
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
          <span className="tile-count">{placesLabel(counts[cat] || 0)}</span>
        </button>
      ))}
    </div>
  );
}