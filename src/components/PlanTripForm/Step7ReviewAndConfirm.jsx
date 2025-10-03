import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CSS_ID = 'step7-mmt-card-css';
const CSS_TEXT = `
:root{
  --brand1:#f97316; --brand2:#ec4899;
  --ink-900:#0f172a; --ink-700:#334155; --ink-500:#64748b;
  --line:#e5e7eb; --card:#ffffff; --note:#f9fafb;
  --r-back:32px; --r-card:18px; --r-pill:999px;
  --stage-pad: clamp(16px, 3vw, 32px);
}

/* Background */
.backBox{ width:min(92vw,1180px); margin:0 auto; border-radius:var(--r-back);
  background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(255,255,255,.88));
  border:1px solid #edf0f6; box-shadow:0 26px 60px rgba(15,23,42,.16);
  padding:var(--stage-pad); overflow:hidden; }
.backInner{ min-height:clamp(420px,52vh,640px); display:grid; align-items:start; justify-items:center; }
@media (min-width:960px){ .backInner{ aspect-ratio:16/7; } }

/* Card */
.step7-card{ position:relative; box-sizing:border-box; width:min(100%,980px);
  background:#fff; border:1px solid var(--line); border-radius:var(--r-card);
  box-shadow:0 12px 26px rgba(2,6,23,.10); padding:18px 18px 20px; }

/* NEW: content rail to match Step 2 (860px) */
.content{ width:min(100%,860px); margin-inline:auto; }

/* Pill */
.pillTop{ position:absolute; left:50%; transform:translateX(-50%); top:-14px;
  background:#ecf6ff; color:#0ea5e9; border-radius:var(--r-pill);
  padding:6px 14px; font-weight:700; font-size:12px; border:1px solid #cdeaff;
  box-shadow:0 8px 18px rgba(14,165,233,.18); }

/* Header */
.step7-indicator{ display:flex; align-items:center; gap:8px; color:var(--ink-500); font-weight:600; font-size:12px; }
.step7-indicator .dot{ width:8px; height:8px; border-radius:999px; background:#000; }
.step7-title{ margin:10px 0 4px; font-size:22px; font-weight:800; color:var(--ink-900); }
.hr{ margin:10px 0 14px; height:1px; background:#eef0f4; border:0; }

/* Bullets */
.bullets{ display:grid; grid-template-columns:1fr; gap:18px; color:var(--ink-700); font-size:14px; }
@media (min-width:760px){ .bullets{ grid-template-columns:1fr 1fr; } }
.bullets ul{ list-style:none; padding:0; margin:0; display:grid; gap:10px; }
.bullets li{ display:flex; align-items:flex-start; gap:10px; }
.dot{ width:6px; height:6px; border-radius:999px; background:#c9cdd7; margin-top:6px; flex:0 0 auto; }

/* Rails */
.railWrap{ position:relative; margin-top:10px; }
.rail{ display:flex; flex-wrap:nowrap; overflow-x:auto; gap:10px; padding:8px 4px; }
.rail::-webkit-scrollbar{ height:8px } .rail::-webkit-scrollbar-thumb{ background:#e5e7eb; border-radius:8px }
.chip{ display:inline-flex; align-items:center; gap:8px; white-space:nowrap; padding:8px 14px;
  font-weight:700; font-size:13px; border-radius:999px; background:#fff; color:#1f2937;
  border:1px solid #d1d5db; box-shadow:0 4px 12px rgba(15,23,42,.06); }
.chip.badge{ color:#fff; background:linear-gradient(90deg,var(--brand1),var(--brand2)); border:none; box-shadow:0 10px 22px rgba(236,72,153,.28); }

/* Price strip */
.priceStrip{ margin-top:16px; border:1px solid var(--line); background:#f7f9fb; border-radius:14px;
  padding:14px 16px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
.priceStrip .note{ color:#0f172a; font-size:12px; opacity:.8; }
.priceStrip .right{ text-align:right; }
.priceStrip .pp{ font-size:20px; font-weight:800; }
.priceStrip .pp small{ font-size:12px; font-weight:600; margin-left:4px; color:#334155; }
.priceStrip .total{ font-size:12px; color:#64748b; }

/* Slider */
.budgetBox{ margin-top:8px; }
.budgetLabel{ font-weight:800; color:var(--ink-900); margin-bottom:6px; }
.range{ -webkit-appearance:none; width:100%; height:10px; border-radius:999px; outline:none;
  background:linear-gradient(90deg,var(--brand1),var(--brand2)); }
.range::-webkit-slider-thumb{ -webkit-appearance:none; appearance:none; width:22px; height:22px; border-radius:50%;
  background:#fff; border:2px solid #fff; box-shadow:0 6px 16px rgba(236,72,153,.35); }

/* Buttons */
.navRow{ display:flex; justify-content:space-between; gap:12px; margin-top:18px; }
.btn{ border:0; border-radius:12px; padding:10px 18px; font-weight:700; cursor:pointer;
  transition:transform .15s, box-shadow .15s, filter .15s; }
.btn-ghost{ background:#eef1f6; color:#111827; }
.btn-ghost:hover{ filter:saturate(1.04); box-shadow:0 6px 16px rgba(15,23,42,.12); }
.btn-primary{ color:#fff; background:linear-gradient(90deg,var(--brand1),var(--brand2)); box-shadow:0 10px 22px rgba(236,72,153,.28); }
.btn-primary:hover{ transform:translateY(-1px); box-shadow:0 16px 30px rgba(236,72,153,.35); }

`;

