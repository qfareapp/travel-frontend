import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ItineraryConfirmPage.css';
import { API_BASE } from "../config";

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

/** Detailed price calc with breakdown */
/** Detailed price calc with breakdown */
function computePriceDetailed(itinerary = {}, filters = {}, userCarType, wantCar, selectedAddons = []) {
  const circuit = itinerary.circuitId || {};
  const pax = n(filters.pax ?? itinerary.pax ?? itinerary.paxMin ?? itinerary.paxMax ?? 1, 1);

  const days = filters.startDate && filters.endDate
    ? Math.max(
        1,
        Math.ceil((new Date(filters.endDate) - new Date(filters.startDate)) / (1000 * 60 * 60 * 24)) + 1
      )
    : n(itinerary.days ?? itinerary.durationDays, 1);

  const basePlan = Array.isArray(itinerary.dayWisePlan) ? itinerary.dayWisePlan : [];

  // ✅ Use user-selected addons (instead of auto slice)
  const addonPlan = Array.isArray(selectedAddons) ? selectedAddons : [];

  const fullPlan = [...basePlan, ...addonPlan];

  // ✅ Base stay cost
  const baseStay = basePlan.reduce((s, d) => {
    const hs = d?.stayAtHomestayId || {};
    const unit = n(hs.price);
    return unit > 0 ? s + unit * pax : s;
  }, 0);

  // ✅ Addon stay cost
  const addonStay = addonPlan.reduce((s, d) => {
    const hs = d?.stayAtHomestayId || {};
    const unit = n(hs.price);
    return unit > 0 ? s + unit * pax : s;
  }, 0);

  const stayTotal = baseStay + addonStay;

  // ✅ Distances
  const baseKm = basePlan.reduce((s, d) => s + n(d?.travelDistanceKm), 0);
  const addonKm = addonPlan.reduce((s, d) => s + n(d?.travelDistanceKm), 0);
  const totalKm = baseKm + addonKm;

  let carType = '—';
  let baseCar = 0, addonCar = 0;
  if (wantCar) {
    const preferredType = normalizeCarType(
      filters.carType || userCarType || itinerary.transport?.carType || itinerary.carType || ''
    );
    const chosen = pickRateStrict(circuit, preferredType);
    carType = chosen.type || '—';
    baseCar = n(chosen.rate) * n(baseKm);
    addonCar = n(chosen.rate) * n(addonKm);
  }

  const total = stayTotal + baseCar + addonCar;
  const perPerson = pax ? total / pax : total;

  return {
    pax,
    days,
    carType,
    baseStay,
    addonStay,
    stayTotal,
    baseCar,
    addonCar,
    carTotal: baseCar + addonCar,
    totalKm,
    baseKm,
    addonKm,
    total,
    perPerson,
    wantCar: !!wantCar,
    extraDays: addonPlan.length,
  };
}


/* ===================== small UI bits ===================== */

function Chip({ children }) {
  if (!children) return null;
  return <span className="chip">{children}</span>;
}

