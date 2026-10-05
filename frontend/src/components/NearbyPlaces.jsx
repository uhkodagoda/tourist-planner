import React from 'react';
import { Link } from 'react-router-dom';
import { findNearbyPlaces } from '../utils/nearbyPlaces.js';

export default function NearbyPlaces({ currentPlace, allPlaces }) {
  const nearby = findNearbyPlaces(currentPlace, allPlaces);

  if (nearby.length === 0) return null;

  return (
    <div className="nearby-block">
      <h4>Nearby places</h4>
      <div className="nearby-list">
        {nearby.map((p) => (
          <Link to={`/places/${p.place_id}`} key={p.place_id} className="nearby-item">
            <span className={`category-tag ${p.category}`}>{p.category}</span>
            <span className="nearby-name">{p.name}</span>
            <span className="nearby-distance">{p.nearbyKm.toFixed(1)} km away</span>
          </Link>
        ))}
      </div>
    </div>
  );
}