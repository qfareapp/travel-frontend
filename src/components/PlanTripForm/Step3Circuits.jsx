// Step3Circuits.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

/* ===================== THEME CSS (injected once) ===================== */
const CSS_ID = 'step3-circuits-rail-css';
const CSS_TEXT = `
:root{
  --brand1:#f97316; /* orange-500 */
  --brand2:#ec4899; /* pink-500 */
  --ink-900:#0f172a; --ink-700:#334155; --ink-500:#64748b;
  --line:#e5e7eb; --card:#ffffff;
  --radius-card:20px; --radius-pill:999px; --radius-item:18px;
}

/* Card shell like Step2 */
.step3-card{
  width:100%;
  max-width: 1100px;
  margin: 0 auto;
  background: color-mix(in srgb, var(--card), transparent 0%);
  backdrop-filter: blur(6px);
  border:1px solid var(--line);
  border-radius: var(--radius-card);
  box-shadow: 0 14px 36px rgba(2,6,23,.12);
  padding: 28px;
}

/* Step line & title */
.step3-indicator{ display:flex; align-items:center; gap:8px; color:var(--ink-500); font-weight:600; font-size:12px; }
.step3-indicator .dot{ width:8px; height:8px; border-radius:999px; background:#000; }
.step3-title{ margin: 6px 0 10px; font-size: 26px; font-weight: 800; color: var(--ink-900); }

/* -------- SINGLE-LINE CIRCUIT RAIL -------- */
.railWrap{ position: relative; margin-top: 8px; }
.rail{
  display:flex; flex-wrap: nowrap; align-items:stretch;
  overflow-x:auto; overflow-y:hidden; gap:16px; padding: 10px 12px;
  scroll-snap-type:x proximity; -webkit-overflow-scrolling:touch;
}
.rail::-webkit-scrollbar{ height:8px } .rail::-webkit-scrollbar-thumb{ background:#e5e7eb; border-radius:8px }

/* side fades */
.railWrap::before, .railWrap::after{
  content:""; position:absolute; top:0; bottom:0; width:60px; pointer-events:none;
}
.railWrap::before{ left:-1px; background:linear-gradient(90deg,#fff 25%,transparent) }
.railWrap::after{ right:-1px; background:linear-gradient(270deg,#fff 25%,transparent) }

/* item (button) */
.item{
  scroll-snap-align:start;
  min-width: 300px; max-width: 340px; width: 32vw;
  border-radius: var(--radius-item);
  border:1px solid #d1d5db; background:#fff;
  box-shadow: 0 6px 18px rgba(15,23,42,.08);
  display:flex; flex-direction:column; overflow:hidden; text-align:left; cursor:pointer;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.item:hover{ transform: translateY(-3px); box-shadow: 0 14px 28px rgba(15,23,42,.16); }

/* gradient selection ring */
.item.isSelected{
  border-color: transparent;
  background:
    linear-gradient(#fff,#fff) padding-box,
    linear-gradient(135deg, var(--brand1), var(--brand2)) border-box;
  border: 2px solid transparent;
  box-shadow: 0 16px 34px rgba(236,72,153,.28);
}

/* image */
.imgWrap{ position:relative; aspect-ratio: 16 / 10; overflow:hidden; background:#f3f4f6; }
.imgWrap img{ width:100%; height:100%; object-fit:cover; transform: scale(1.02); transition: transform .5s ease; display:block; }
.item:hover .imgWrap img{ transform: scale(1.06); }

/* check badge on selected */
.badge{
  position:absolute; top:10px; right:10px; z-index:2;
  padding:6px 10px; border-radius:999px; color:#fff; font-weight:800; font-size:12px;
  background:linear-gradient(90deg,var(--brand1),var(--brand2));
  box-shadow: 0 8px 18px rgba(236,72,153,.35); display:none;
}
.item.isSelected .badge{ display:inline-flex; }

/* body */
.body{ padding: 14px; display:flex; flex-direction:column; gap:6px; }
.title{ font-size: 16px; font-weight: 800; color: var(--ink-900); line-height:1.2; }
.desc{ font-size: 13px; color: var(--ink-500); display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }

/* states */
.empty{ color: var(--ink-500); font-style: italic; text-align:center; margin-top: 8px; }

/* nav buttons – same theme as Step2 */
.navRow{ display:flex; justify-content:space-between; gap:12px; margin-top: 22px; }
.btn{ border:0; border-radius:12px; padding:10px 18px; font-weight:700; cursor:pointer; transition: transform .15s ease, box-shadow .15s ease, filter .15s ease; }
.btn-ghost{ background:#eef1f6; color:#111827; border:1px solid #e6e8ef; }
.btn-ghost:hover{ filter:saturate(1.04); box-shadow:0 6px 16px rgba(15,23,42,.12); }
.btn-primary{ color:#fff; background:linear-gradient(90deg,var(--brand1),var(--brand2)); box-shadow:0 10px 22px rgba(236,72,153,.28);}
.btn-primary:hover{ transform:translateY(-1px); box-shadow:0 16px 30px rgba(236,72,153,.35); }

/* small screens: items still single-line but narrower */
@media (max-width: 520px){
  .item{ min-width: 260px; width: 80vw; }
}
`;

