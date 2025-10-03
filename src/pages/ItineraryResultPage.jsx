import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ItineraryResultPage.css';

/* ===================== helpers ===================== */

const API_BASE =
  (import.meta?.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  'http://localhost:5000';

const n = (v, d = 0) => {
  const num = Number(v);
  return Number.isFinite(num) ? num : d;
};
const inr = (v) => `₹${n(v).toLocaleString('en-IN')}`;

const toUrl = (p) => {
  if (!p) return '/placeholder-circuit.jpg';
  if (typeof p === 'object' && p !== null) p = p.url || p.path || p.src || p.href || '';
  if (!p) return '/placeholder-circuit.jpg';
  if (/^https?:\/\//i.test(p)) return p;
  const clean = String(p).replace(/^\.?\//, '').replace(/\\/g, '/');
  const base = API_BASE.replace(/\/+$/, '');
  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return `${base}${path}`;
};

const CAR_TYPES = ['Hatchback', 'Sedan', 'SUV'];
const normalizeCarType = (t) => (CAR_TYPES.includes(t) ? t : '');

function pickRateStrict(circuit = {}, preferred) {
  const type = normalizeCarType(preferred);
  const rates = {
    Hatchback: n(circuit.carPriceHatchback),
    Sedan:     n(circuit.carPriceSedan),
    SUV:       n(circuit.carPriceSUV),
  };
  return { type, rate: type ? n(rates[type]) : 0 };
}

function computeInclusivePrice(itinerary = {}, userCarType, wantCar) {
  const circuit = itinerary.circuitId || {};
  const pax = n(itinerary.pax ?? itinerary.paxMin ?? itinerary.paxMax ?? 1, 1);
  const days = n(itinerary.days ?? itinerary.durationDays, 1);

  const plan = Array.isArray(itinerary.dayWisePlan) ? itinerary.dayWisePlan : [];
  const stayCostFromPlan = plan.reduce(
    (s, d) => (d?.stayAtHomestayId ? s + n(d.stayAtHomestayId.price) * pax : s),
    0
  );
  const fallbackHs = itinerary.homestay || plan[0]?.stayAtHomestayId || {};
  const fallbackPP = n(fallbackHs.price);
  const totalStay = stayCostFromPlan > 0 ? stayCostFromPlan : fallbackPP * pax * days;

  const totalKm = plan.reduce((s, d) => s + n(d?.travelDistanceKm), 0);
  let carType = '—';
  let totalCar = 0;

  if (wantCar) {
    const preferredType = normalizeCarType(
      userCarType || itinerary.transport?.carType || itinerary.carType || ''
    );
    const chosen = pickRateStrict(circuit, preferredType);
    carType = chosen.type || '—';
    totalCar = n(chosen.rate) * n(totalKm);
  }

  const total = n(totalStay) + n(totalCar);
  const perPerson = pax ? total / pax : total;

  return { pax, days, totalKm, carType, total, perPerson, wantCar: !!wantCar };
}

/* ===================== card ===================== */

function ResultItemCard({ item, filters, onOpen, isDirectFlow, onCustomize }) {
  const circuit = item.circuitId || {};
  const circuitName = circuit?.name || '—';
  const title = item.title || circuitName || 'Suggested Trip';
  const img = toUrl(
    item.image ||
      circuit.image ||
      (Array.isArray(item.homestay?.images) && item.homestay.images[0]) ||
      '/placeholder-circuit.jpg'
  );

  let priceDetails = null;
  if (!isDirectFlow) {
    const wantCar = !!(filters?.withCar ?? item?.withCar ?? item?.transport?.withCar);
    const { carType, total, wantCar: usingCar } = computeInclusivePrice(
      item,
      normalizeCarType(filters?.carType),
      wantCar
    );

    const tags =
      Array.isArray(item.experienceTags) && item.experienceTags.length
        ? item.experienceTags
        : Array.isArray(filters?.placeTags)
        ? filters.placeTags
        : [];

    const experiences =
      Array.isArray(item.experiences) && item.experiences.length
        ? item.experiences
        : Array.isArray(filters?.experiences)
        ? filters.experiences
        : [];

    priceDetails = (
      <>
        <div className="railWrap" aria-label="Matched preferences">
          <div className="rail">
            {usingCar ? (
              <span className="chip">Car: {carType || '—'}</span>
            ) : (
              <span className="chip">No car</span>
            )}
            {tags?.slice(0, 4).map((t) => (
              <span className="chip" key={`tag-${t}`}>
                {t}
              </span>
            ))}
            {experiences?.slice(0, 4).map((e) => (
              <span className="chip" key={`exp-${e}`}>
                {e}
              </span>
            ))}
          </div>
        </div>

        <div className="priceStrip">
          <div className="note">
            Price includes stay{usingCar ? ' + transport' : ''}.<br />
            Taxes/fees may vary by dates.
          </div>
          <div className="right">
            <div className="pp">{inr(total)}</div>
            <div className="total">Total price</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <article className="res-card">
      <div className="res-media">
        <img
          src={img}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-circuit.jpg';
          }}
        />
        {circuit?.name ? (
          <span className="media-badge">
            <span className="label">Circuit:</span> {circuitName}
          </span>
        ) : null}
      </div>

      <div className="res-body">
        <h3 className="res-title">{title}</h3>

        {isDirectFlow ? (
          <div className="customize-section">
            <p>Select your trip details to view price:</p>
            <button className="btn-secondary" onClick={() => onCustomize(item)}>
              Customize Trip
            </button>
          </div>
        ) : (
          priceDetails
        )}

        <div className="card-actions">
          <button className="btn-primary" onClick={onOpen}>
            View / Book
          </button>
        </div>
      </div>
    </article>
  );
}

/* ===================== main page ===================== */

export default function ItineraryResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const itineraries = Array.isArray(location.state?.itineraries)
    ? location.state.itineraries
    : [];

  const filters = location.state?.filters || {};
  const booking = location.state?.booking || null;
  const itinerary = location.state?.itinerary || null;

  const isDirectFlow = !filters || Object.keys(filters).length === 0;

  /* ---------- CASE 1: Confirmation Page ---------- */
  if (booking && itinerary) {
    const price = computeInclusivePrice(
      itinerary,
      normalizeCarType(booking.vehicleType),
      booking.vehicleNeeded
    );

    return (
      <section className="result-stage">
        <div className="result-inner">
          <header className="result-header">
            <h2 className="stage-title">Booking Confirmation</h2>
            <button className="btn-ghost" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </header>

          <div className="confirmation-details">
            <h3>{itinerary.title}</h3>
            <p>
              <strong>Dates:</strong> {booking.startDate} → {booking.endDate}
            </p>
            <p>
              <strong>Pax:</strong> {booking.pax}
            </p>
            <p>
              <strong>Rooms:</strong> {booking.rooms}
            </p>
            <p>
              <strong>Vehicle:</strong>{' '}
              {booking.vehicleNeeded ? booking.vehicleType : 'No vehicle'}
            </p>

            <h4>Day-wise Plan</h4>
            <ul>
              {itinerary.dayWisePlan.map((d, idx) => (
                <li key={d._id || idx}>
                  <strong>Day {d.day}:</strong> {d.title} — {d.description}
                </li>
              ))}
            </ul>

            <div className="price-summary">
              <p>
                <strong>Total Distance:</strong> {price.totalKm} km
              </p>
              <p>
                <strong>Car Type:</strong> {price.carType}
              </p>
              <p>
                <strong>Total Cost:</strong> {inr(price.total)}
              </p>
              <p>
                <strong>Per Person:</strong> {inr(price.perPerson)}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ---------- CASE 2: Result Cards Page ---------- */
  if (itineraries.length === 0) {
    return (
      <section className="result-stage">
        <div className="result-inner">
          <header className="result-header">
            <h2 className="stage-title">Matching Trip Itineraries</h2>
          </header>

          <p className="stage-note">
            No matching itineraries found. Please plan your trip again.
          </p>

          <div className="result-actions">
            <button className="btn-ghost" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  const handleCustomize = (itinerary) => {
    navigate('/plan-direct', { state: { itinerary } });
  };

  return (
    <section className="result-stage">
      <div className="result-inner">
        <header className="result-header">
          <h2 className="stage-title">Matching Trip Itineraries</h2>
          <button className="btn-ghost" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </header>

        <div className="card-grid">
          {itineraries.map((it, idx) => (
            <ResultItemCard
              key={it._id || it?.circuitId?._id || `it-${idx}`}
              item={it}
              filters={filters}
              isDirectFlow={isDirectFlow}
              onCustomize={handleCustomize}
              onOpen={() =>
                navigate('/itinerary/confirm', { state: { itinerary: it, filters } })
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
