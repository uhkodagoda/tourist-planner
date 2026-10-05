import React from 'react';
import Icon from './Icon.jsx';
import { Link } from 'react-router-dom';
import { usePlan } from '../PlanContext.jsx';
import PlaceVisual from './PlaceVisual.jsx';
import { estimateTravelTime } from '../utils/travelTime.js';

function isOpenNow(openingTimes) {
  if (!openingTimes || openingTimes === 'Not specified') return null;

  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  if (openingTimes.includes('24 hours') || openingTimes.includes('Open 24')) {
    return true;
  }
  if (openingTimes.includes('closed Mondays') && day === 1) {
    return false;
  }
  return hour >= 8 && hour < 18;
}

export default function PlaceCard({ place }) {
  const { addPlace, removePlace, isInPlan, toggleFavorite, isFavorite } = usePlan();
  const inPlan = isInPlan(place.place_id);
  const fav = isFavorite(place.place_id);
  const openStatus = isOpenNow(place.opening_times);

  return (
    <article className="place-card">
      <div className="place-card-visual">
        <PlaceVisual category={place.category} imageUrl={place.image_url} alt={place.name} height={160} />
        <button
          type="button"
          className={`fav-btn ${fav ? 'active' : ''}`}
          onClick={() => toggleFavorite(place.place_id)}
          title={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Icon name="heart" size={18} filled={Boolean(fav)} />
        </button>
      </div>

      <div className="place-card-content">
        <div className="card-top-row">
          <span className={`category-tag ${place.category}`}>{place.category}</span>
          {openStatus === true && <span className="open-badge">● Open Now</span>}
          {openStatus === false && <span className="closed-badge">● Closed</span>}
        </div>

        <h3>{place.name}</h3>
        <div className="place-meta">
          <span>{Number(place.distance_km).toFixed(1)} km from Bokundara</span>
          <span className="travel-time"><Icon name="car" size={14} className="icon-lead" />{estimateTravelTime(place.distance_km)}</span>
          {!place.is_verified && <span className="unverified-flag">&middot; approximate</span>}
        </div>
        <p className="desc">
          {place.description.length > 120
            ? `${place.description.slice(0, 120).trim()}...`
            : place.description}
        </p>
        <div className="card-bottom">
          <Link to={`/places/${place.place_id}`} className="btn btn-outline btn-sm">
            View details
          </Link>
          <button
            type="button"
            className={`btn btn-sm ${inPlan ? 'btn-outline' : 'btn-gold'}`}
            onClick={() => (inPlan ? removePlace(place.place_id) : addPlace(place))}
          >
            {inPlan ? 'Remove from plan' : 'Add to plan'}
          </button>
        </div>
      </div>
    </article>
  );
}