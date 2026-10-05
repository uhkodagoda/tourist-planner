import React, { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import api from '../api.js';

export default function PhotoGallery({ placeId, mainImageUrl, placeName }) {
  const [photos, setPhotos] = useState([]);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get(`/places/${placeId}/photos`)
      .then((res) => setPhotos(res.data))
      .catch(() => {});
  }, [placeId]);

  const allImages = [
    ...(mainImageUrl ? [{ photo_id: 'main', url: mainImageUrl }] : []),
    ...photos
  ];

  if (allImages.length === 0) return null;

  return (
    <div className="photo-gallery info-block">
      <h4>Photo gallery</h4>
      <div className="gallery-strip">
        {allImages.map((img) => (
          <button
            type="button"
            key={img.photo_id}
            className="gallery-thumb"
            onClick={() => setLightbox(img.url)}
          >
            <img src={img.url} alt={placeName} />
          </button>
        ))}
      </div>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt={placeName} className="lightbox-image" />
          <button type="button" className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Close"><Icon name="x" size={18} /></button>
        </div>
      )}
    </div>
  );
}