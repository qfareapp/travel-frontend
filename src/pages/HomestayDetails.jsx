// src/pages/HomestayDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './HomestayDetails.css';

const API_BASE =
  (import.meta?.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:5000';

const inr = v => `₹${Number(v || 0).toLocaleString('en-IN')}`;

const buildUrl = (p) => {
  if (!p) return '/images/placeholder-stay.jpg';
  if (/^https?:\/\//i.test(p)) return p;
  const clean = String(p).replace(/^\.?\//, '');
  return `${API_BASE}/${clean}`;
};

const minPP = (hs) => {
  const fromRooms = (hs.roomTypes || [])
    .map(rt => Number(rt.pricePerPerson || 0))
    .filter(Boolean);
  const minRoom = fromRooms.length ? Math.min(...fromRooms) : 0;
  const fallback = Number(hs.price || hs.perHeadPrice || hs.pricePerHead || 0);
  return minRoom || fallback || 0;
};

export default function HomestayDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [form, setForm] = useState({ userName: '', rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadHomestay = async () => {
    const res = await axios.get(`${API_BASE}/api/homestays/${id}`);
    const homestay = res.data;
    setData({
      homestay,
      reviews: homestay.reviews || [],
      minPerPerson: minPP(homestay),
    });
  };

  useEffect(() => {
    loadHomestay().catch(console.error);
  }, [id]);

  if (!data) return <div className="container">Loading...</div>;

  const { homestay, reviews, minPerPerson } = data;
  const name = homestay.homestayName || homestay.name;

  // Use API_BASE for images
  const photos = Array.isArray(homestay.images) && homestay.images.length
    ? homestay.images.map(buildUrl)
    : ['/images/placeholder-stay.jpg'];

  const circuitName = homestay.circuitId?.name;
  const circuitExperiences = homestay.circuitId?.experiences || [];
  const onsiteExperiences = homestay.experiences || [];

  const submitReview = async (e) => {
    e.preventDefault();
    if (!form.rating) return;
    setSubmitting(true);
    try {
      // Make sure this route exists in your backend. If not, add it or disable reviews for now.
      await axios.post(`${API_BASE}/api/homestays/${homestay._id}/reviews`, form);
      await loadHomestay(); // re-fetch from /:id, not /detail
      setForm({ userName: '', rating: 0, comment: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hs-container">
      {/* Gallery */}
      <div className="hs-gallery">
        <div className="hs-main">
          <img src={photos[activeIdx]} alt={name} />
        </div>
        <div className="hs-thumbs">
          {photos.map((src, i) => (
            <button key={i} className={`hs-thumb ${i === activeIdx ? 'active' : ''}`} onClick={() => setActiveIdx(i)}>
              <img src={src} alt={`photo-${i}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="hs-header">
        <div className="hs-title">
          <h1>{name}</h1>
          <div className="hs-sub">
            <span className="hs-location" title={homestay.location || circuitName}>
              {homestay.location || circuitName || '—'}
            </span>
            <span className={`hs-vibe ${homestay.vibe?.toLowerCase()}`}>{homestay.vibe || 'Offbeat'}</span>
          </div>
        </div>

        <div className="hs-price-box">
          {minPerPerson > 0 ? (
            <>
              <div className="hs-price">{inr(minPerPerson)}</div>
              <div className="hs-price-unit">per person</div>
            </>
          ) : (
            <div className="hs-price">Price on request</div>
          )}
          <div className="hs-rating-aggregate">
            <span className="hs-badge">{(homestay.averageRating || 0).toFixed(1)}/5</span>
            <span className="hs-count">{homestay.ratingCount || 0} ratings</span>
          </div>
        </div>
      </div>

      {/* Room types */}
      {Array.isArray(homestay.roomTypes) && homestay.roomTypes.length > 0 && (
        <section className="hs-section">
          <h2>Rooms</h2>
          <div className="hs-rooms">
            {homestay.roomTypes.map((rt, i) => (
              <div key={i} className="hs-room">
                <div className="hs-room-img">
                  <img src={rt.images?.[0] ? `http://localhost:5000${rt.images[0]}` : '/images/placeholder-room.jpg'} alt={rt.name} />
                </div>
                <div className="hs-room-body">
                  <h3>{rt.name}</h3>
                  <div className="hs-room-meta">
                    <span>Capacity: {rt.capacity || '-'}</span>
                    {rt.bedType && <span>Bed: {rt.bedType}</span>}
                  </div>
                  {rt.amenities?.length > 0 && (
                    <div className="hs-room-amenities">
                      {rt.amenities.map((a, idx) => <span key={idx} className="pill">{a}</span>)}
                    </div>
                  )}
                </div>
                <div className="hs-room-price">
                  {rt.pricePerPerson ? (
                    <>
                      <div className="amt">{inr(rt.pricePerPerson)}</div>
                      <div className="unit">per person</div>
                    </>
                  ) : rt.pricePerRoom ? (
                    <>
                      <div className="amt">{inr(rt.pricePerRoom)}</div>
                      <div className="unit">per room</div>
                    </>
                  ) : <div className="amt">—</div>}
                  <button className="btn-primary">Select</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experiences */}
      {(circuitExperiences.length > 0 || onsiteExperiences.length > 0) && (
        <section className="hs-section">
          <h2>Nearby & Onsite Experiences</h2>
          <div className="hs-pills">
            {[...onsiteExperiences, ...circuitExperiences].map((e, i) => (
              <span key={i} className="pill">{e}</span>
            ))}
          </div>
        </section>
      )}

      {/* Circuit */}
      {circuitName && (
        <section className="hs-section hs-circuit">
          <h2>Mapped Circuit</h2>
          <div className="hs-circuit-box">
            <div className="c-name">{circuitName}</div>
            <Link to="/plan" className="btn-primary hs-circuit-btn">Plan a trip</Link>
          </div>
        </section>
      )}

      {/* Description */}
      {homestay.description && (
        <section className="hs-section">
          <h2>About</h2>
          <p className="hs-desc">{homestay.description}</p>
        </section>
      )}

      {/* Reviews */}
      <section className="hs-section">
        <h2>Guest Reviews</h2>

        <form className="hs-review-form" onSubmit={submitReview}>
          <input
            type="text"
            placeholder="Your name (optional)"
            value={form.userName}
            onChange={e => setForm({ ...form, userName: e.target.value })}
          />

          <div className="hs-stars-input">
            {[1,2,3,4,5].map(s => (
              <button
                key={s}
                type="button"
                className={`star ${form.rating >= s ? 'active' : ''}`}
                onClick={() => setForm({ ...form, rating: s })}
                aria-label={`${s} star`}
              >★</button>
            ))}
          </div>

          <textarea
            rows="4"
            placeholder="Write your review..."
            value={form.comment}
            onChange={e => setForm({ ...form, comment: e.target.value })}
          />

          <button className="btn-primary" disabled={submitting || !form.rating}>
            {submitting ? 'Submitting...' : 'Submit review'}
          </button>
        </form>

        <div className="hs-reviews">
          {reviews.length === 0 && <div className="muted">No reviews yet.</div>}
          {reviews.map(r => (
            <div key={r._id} className="hs-review">
              <div className="hs-review-h">
                <span className="r-name">{r.userName || 'Guest'}</span>
                <span className="r-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
              <div className="r-body">{r.comment}</div>
              <div className="r-date">{new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
