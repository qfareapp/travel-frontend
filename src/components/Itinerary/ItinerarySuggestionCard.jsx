import React from 'react';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  'http://localhost:5000';

const n = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const inr = (v) => `₹${n(v).toLocaleString('en-IN')}`;
const toUrl = (p) => {
  if (!p) return '/placeholder-circuit.jpg';
  if (/^https?:\/\//i.test(p)) return p;
  const clean = p.startsWith('/') ? p : `/${p}`;
  return `${API_BASE}${clean.replace(/\\/g, '/')}`;
};

function pickRate(circuit = {}, preferred) {
  const rates = {
    Hatchback: n(circuit.carPriceHatchback),
    Sedan: n(circuit.carPriceSedan),
    SUV: n(circuit.carPriceSUV),
  };
  if (preferred && rates[preferred] > 0) return { type: preferred, rate: rates[preferred], auto: false };
  const sorted = Object.entries(rates).filter(([, r]) => r > 0).sort((a, b) => a[1] - b[1]);
  if (sorted[0]) return { type: sorted[0][0], rate: sorted[0][1], auto: true };
  return { type: '', rate: 0, auto: false };
}

export default function ItinerarySuggestionCard({ itinerary, onSelect }) {
  const circuit = itinerary.circuitId || {};
  const days = n(itinerary.days ?? itinerary.durationDays, 1);
  const nights = Math.max(0, days - 1);
  const pax = n(itinerary.pax ?? itinerary.paxMin ?? itinerary.paxMax ?? 1, 1);

  // ----- costs -----
  const plan = Array.isArray(itinerary.dayWisePlan) ? itinerary.dayWisePlan : [];
  const stayCostFromPlan = plan.reduce(
    (s, d) => (d?.stayAtHomestayId ? s + n(d.stayAtHomestayId.price) * pax : s),
    0
  );
  const fallbackHs = itinerary.homestay || plan[0]?.stayAtHomestayId || {};
  const fallbackPP = n(fallbackHs.price);
  const totalStay = stayCostFromPlan > 0 ? stayCostFromPlan : fallbackPP * pax * days;

  const totalKm = plan.reduce((s, d) => s + n(d?.travelDistanceKm), 0);
  const chosen = pickRate(circuit, itinerary.transport?.carType || itinerary.carType);
  const totalCar = n(chosen.rate) * n(totalKm);

  const total = totalStay + totalCar;
  const perPerson = pax ? total / pax : total;

  // ----- display helpers -----
  const imgPath =
    itinerary.image ||
    circuit.image ||
    (Array.isArray(fallbackHs.images) && fallbackHs.images[0]) ||
    '/placeholder-circuit.jpg';

  const img = toUrl(imgPath);

  const activitiesCount = (() => {
    const fromPlan = plan
      .filter(d => Array.isArray(d?.activities) && d.activities.length)
      .flatMap(d => d.activities).length;
    return fromPlan || (Array.isArray(itinerary.experienceTags) ? itinerary.experienceTags.length : 0) || 0;
  })();

  const leftBullets = [
    `${fallbackHs.homestayName || fallbackHs.name || 'Homestay'}`,
    `${activitiesCount} Activities`,
  ];
  const rightBullets = [
    itinerary.transportIncluded ? 'Airport Pickup & Drop' : '—',
    fallbackPP ? 'Selected Meals' : '—',
  ];

  const freebies = Array.isArray(fallbackHs.addons) ? fallbackHs.addons.slice(0, 2) : [];

  // ----- organiser (no contact shown) -----
  const organiser = itinerary.localGuide || itinerary.organizer || {};
  const organiserImg = toUrl(organiser.image || '/organiser-placeholder.png');

  return (
    <div className="relative rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      {/* Top-center pill */}
      {itinerary.moreOptionsCount > 0 && (
        <div className="absolute left-1/2 -top-3 -translate-x-1/2 bg-sky-100 text-sky-700 text-xs px-3 py-1 rounded-full shadow">
          {itinerary.moreOptionsCount} More Option{itinerary.moreOptionsCount > 1 ? 's' : ''} Available
        </div>
      )}

      {/* Image */}
      <div className="relative">
        {itinerary.isFeatured && (
          <div className="absolute left-3 top-3 z-10 rounded-md px-2 py-1 text-xs font-semibold bg-fuchsia-600 text-white">
            Deal of the day
          </div>
        )}
        <img
          src={img}
          alt={circuit.name || itinerary.title || 'Itinerary image'}
          className="w-full h-48 sm:h-56 object-cover"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = '/placeholder-circuit.jpg'; }}
        />
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-lg sm:text-xl leading-snug line-clamp-1">
              {itinerary.title || 'Beautiful ' + (circuit.name || 'Trip')}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {nights}N {circuit.name || '—'}
            </p>
          </div>
          <div className="shrink-0 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-md px-2 py-1">
            {nights}N/{days}D
          </div>
        </div>

        <hr className="my-3 border-gray-200" />

        {/* Bullets two-column */}
        <div className="grid grid-cols-2 gap-6 text-sm text-gray-700">
          <ul className="space-y-2">
            {leftBullets.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" /> {b}
              </li>
            ))}
          </ul>
          <ul className="space-y-2">
            {rightBullets.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" /> {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Freebies */}
        {freebies.length > 0 && (
          <div className="mt-3 text-sm">
            {freebies.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-emerald-700">
                <span className="text-emerald-600">✓</span> {f}
              </div>
            ))}
          </div>
        )}

        {/* Price box */}
        <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
          <div className="text-[12px] text-gray-600 pr-4">
            {total < (itinerary.avgPriceLastMonth || 0)
              ? 'This price is lower than the average price last month'
              : 'Limited-time price'}
          </div>
          <div className="text-right">
            <div className="text-xl font-bold leading-5">
              {inr(perPerson)}<span className="text-sm font-medium"> /Person</span>
            </div>
            <div className="text-[12px] text-gray-500">Total Price {inr(total)}</div>
          </div>
        </div>

        {/* Organiser (no contact) */}
        {(organiser.name || organiser.image || organiser.location || organiser.bio) && (
          <div className="mt-4 flex items-start gap-3">
            <img
              src={organiserImg}
              alt={organiser.name || 'Trip organiser'}
              className="h-10 w-10 rounded-full object-cover border border-gray-200"
              onError={(e) => { e.currentTarget.src = '/organiser-placeholder.png'; }}
            />
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900">
                {organiser.name || 'Trip Organiser'}
                {organiser.location ? <span className="text-gray-500"> • {organiser.location}</span> : null}
              </div>
              {organiser.bio && (
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                  {organiser.bio}
                </p>
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onSelect}
          className="mt-4 w-full rounded-xl bg-black text-white py-2.5 font-medium hover:bg-gray-800 transition"
        >
          View / Book
        </button>

        {/* Footnote (rate) */}
        {chosen.rate > 0 && (
          <p className="mt-2 text-[11px] text-gray-500 text-right">
            {chosen.type}{chosen.auto ? ' (auto)' : ''} @ {inr(chosen.rate)}/km • {n(totalKm).toFixed(0)} km
          </p>
        )}
      </div>
    </div>
  );
}
