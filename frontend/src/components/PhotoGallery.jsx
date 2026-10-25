import React, { useCallback, useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import api from '../api.js';

export default function PhotoGallery({ placeId, mainImageUrl, placeName }) {
  const [photos, setPhotos] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    api.get(`/places/${placeId}/photos`)
      .then((res) => setPhotos(res.data))
      .catch(() => {});
  }, [placeId]);

  const allImages = [
    ...(mainImageUrl ? [{ photo_id: 'main', url: mainImageUrl }] : []),
    ...photos
  ];
  const count = allImages.length;
  const isOpen = openIndex !== null;

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (d) => setOpenIndex((i) => (i === null ? i : (i + d + count) % count)),
    [count]
  );

  // Keyboard: Esc closes, left / right arrows change photo. Page scroll is locked while open.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [isOpen, close, step]);

  if (count === 0) return null;

  return (
    <div className="photo-gallery info-block">
      <h4>Photo gallery <span className="gallery-count">({count})</span></h4>
      <div className="gallery-strip">
        {allImages.map((img, i) => (
          <button
            type="button"
            key={img.photo_id}
            className="gallery-thumb"
            onClick={() => setOpenIndex(i)}
            aria-label={`Open photo ${i + 1} of ${count}`}
          >
            <img src={img.url} alt={placeName} loading="lazy" />
          </button>
        ))}
      </div>

      {isOpen && (
        <div className="lightbox-overlay" onClick={close} role="dialog" aria-modal="true" aria-label="Photo viewer">
          <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
            <img src={allImages[openIndex].url} alt={placeName} className="lightbox-image" />
            <figcaption className="lightbox-count">{openIndex + 1} / {count}</figcaption>
          </figure>

          {count > 1 && (
            <>
              <button type="button" className="lightbox-arrow lightbox-prev" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous photo">
                <Icon name="arrowRight" size={20} className="lightbox-flip" />
              </button>
              <button type="button" className="lightbox-arrow lightbox-next" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next photo">
                <Icon name="arrowRight" size={20} />
              </button>
            </>
          )}

          <button type="button" className="lightbox-close" onClick={close} aria-label="Close"><Icon name="x" size={18} /></button>
        </div>
      )}
    </div>
  );
}