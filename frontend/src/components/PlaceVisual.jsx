import React, { useState } from 'react';

const ICONS = {
  Religious: (
    <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 8 L68 22 L52 22 Z" fill="currentColor" opacity="0.9" />
      <rect x="58" y="22" width="4" height="10" fill="currentColor" opacity="0.7" />
      <path d="M30 78 L34 46 Q60 30 86 46 L90 78 Z" fill="currentColor" opacity="0.55" />
      <path d="M40 78 L43 50 Q60 40 77 50 L80 78 Z" fill="currentColor" opacity="0.85" />
      <rect x="53" y="60" width="14" height="18" rx="1" fill="white" opacity="0.8" />
      <line x1="18" y1="78" x2="102" y2="78" stroke="currentColor" strokeWidth="2" opacity="0.8" />
    </svg>
  ),
  Nature: (
    <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 10 C40 10 34 30 40 40 C30 42 26 56 36 62 C34 72 44 80 54 76 L54 82 L66 82 L66 76 C76 80 86 72 84 62 C94 56 90 42 80 40 C86 30 80 10 60 10 Z" fill="currentColor" opacity="0.75" />
      <rect x="57" y="76" width="6" height="10" fill="currentColor" opacity="0.9" />
    </svg>
  ),
  Heritage: (
    <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26 34 L60 14 L94 34 Z" fill="currentColor" opacity="0.85" />
      <rect x="22" y="34" width="76" height="6" fill="currentColor" opacity="0.7" />
      <rect x="30" y="44" width="8" height="30" fill="currentColor" opacity="0.6" />
      <rect x="48" y="44" width="8" height="30" fill="currentColor" opacity="0.6" />
      <rect x="64" y="44" width="8" height="30" fill="currentColor" opacity="0.6" />
      <rect x="82" y="44" width="8" height="30" fill="currentColor" opacity="0.6" />
      <rect x="20" y="76" width="80" height="6" fill="currentColor" opacity="0.9" />
    </svg>
  ),
  Cultural: (
    <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 8 C50 18 50 26 60 32 C70 26 70 18 60 8 Z" fill="currentColor" opacity="0.9" />
      <path d="M24 40 Q60 20 96 40 L90 78 L30 78 Z" fill="currentColor" opacity="0.5" />
      <path d="M34 46 Q60 32 86 46 L82 78 L38 78 Z" fill="currentColor" opacity="0.85" />
      <circle cx="60" cy="60" r="9" fill="white" opacity="0.8" />
    </svg>
  ),
  Recreational: (
    <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="88" cy="24" r="13" fill="currentColor" opacity="0.85" />
      <path d="M8 68 Q30 50 52 68 T96 68 T112 68" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.6" />
      <path d="M8 78 Q30 62 52 78 T96 78 T112 78" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.85" />
    </svg>
  ),
};

export default function PlaceVisual({ category, imageUrl, alt, height = 130 }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageUrl && !imageFailed) {
    return (
      <div className="place-visual has-photo" style={{ height }}>
        <img
          src={imageUrl}
          alt={alt || `Photo of ${category} place`}
          onError={() => setImageFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`place-visual ${category}`}
      style={{ height }}
      aria-hidden="true"
    >
      {ICONS[category] || ICONS.Nature}
    </div>
  );
}