/* Inject CSS once */
function useInjectCSS(){
  useEffect(() => {
    if (document.getElementById(CSS_ID)) return;
    if (typeof CSS_TEXT !== 'string') return;
    const s = document.createElement('style');
    s.id = CSS_ID; s.textContent = CSS_TEXT;
    document.head.appendChild(s);
  }, []);
}

/* ===================== UTILITIES ===================== */
/* Build absolute URLs for images coming from the API */
const API_BASE =
  (import.meta?.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  'http://localhost:5000';

const toUrl = (p) => {
  if (!p) return '/placeholder-circuit.jpg';

  // if backend sent an object like { url: "...", path: "..." }
  if (typeof p === 'object' && p !== null) p = p.url || p.path || p.src || p.href || '';

  if (!p) return '/placeholder-circuit.jpg';
  if (/^https?:\/\//i.test(p)) return p; // already absolute

  // normalize: strip leading "./", fix Windows backslashes, ensure single slash
  const clean = String(p).replace(/^\.?\//, '').replace(/\\/g, '/');
  const base = API_BASE.replace(/\/+$/, '');
  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return `${base}${path}`;
};

/* ===================== COMPONENT ===================== */
const Step3Circuits = ({ formData, updateData, nextStep, prevStep }) => {
  useInjectCSS();

  const [filteredCircuits, setFilteredCircuits] = useState([]);
  const [selectedCircuitId, setSelectedCircuitId] = useState(formData?.selectedCircuitId || '');
  const [selectedCircuitName, setSelectedCircuitName] = useState(formData?.selectedCircuitName || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* Fetch matching circuits when categories change */
  useEffect(() => {
    const ac = new AbortController();

    const fetchMatchingCircuits = async () => {
      try {
        setLoading(true);

        const normalizedCategories = (formData?.placeTags || [])
          .map((c) => (c ?? ''))
          .map((c) => String(c).trim().toLowerCase().replace(/\s+/g, '_'));

        const res = await axios.post(
          `${API_BASE}/api/circuits/match`,
          { categories: normalizedCategories },
          { signal: ac.signal }
        );

        const data = res?.data;
        const circuits = Array.isArray(data) ? data : (data?.data || []);

        setFilteredCircuits(Array.isArray(circuits) ? circuits : []);

        // if current selection is no longer present, clear it
        if (selectedCircuitId && !circuits.find((c) => c?._id === selectedCircuitId)) {
          setSelectedCircuitId('');
          setSelectedCircuitName('');
        }
      } catch (err) {
        if (!ac.signal.aborted) {
          console.error('Failed to fetch matching circuits:', err);
          setFilteredCircuits([]);
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    };

    if (formData?.placeTags?.length) {
      fetchMatchingCircuits();
    } else {
      setFilteredCircuits([]);
      setSelectedCircuitId('');
      setSelectedCircuitName('');
    }

    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.placeTags]);

  const handleSelect = (circuit) => {
    setSelectedCircuitId(circuit?._id || '');
    setSelectedCircuitName(circuit?.name || '');
    setError('');
  };

  const handleNext = () => {
    if (!selectedCircuitId) {
      setError('Please select a circuit to continue.');
      return;
    }
    updateData?.('selectedCircuitId', selectedCircuitId);
    updateData?.('selectedCircuitName', selectedCircuitName);
    nextStep?.();
  };

  return (
    <motion.div
      className="step3-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="step3-indicator">
        <span className="dot" />
        <span>Step 3 of 7: Select Circuit</span>
      </div>

      <h2 className="step3-title">Choose a matching travel circuit</h2>

      {loading && <p className="empty">Loading circuits…</p>}

      <div className="railWrap">
        <div className="rail" role="listbox" aria-label="Available circuits">
          {(Array.isArray(filteredCircuits) ? filteredCircuits : []).map((circuit, idx) => {
            const key = circuit?._id || circuit?.id || `${circuit?.name || 'circuit'}-${idx}`;
            const isSelected = !!(selectedCircuitId && circuit?._id && selectedCircuitId === circuit._id);

            // robust image source: image, images[0], coverImage, etc.
            const rawImg =
              circuit?.image ||
              (Array.isArray(circuit?.images) && circuit.images[0]) ||
              circuit?.coverImage ||
              circuit?.img ||
              '';

            const img = toUrl(rawImg);

            return (
              <button
                type="button"
                key={key}
                onClick={() => handleSelect(circuit)}
                className={`item${isSelected ? ' isSelected' : ''}`}
                role="option"
                aria-pressed={isSelected}
                aria-selected={isSelected}
                title={circuit?.name || 'Circuit'}
              >
                <div className="imgWrap">
                  <img
                    src={img}
                    alt={circuit?.name || 'Circuit image'}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = '/placeholder-circuit.jpg'; }}
                  />
                  <span className="badge">Selected</span>
                </div>
                <div className="body">
                  <div className="title">{circuit?.name || 'Untitled circuit'}</div>
                  {circuit?.description ? (
                    <div className="desc">{circuit.description}</div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {!loading && filteredCircuits.length === 0 && (
        <p className="empty">No matching circuits found.</p>
      )}
      {error && (
        <p className="empty" style={{ color: '#b91c1c', fontStyle: 'normal' }}>
          {error}
        </p>
      )}

      <div className="navRow">
        <button onClick={prevStep} className="btn btn-ghost" type="button">← Back</button>
        <button onClick={handleNext} className="btn btn-primary" type="button">Next →</button>
      </div>
    </motion.div>
  );
};

export default Step3Circuits;
