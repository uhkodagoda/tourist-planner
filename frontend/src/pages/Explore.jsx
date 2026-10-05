import React, { useEffect, useMemo, useState } from 'react';
import api from '../api.js';
import CategoryFilter from '../components/CategoryFilter.jsx';
import PlaceCard from '../components/PlaceCard.jsx';
import YouTubeEmbed from '../components/YouTubeEmbed.jsx';
import WeatherWidget from '../components/WeatherWidget.jsx';

export default function Explore() {
  const [allPlaces, setAllPlaces] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [maxDistance, setMaxDistance] = useState(25);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.get('/places')
      .then((res) => { if (!cancelled) setAllPlaces(res.data); })
      .catch(() => { if (!cancelled) setError('Could not load places. Is the backend server running?'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const counts = useMemo(() => {
    const c = {};
    allPlaces.forEach((p) => { c[p.category] = (c[p.category] || 0) + 1; });
    return c;
  }, [allPlaces]);

  const places = useMemo(() => {
    let list = category === 'All' ? allPlaces : allPlaces.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (verifiedOnly) {
      list = list.filter((p) => p.is_verified);
    }
    list = list.filter((p) => Number(p.distance_km) <= maxDistance);
    list = [...list];
    if (sortBy === 'distance') list.sort((a, b) => a.distance_km - b.distance_km);
    else if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'category') list.sort((a, b) => a.category.localeCompare(b.category));
    return list;
  }, [allPlaces, category, search, sortBy, maxDistance, verifiedOnly]);

  return (
    <div>
      <div className="hero hero-banner">
        <YouTubeEmbed videoId="eWJWA9hv4yw" title="Sri Lanka tourism" startSeconds={0} />
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="eyebrow">A day trip, planned properly</div>
          <h1>Places worth visiting near Bokundara, Piliyandala</h1>
          <p className="lede">
            Browse religious sites, nature spots, heritage landmarks, cultural attractions and recreational
            spots within 25&nbsp;km — then build a simple one-day visit plan from what you find.
          </p>
          <div className="search-row">
            <input
              type="search"
              placeholder="Search places by name or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search places"
            />
          </div>
          <WeatherWidget />
        </div>
      </div>

      <h2 className="section-heading">Explore by category</h2>
      <CategoryFilter active={category} onChange={setCategory} counts={counts} total={allPlaces.length} />

      <div className="sort-row">
        <label htmlFor="sort">Sort by:</label>
        <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="distance">Distance (nearest first)</option>
          <option value="name">Name (A-Z)</option>
          <option value="category">Category</option>
        </select>

        <label htmlFor="max-distance">Within:</label>
        <input
          id="max-distance"
          type="range"
          min="1"
          max="25"
          value={maxDistance}
          onChange={(e) => setMaxDistance(Number(e.target.value))}
        />
        <span className="filter-value">{maxDistance} km</span>

        <label className="checkbox-inline">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
          />
          Verified only
        </label>

        <span className="result-count">{places.length} places</span>
      </div>

      {loading && (
        <div className="place-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-thumb" />
              <div className="skeleton-lines">
                <div className="skeleton-line skeleton-line-tag" />
                <div className="skeleton-line skeleton-line-title" />
                <div className="skeleton-line skeleton-line-meta" />
                <div className="skeleton-line skeleton-line-desc" />
                <div className="skeleton-line skeleton-line-desc" style={{ width: '70%' }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <div className="error-banner">{error}</div>}

      {!loading && !error && places.length === 0 && (
        <div className="empty-state"><p>No places match this search/category yet. Try something else.</p></div>
      )}

      {!loading && !error && places.length > 0 && (
        <div className="place-grid">
          {places.map((place) => <PlaceCard key={place.place_id} place={place} />)}
        </div>
      )}
    </div>
  );
}