function StarDisplay({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  const empties = 5 - full - (half ? 1 : 0);
  return (
    <div className="stars" aria-label={`Rating ${v} out of 5`}>
      {'★'.repeat(full)}
      {half ? '☆' : ''}
      {'✩'.repeat(empties)}
      <span className="stars-num">{v ? v.toFixed(1) : 'New'}</span>
    </div>
  );
}

function StarInput({ value, onChange }) {
  return (
    <div className="star-input">
      {[1,2,3,4,5].map((r) => (
        <button
          key={r}
          type="button"
          className={r <= value ? 'on' : ''}
          onClick={() => onChange(r)}
          aria-label={`Rate ${r} star${r>1?'s':''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/** Simple gallery without external libs */
function ImageGallery({ images = [] }) {
  const valid = images.filter(Boolean);
  const [idx, setIdx] = useState(0);
  const current = valid[idx] || '/placeholder-circuit.jpg';
  const onPrev = () => setIdx((p) => (p - 1 + valid.length) % valid.length);
  const onNext = () => setIdx((p) => (p + 1) % valid.length);

  if (!valid.length) return null;

  return (
    <div className="gallery">
      <div className="gallery-main">
        <img src={toUrl(current)} alt={`Image ${idx+1}`} onError={(e)=>{e.currentTarget.src='/placeholder-circuit.jpg';}} />
        {valid.length > 1 && (
          <>
            <button className="g-nav left" onClick={onPrev} aria-label="Previous image">‹</button>
            <button className="g-nav right" onClick={onNext} aria-label="Next image">›</button>
          </>
        )}
      </div>
      {valid.length > 1 && (
        <div className="gallery-thumbs">
          {valid.map((im, i) => (
            <button
              key={`${im}-${i}`}
              className={`thumb ${i===idx ? 'active' : ''}`}
              onClick={() => setIdx(i)}
              aria-label={`Show image ${i+1}`}
            >
              <img src={toUrl(im)} alt={`Thumbnail ${i+1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===================== main page ===================== */

export default function ItineraryConfirmPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const itinerary = state?.itinerary || {};
  const filters = state?.filters || {};

  const [selectedAddons, setSelectedAddons] = useState([]);

  // derive
   // derive
  const circuit = itinerary.circuitId || {};
  const wantCar = !!(
    filters?.withCar ??
    state?.booking?.vehicleNeeded ??
    itinerary?.withCar ??
    itinerary?.transport?.withCar
  );
  const userCarType = normalizeCarType(
    filters?.carType ||
      state?.booking?.vehicleType ||
      itinerary?.carType ||
      itinerary?.transport?.carType
  );

  const price = useMemo(() => {
    return computePriceDetailed(
      itinerary,
      filters,
      userCarType,
      wantCar,
      selectedAddons
    );
  }, [itinerary, filters, userCarType, wantCar, selectedAddons]);

  const tags =
    Array.isArray(itinerary.experienceTags) && itinerary.experienceTags.length
      ? itinerary.experienceTags
      : Array.isArray(filters?.placeTags)
      ? filters.placeTags
      : [];

  const experiences =
    Array.isArray(itinerary.experiences) && itinerary.experiences.length
      ? itinerary.experiences
      : Array.isArray(filters?.experiences)
      ? filters.experiences
      : [];

  const dayPlan = Array.isArray(itinerary.dayWisePlan)
    ? itinerary.dayWisePlan
    : [];

    // ✅ Adjust plan: if user selects more days, push Return to end
  const adjustedDayPlan = useMemo(() => {
    if (!dayPlan.length) return [];

    const totalDays = price.days;
    const presetDays = dayPlan.length;

    // detect if last day is a return day
    const lastDay = dayPlan[presetDays - 1];
    const isReturnDay = lastDay?.title?.toLowerCase().includes("return");

    if (totalDays > presetDays && isReturnDay) {
      const withoutReturn = dayPlan.slice(0, -1);
      const needed = totalDays - presetDays;
      const extras = (itinerary.addonSuggestions || []).slice(0, needed);

      return [
        ...withoutReturn,
        ...extras.map((ex) => ({ ...ex, addon: true })),
        { ...lastDay, title: `Day ${totalDays}: Return` },
      ];
    }

    return dayPlan;
  }, [dayPlan, itinerary, price.days]);

  // build gallery (all possible images: itinerary, circuit, homestays used in plan)
  const galleryImages = useMemo(() => {
    const seen = new Set();
    const add = (x) => { if (!x) return; const u = toUrl(x); if (!seen.has(u)) seen.add(u); };
    add(itinerary.image);
    add(circuit.image);
    if (Array.isArray(itinerary.homestay?.images)) itinerary.homestay.images.forEach(add);
    dayPlan.forEach((d) => {
      const hs = d?.stayAtHomestayId;
      if (hs?.image) add(hs.image);
      if (Array.isArray(hs?.images)) hs.images.forEach(add);
      if (Array.isArray(d?.images)) d.images.forEach(add);
    });
    return Array.from(seen);
  }, [itinerary, circuit, dayPlan]);

  // ratings / reviews (front-end only; wire to backend when ready)
  const initialReviews = Array.isArray(itinerary.reviews) ? itinerary.reviews : [];
  const [reviews, setReviews] = useState(initialReviews);
  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((s, r) => s + n(r.rating), 0);
    return sum / reviews.length;
  }, [reviews]);

  const [formName, setFormName] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState('');

  const submitReview = (e) => {
    e.preventDefault();
    const r = {
      name: formName?.trim() || 'Guest',
      rating: n(formRating, 5),
      comment: formText?.trim() || '',
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [r, ...prev]);
    setFormName('');
    setFormRating(5);
    setFormText('');
    // When backend is ready:
    // await axios.post(`${API_BASE}/api/itinerary/${itinerary._id}/reviews`, r)
  };

  if (!itinerary || !itinerary._id) {
    return (
      <div className="detail-page container">
        <div className="empty">
          No itinerary selected.
          <button className="btn-ghost" onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    );
  }

  const title = itinerary.title || circuit?.name || 'Trip Itinerary';

  return (
    <div className="detail-page container">
      {/* Header */}
      <header className="detail-header">
        <div className="dh-left">
          <h1 className="detail-title">{title}</h1>
          <div className="subline">
            {circuit?.name ? <Chip> Circuit: {circuit.name} </Chip> : null}
            {price.wantCar ? <Chip>Car: {price.carType || '—'}</Chip> : <Chip>No car</Chip>}
            {Array.isArray(circuit?.categories) && circuit.categories.slice(0,3).map((c) => (
              <Chip key={`cat-${c}`}>{c}</Chip>
            ))}
            {tags.slice(0,3).map((t) => <Chip key={`tag-${t}`}>{t}</Chip>)}
            {experiences.slice(0,3).map((e) => <Chip key={`exp-${e}`}>{e}</Chip>)}
          </div>
          <StarDisplay value={avgRating} />
        </div>
        <div className="dh-right">
          <div className="price-box">
            <div className="label">Total</div>
            <div className="value">{inr(price.total)}</div>
            <div className="meta">{price.pax} travellers · {price.days} {price.days>1?'nights':'night'}</div>
            <button
              className="btn-primary w100"
              onClick={() => navigate('/booking/checkout', {
                state: { itineraryId: itinerary._id, price, selectedCarType: price.carType, withCar: price.wantCar }
              })}
            >
              Proceed to Booking
            </button>
            <div className="tiny-note">Prices include stay{price.wantCar ? ' + transport' : ''}. Taxes/fees may vary by date.</div>
          </div>
        </div>
      </header>

      {/* Gallery */}
      <ImageGallery images={galleryImages} />

      <div className="detail-grid">
        {/* Left column */}
        <div className="col-main">

          
          {/* About circuit / trip */}
          <section className="card">
            <h2>About this trip</h2>
            {circuit?.description ? <p className="muted">{circuit.description}</p> : null}
            <div className="info-grid">
              <div>
                <div className="k">Best seasons</div>
                <div className="v">{Array.isArray(circuit.bestSeasons) && circuit.bestSeasons.length ? circuit.bestSeasons.join(', ') : '—'}</div>
              </div>
              <div>
                <div className="k">Entry points</div>
                <div className="v">{Array.isArray(circuit.entryPoints) && circuit.entryPoints.length ? circuit.entryPoints.join(', ') : '—'}</div>
              </div>
              <div>
                <div className="k">Transport options</div>
                <div className="v">{Array.isArray(circuit.transport) && circuit.transport.length ? circuit.transport.join(', ') : '—'}</div>
              </div>
            </div>
          </section>

          
<section className="card">
  <h2>Day-by-Day Plan</h2>
  {adjustedDayPlan.length === 0 ? (
    <p className="muted">
      Detailed day plan will be shared after booking confirmation.
    </p>
  ) : (
    <ol className="days">
      {adjustedDayPlan.map((d, i) => {
        const hs = d?.stayAtHomestayId;
        const hsImg =
          (Array.isArray(hs?.images) && hs.images[0]) || hs?.image;
        const acts = Array.isArray(d?.activities)
          ? d.activities
          : Array.isArray(d?.experiences)
          ? d.experiences
          : [];

        return (
          <li
            key={`day-${i}`}
            className={`day ${d.addon ? "addon-day" : ""} ${
              d?.title?.toLowerCase().includes("return") ? "return-day" : ""
            }`}
          >
            <div className="day-head">
              <div className="dnum">Day {i + 1}</div>
              <div className="dtitle">
                {d?.title || "Planned sightseeing & local experiences"}
              </div>
            </div>

            {d?.description ? (
              <p className="day-desc">{d.description}</p>
            ) : null}

            <div className="day-meta">
              <Chip>
                {n(d?.travelDistanceKm)
                  ? `${n(d.travelDistanceKm)} km`
                  : null}
              </Chip>
              {d?.travelTime ? <Chip>{d.travelTime}</Chip> : null}
              {(acts || []).slice(0, 5).map((a, idx) => (
                <Chip key={`act-${i}-${idx}`}>{a}</Chip>
              ))}
            </div>

            {/* Stay */}
            {hs ? (
              <div className={`stay-card ${d.addon ? "addon-stay" : ""}`}>
                <div className="s-img">
                  <img
                    src={toUrl(hsImg)}
                    alt={hs?.homestayName || hs?.name || "Homestay"}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-circuit.jpg";
                    }}
                  />
                  {/* ✅ Badge for suggested addon days */}
                  {d.addon && <span className="badge">Suggested Day</span>}
                </div>
                <div className="s-body">
                  <div className="s-title">
                    {hs?.homestayName || hs?.name || "Homestay"}
                  </div>
                  <div className="s-meta">
                    {hs?.location ? <span>{hs.location}</span> : null}
                    {n(hs?.distance) ? (
                      <span> · {hs.distance} km from entry</span>
                    ) : null}
                  </div>
                  <div className="s-price">
                    {n(hs?.price) ? `${inr(hs.price)} / person` : "Price NA"}
                  </div>
                  {Array.isArray(hs?.addons) && hs.addons.length ? (
                    <div className="s-addons">
                      {hs.addons.slice(0, 6).map((ad, j) => (
                        <Chip key={`ad-${i}-${j}`}>{ad}</Chip>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  )}
</section>

          <section className="card">
  <h2>Your Local Guide</h2>
  {itinerary?.localGuide ? (
    <div
  className="guide-card link"
  onClick={() =>
    navigate(`/guides/${itinerary.localGuide._id || "embedded"}`, {
      state: { guide: itinerary.localGuide },
    })
  }
>
      <div className="g-img">
        <img
          src={toUrl(itinerary.localGuide.image)}
          alt={itinerary.localGuide.name || "Local guide"}
          onError={(e) => { e.currentTarget.src = "/placeholder-circuit.jpg"; }}
        />
      </div>
      <div className="g-body">
        <div className="g-name">{itinerary.localGuide.name || "Local Expert"}</div>
        <div className="g-loc">{itinerary.localGuide.location || "—"}</div>
        {itinerary.localGuide.bio ? (
          <p className="g-bio">{itinerary.localGuide.bio}</p>
        ) : null}
        <div className="g-note">
          Click to view full profile. Contact details are shared after booking is confirmed.
        </div>
      </div>
    </div>
  ) : (
    <p className="muted">A verified local guide will be assigned for this trip.</p>
  )}
</section>


          {/* Reviews */}
          <section className="card">
            <h2>Ratings & Reviews</h2>

            {reviews.length === 0 ? (
              <p className="muted">No reviews yet. Be the first to share your experience.</p>
            ) : (
              <ul className="review-list">
                {reviews.map((r, i) => (
                  <li key={`rev-${i}`} className="review">
                    <div className="rv-head">
                      <div className="rv-name">{r.name || 'Guest'}</div>
                      <StarDisplay value={n(r.rating)} />
                    </div>
                    {r.comment ? <p className="rv-text">{r.comment}</p> : null}
                    {r.createdAt ? <div className="rv-date">{new Date(r.createdAt).toLocaleDateString()}</div> : null}
                  </li>
                ))}
              </ul>
            )}

            <form className="review-form" onSubmit={submitReview}>
              <div className="rf-row">
                <label>Name</label>
                <input value={formName} onChange={(e)=>setFormName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="rf-row">
                <label>Rating</label>
                <StarInput value={formRating} onChange={setFormRating} />
              </div>
              <div className="rf-row">
                <label>Comment</label>
                <textarea value={formText} onChange={(e)=>setFormText(e.target.value)} rows={4} placeholder="Share details of your experience..." />
              </div>
              <div className="rf-actions">
                <button type="submit" className="btn-primary">Submit Review</button>
              </div>
            </form>
          </section>
        </div>

        {/* Right column: price breakdown */}
        <aside className="col-side">
  <section className="card sticky">
    <h3>Price Breakdown</h3>

    <div className="pb-row">
      <span>Travellers</span>
      <span>{price.pax}</span>
    </div>
    <div className="pb-row">
      <span>Trip length</span>
      <span>{price.days} {price.days > 1 ? 'nights' : 'night'}</span>
    </div>

    {/* Stay costs */}
    <div className="pb-row">
      <span>Stay (Base Itinerary)</span>
      <span>{inr(price.baseStay)}</span>
    </div>
    {price.extraDays > 0 && (
      <div className="pb-row">
        <span>Stay (Addon Days {price.extraDays})</span>
        <span>{inr(price.addonStay)}</span>
      </div>
    )}

    {/* Transport costs */}
    <div className="pb-row">
      <span>Transport (Base)</span>
      <span>
        {price.wantCar
          ? `${inr(price.baseCar)} (${price.carType}, ${n(price.baseKm)} km)`
          : '—'}
      </span>
    </div>
    {price.extraDays > 0 && (
      <div className="pb-row">
        <span>Transport (Addon)</span>
        <span>
          {price.wantCar
            ? `${inr(price.addonCar)} (${price.carType}, ${n(price.addonKm)} km)`
            : '—'}
        </span>
      </div>
    )}

    <div className="pb-sep" />

    {/* Totals */}
    <div className="pb-row total">
      <span>Total</span>
      <span>{inr(price.total)}</span>
    </div>
    <div className="pb-row">
      <span>Per person</span>
      <span>{inr(price.perPerson)}</span>
    </div>

    <button
      className="btn-primary w100"
      onClick={() =>
        navigate('/booking/checkout', {
          state: {
            itineraryId: itinerary._id,
            price,
            selectedCarType: price.carType,
            withCar: price.wantCar,
          },
        })
      }
    >
      Proceed to Booking
    </button>
    <div className="tiny-note">
      Exact price can vary by dates, room configuration, and taxes.
    </div>
  </section>

          {/* Quick circuit meta */}
          <section className="card">
            <h3>Quick Facts</h3>
            <ul className="qf">
              <li><strong>Circuit:</strong> {circuit?.name || '—'}</li>
              <li><strong>Categories:</strong> {Array.isArray(circuit?.categories) && circuit.categories.length ? circuit.categories.join(', ') : '—'}</li>
              <li><strong>Experiences:</strong> {experiences.length ? experiences.join(', ') : '—'}</li>
              <li><strong>Entry points:</strong> {Array.isArray(circuit?.entryPoints) && circuit.entryPoints.length ? circuit.entryPoints.join(', ') : '—'}</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