function useInjectCSS(){
  useEffect(() => {
    if (document.getElementById(CSS_ID)) return;
    const s = document.createElement('style'); s.id = CSS_ID; s.textContent = CSS_TEXT;
    document.head.appendChild(s);
  }, []);
}

const budgetRanges = [
  '₹1–10k','₹10k–20k','₹20k–30k','₹30k–40k','₹40k–50k',
  '₹50k–60k','₹60k–70k','₹70k–80k','₹80k–90k','₹90k–1L',
  '₹1L–1.2L','₹1.2L–1.4L','₹1.4L–1.6L','₹1.6L–1.8L','₹1.8L–2L','₹2L+',
];

const Step7ReviewAndConfirm = ({ formData, updateData, prevStep }) => {
  useInjectCSS();
  const navigate = useNavigate();

  const initialIndex = budgetRanges.findIndex((l) => l === formData.budgetRange);
  const [budgetIndex, setBudgetIndex] = useState(initialIndex >= 0 ? initialIndex : 4);
  const [loading, setLoading] = useState(false);

  const handleSliderChange = (e) => setBudgetIndex(parseInt(e.target.value, 10));
  const calculateDays = (s,e) => Math.max(1, Math.ceil((new Date(e)-new Date(s))/(1000*60*60*24)) + 1);

  const parseBudgetToNumber = (range) => {
    if (!range) return 0;
    if (range.includes('+')) return 200000;
    const parts = range.replace(/[₹,]/g, '').split('–');
    const parseVal = (v) => (v.includes('L') ? parseFloat(v) * 100000 : parseInt(v, 10) * 1000);
    return Math.round(parseVal(parts[0]));
  };

  const handleSubmit = async () => {
  const circuitId = formData.selectedCircuitId || '';
  const circuitName = formData.selectedCircuitName || formData.selectedCircuit || '';
  if (!circuitId && !circuitName) {
    alert('Please select a circuit before generating an itinerary.');
    return;
  }

  const selectedBudget = budgetRanges[budgetIndex];
  updateData('budgetRange', selectedBudget);

  const payload = {
    circuitId,
    circuitName,
    pax: Number(formData.pax) || 1,
    days: calculateDays(formData.startDate, formData.endDate),
    tags: Array.isArray(formData.placeTags) ? formData.placeTags : [],
    experiences: Array.isArray(formData.experiences) ? formData.experiences : [],
    theme: formData.travelStyle,
    withCar: !!formData.withCar,
    carType: formData.carType || 'Hatchback',
    budget: parseBudgetToNumber(selectedBudget),
  };

  try {
    setLoading(true);
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '${API_BASE}';
    const res = await axios.post(`${API_BASE}/api/itineraries/match`, payload);
    const matched = res.data.matchedItineraries || [];
    navigate('/itinerary/result', { state: { itineraries: matched, filters: payload } });
  } catch (err) {
    console.error('❌ Itinerary generation failed:', err.response?.data || err.message);
    alert(err?.response?.data?.error || 'Failed to generate itinerary. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const circuitLabel = formData.selectedCircuitName || formData.selectedCircuit || '— not selected —';

  const leftBullets = [
    `Trip Dates: ${formData.startDate} → ${formData.endDate}`,
    `Circuit: ${circuitLabel}`,
    `Style: ${formData.travelStyle || '—'}`,
  ];
  const rightBullets = [
    `People: ${formData.pax}`,
    `Car Needed: ${formData.withCar ? 'Yes' : 'No'}`,
    `Budget: ${budgetRanges[budgetIndex]}`,
  ];

  return (
  <section>
    <motion.div
      className="step7-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="pillTop">Review Summary</div>

      <div className="content">
        <div className="step7-indicator">
          <span className="dot" />
          <span>Step 7 of 7: Review & Confirm</span>
        </div>

        <h2 className="step7-title">Confirm your selections</h2>
        <div className="hr" />

        <div className="bullets">
          <ul>{leftBullets.map((t, i) => (<li key={`l-${i}`}><span className="dot" /> <span>{t}</span></li>))}</ul>
          <ul>{rightBullets.map((t, i) => (<li key={`r-${i}`}><span className="dot" /> <span>{t}</span></li>))}</ul>
        </div>
      </div>

      {Array.isArray(formData.placeTags) && formData.placeTags.length > 0 && (
        <div className="content">
          <div className="railWrap" aria-label="Selected tags">
            <div className="rail">
              <span className="chip badge">Tags</span>
              {formData.placeTags.map((t) => <span key={t} className="chip">{t}</span>)}
            </div>
          </div>
        </div>
      )}

      {Array.isArray(formData.experiences) && formData.experiences.length > 0 && (
        <div className="content">
          <div className="railWrap" aria-label="Selected experiences">
            <div className="rail">
              <span className="chip badge">Experiences</span>
              {formData.experiences.map((e) => <span key={e} className="chip">{e}</span>)}
            </div>
          </div>
        </div>
      )}

      <div className="content">
        <div className="priceStrip">
          <div className="note">
            This price range is your current preference.<br />You can fine-tune it below.
          </div>
          <div className="right">
            <div className="pp">
              {budgetRanges[budgetIndex]} <small>/Person (est.)</small>
            </div>
            <div className="total">Days {calculateDays(formData.startDate, formData.endDate)}</div>
          </div>
        </div>

        <div className="budgetBox">
          <div className="budgetLabel">Adjust Budget Range</div>
          <input
            type="range"
            min="0"
            max={budgetRanges.length - 1}
            step="1"
            value={budgetIndex}
            onChange={e => setBudgetIndex(parseInt(e.target.value, 10))}
            className="range"
          />
        </div>

        <div className="navRow">
          <button onClick={prevStep} className="btn btn-ghost" type="button">← Back</button>
          <button onClick={handleSubmit} disabled={loading} className="btn btn-primary" type="button">
            {loading ? 'Generating…' : 'Generate Itinerary →'}
          </button>
        </div>
      </div>
    </motion.div>
  </section>
);
};

export default Step7ReviewAndConfirm;
