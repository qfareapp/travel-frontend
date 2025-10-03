// src/components/HomestayCard.jsx
import React from 'react';

const API_BASE =
  (import.meta?.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  '';

const toUrl = (p) => {
  if (!p) return '/placeholder-stay.jpg';
  if (typeof p === 'object') p = p.url || p.path || p.src || p.href || '';
  if (!p) return '/placeholder-stay.jpg';
  if (/^https?:\/\//i.test(p)) return p;
  const clean = String(p).replace(/^\.?\//, '').replace(/\\/g, '/');
  return `${API_BASE}/${clean}`;
};

const inr = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? `₹${n.toLocaleString('en-IN')}` : '—';
};

export default function HomestayCard({ stay, onClick }) {
  const title = stay?.homestayName || stay?.name || 'Homestay';
  const cover = Array.isArray(stay?.images) && stay.images.length ? stay.images[0] : null;
  const priceText =
    stay?.pricingType === 'perroom'
      ? `${inr(stay?.price)} / room`
      : `${inr(stay?.price)} / person`;

  return (
    <article className="stay-card" onClick={onClick} role="button">
      <div className="stay-media">
        <img src={toUrl(cover)} alt={title} loading="lazy" />
        {stay?.vibe ? <span className="badge">{stay.vibe}</span> : null}
      </div>
      <div className="stay-body">
        <h3 className="stay-title">{title}</h3>
        <div className="stay-meta">
          {stay?.placeName ? <span className="meta">{stay.placeName}</span> : null}
          {Number.isFinite(Number(stay?.distance)) ? (
            <span className="meta">{Number(stay.distance)} km from entry</span>
          ) : null}
        </div>
        <div className="stay-price">{priceText}</div>
        {Array.isArray(stay?.experiences) && stay.experiences.length ? (
          <div className="stay-tags">
            {stay.experiences.slice(0, 4).map((t, i) => (
              <span key={i} className="chip">{String(t)}</span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
