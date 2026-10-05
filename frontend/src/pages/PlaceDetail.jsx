import React, { useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { useParams, Link } from 'react-router-dom';
import api from '../api.js';
import MapView from '../components/MapView.jsx';
import PlaceVisual from '../components/PlaceVisual.jsx';
import NearbyPlaces from '../components/NearbyPlaces.jsx';
import ReviewSection from '../components/ReviewSection.jsx';
import PhotoGallery from '../components/PhotoGallery.jsx';
import { usePlan } from '../PlanContext.jsx';
import { estimateTravelTime } from '../utils/travelTime.js';

export default function PlaceDetail() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [allPlaces, setAllPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addPlace, removePlace, isInPlan } = usePlan();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/places/${id}`)
      .then((res) => { if (!cancelled) setPlace(res.data); })
      .catch(() => { if (!cancelled) setError('This place could not be found.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    api.get('/places')
      .then((res) => { if (!cancelled) setAllPlaces(res.data); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <p className="loading-note">Loading place details…</p>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!place) return null;

  const inPlan = isInPlan(place.place_id);

  return (
    <div>
      <Link to="/" className="btn btn-outline btn-sm" style={{ marginBottom: '1.4rem', display: 'inline-block' }}>&larr; Back to Explore</Link>

      <div className="detail-visual">
        <PlaceVisual category={place.category} imageUrl={place.image_url} alt={place.name} height={320} />
      </div>

      <div className="detail-header">
        <span className={`category-tag ${place.category}`}>{place.category}</span>
        <h1>{place.name}</h1>
        <p className="lede">
          ~{Number(place.distance_km).toFixed(1)} km from Bokundara, Piliyandala
          <span className="travel-time-inline"> &middot; <Icon name="car" size={14} className="icon-lead" />{estimateTravelTime(place.distance_km)} drive</span>
        </p>
        {!place.is_verified && (
          <p className="unverified-flag">Distance and details for this place are approximate and have not yet been field-verified.</p>
        )}
      </div>

      <div className="detail-grid">
        <div>
          <div className="info-block" style={{ borderTop: 'none', paddingTop: 0 }}>
            <h4>About this place</h4>
            <p>{place.description}</p>
          </div>
          <div className="info-block">
            <h4>Opening times</h4>
            <p>{place.opening_times}</p>
          </div>
          {place.travel_tips && (
            <div className="info-block">
              <h4>Travel tips</h4>
              <p>{place.travel_tips}</p>
            </div>
          )}
          <button type="button" className={`btn ${inPlan ? 'btn-outline' : 'btn-gold'}`} onClick={() => (inPlan ? removePlace(place.place_id) : addPlace(place))}>
            {inPlan ? 'Remove from my visit plan' : 'Add to my visit plan'}
          </button>

          <PhotoGallery placeId={place.place_id} mainImageUrl={place.image_url} placeName={place.name} />
          <ReviewSection placeId={place.place_id} />
        </div>
        <div>
          <MapView places={[place]} height={320} />
          <NearbyPlaces currentPlace={place} allPlaces={allPlaces} />
        </div>
      </div>
    </div>
  );
}