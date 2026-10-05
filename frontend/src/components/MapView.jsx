import React, { useEffect, useMemo, useState } from 'react';
import Icon from './Icon.jsx';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function pinIcon(label) {
  return L.divIcon({
    className: 'numbered-pin-wrap',
    html: `<div class="numbered-pin">${label}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14]
  });
}

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 1) {
      map.setView(positions[0], 14);
    } else if (positions.length > 1) {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [map, positions]);
  return null;
}

function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export default function MapView({ places, height = 300, title }) {
  const points = (places || []).filter((p) => p.latitude && p.longitude);
  const key = points.map((p) => `${p.latitude},${p.longitude}`).join('|');
  const positions = useMemo(
    () => points.map((p) => [Number(p.latitude), Number(p.longitude)]),
    [key]
  );
  const [route, setRoute] = useState(null);

  useEffect(() => {
    setRoute(null);
    if (positions.length < 2) return undefined;

    let cancelled = false;
    const path = positions.map(([lat, lng]) => `${lng},${lat}`).join(';');

    fetch(`https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.routes || !data.routes[0]) return;
        const r = data.routes[0];
        setRoute({
          coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
          distanceKm: r.distance / 1000,
          minutes: Math.round(r.duration / 60)
        });
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [key]);

  if (points.length === 0) {
    return (
      <div className="map-box map-fallback">
        <strong>No locations to show yet.</strong>
        <p className="map-note">Add a place to see it here.</p>
      </div>
    );
  }

  const coords = points.map((p) => `${p.latitude},${p.longitude}`);
  const openInMapsUrl =
    points.length === 1
      ? `https://www.google.com/maps/search/?api=1&query=${coords[0]}`
      : `https://www.google.com/maps/dir/?api=1&destination=${coords[coords.length - 1]}&waypoints=${coords.slice(0, -1).join('|')}&travelmode=driving`;

  return (
    <div className="map-panel">
      <div className="map-panel-header">
        <span className="map-panel-title">
          {title || (points.length > 1 ? 'Route for this plan' : 'Location')}
        </span>
        <a href={openInMapsUrl} target="_blank" rel="noopener noreferrer" className="map-open-link">
          {points.length > 1 ? 'Open route in Google Maps' : 'Open in Google Maps'}<Icon name="arrowUpRight" size={14} className="icon-after" />
        </a>
      </div>

      <div className="map-box" style={{ height }}>
        <MapContainer
          center={positions[0]}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds positions={positions} />

          {positions.length > 1 && (
            <Polyline
              positions={route ? route.coords : positions}
              pathOptions={{
                color: '#3F6D5C',
                weight: 4,
                opacity: 0.85,
                dashArray: route ? undefined : '8 8'
              }}
            />
          )}

          {points.map((p, i) => (
            <Marker
              key={p.place_id || i}
              position={positions[i]}
              icon={pinIcon(points.length > 1 ? i + 1 : '')}
            >
              <Popup>
                <strong>{p.name}</strong>
                <br />
                {p.category}
                {p.distance_km != null && <> &middot; ~{Number(p.distance_km).toFixed(1)} km from Bokundara</>}
                {p.place_id && (
                  <>
                    <br />
                    <Link to={`/places/${p.place_id}`}>View details</Link>
                  </>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {route && (
        <p className="map-note">
          Driving route: about {route.distanceKm.toFixed(1)} km, {formatMinutes(route.minutes)} (live road data
          from OpenStreetMap / OSRM).
        </p>
      )}
    </div>
  );
}