import React from 'react';

export default function YouTubeEmbed({ videoId, title = 'Video', startSeconds = 0 }) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: videoId,
    controls: '1',           // Controls පෙන්නන්න
    modestbranding: '1',
    playsinline: '1',
    start: String(startSeconds),
    end: '80',               // ✅ 1:20 = 80 seconds ට නවත්තන්න
    rel: '0',
  });

  return (
    <div className="hero-video-bg">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?${params.toString()}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}