import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE } from "../../config";

const CSS_ID = 'step5-travel-style-rail-css';
const CSS_TEXT = `
:root{
  --brand1:#f97316; /* orange-500 */
  --brand2:#ec4899; /* pink-500 */
  --ink-900:#0f172a; --ink-700:#334155; --ink-500:#64748b;
  --line:#e5e7eb; --card:#ffffff;
  --radius-card:20px; --radius-item:18px;
}

/* Card shell (same family as Step2/3/4) */
.step5-card{
  width:100%;
  max-width:1100px;
  margin:0 auto;
  background: color-mix(in srgb, var(--card), transparent 0%);
  backdrop-filter: blur(6px);
  border:1px solid var(--line);
  border-radius: var(--radius-card);
  box-shadow: 0 14px 36px rgba(2,6,23,.12);
  padding:28px;
}

.step5-indicator{ display:flex; align-items:center; gap:8px; color:var(--ink-500); font-weight:600; font-size:12px; }
.step5-indicator .dot{ width:8px; height:8px; border-radius:999px; background:#000; }
.step5-title{ margin:8px 0 10px; font-size:26px; font-weight:800; color:var(--ink-900); }

/* -------- SINGLE-LINE THEME RAIL -------- */
.railWrap{ position:relative; margin-top:6px; }
.rail{
  display:flex; flex-wrap:nowrap; align-items:stretch;
  overflow-x:auto; overflow-y:hidden;
  gap:16px; padding:10px 12px;
  scroll-snap-type:x proximity; -webkit-overflow-scrolling:touch;
}
.rail::-webkit-scrollbar{ height:8px }
.rail::-webkit-scrollbar-thumb{ background:#e5e7eb; border-radius:8px }

/* side fades */
.railWrap::before, .railWrap::after{
  content:""; position:absolute; top:0; bottom:0; width:60px; pointer-events:none;
}
.railWrap::before{ left:-1px;  background:linear-gradient(90deg,#fff 25%,transparent) }
.railWrap::after{  right:-1px; background:linear-gradient(270deg,#fff 25%,transparent) }

/* theme card */
.themeItem{
  scroll-snap-align:start;
  min-width:300px; width:34vw; max-width:360px;
  border-radius: var(--radius-item);
  border:1px solid #d1d5db;
  background:#fff;
  box-shadow: 0 6px 18px rgba(15,23,42,.08);
  display:flex; flex-direction:column; justify-content:center;
  text-align:left; padding:16px 16px;
  cursor:pointer; user-select:none;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease, color .18s ease;
}
.themeItem:hover{ transform: translateY(-3px); box-shadow: 0 14px 28px rgba(15,23,42,.16); }

.themeHead{ font-size:16px; font-weight:800; color:var(--ink-900); margin-bottom:6px; }
.themeDesc{ font-size:13px; color:var(--ink-500); display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }

/* selected: gradient RING to keep text readable + badge */
.themeItem.isActive{
  border-color: transparent;
  background:
    linear-gradient(#fff,#fff) padding-box,
    linear-gradient(135deg, var(--brand1), var(--brand2)) border-box;
  border: 2px solid transparent;
  box-shadow: 0 16px 34px rgba(236,72,153,.28);
  position: relative;
}
.badge{
  position:absolute; top:10px; right:10px; z-index:2;
  padding:6px 10px; border-radius:999px; color:#fff; font-weight:800; font-size:12px;
  background:linear-gradient(90deg,var(--brand1),var(--brand2));
  box-shadow: 0 8px 18px rgba(236,72,153,.35); display:none;
}
.themeItem.isActive .badge{ display:inline-flex; }

/* nav buttons – same theme */
.navRow{ display:flex; justify-content:space-between; gap:12px; margin-top:22px; }
.btn{ border:0; border-radius:12px; padding:10px 18px; font-weight:700; cursor:pointer; transition: transform .15s ease, box-shadow .15s ease, filter .15s ease; }
.btn-ghost{ background:#eef1f6; color:#111827; }
.btn-ghost:hover{ filter:saturate(1.04); box-shadow:0 6px 16px rgba(15,23,42,.12); }
.btn-primary{ color:#fff; background:linear-gradient(90deg,var(--brand1),var(--brand2)); box-shadow:0 10px 22px rgba(236,72,153,.28); }
.btn-primary:hover{ transform:translateY(-1px); box-shadow:0 16px 30px rgba(236,72,153,.35); }

/* error */
.err{ color:#b91c1c; font-weight:700; font-size:14px; margin-top:6px; }

/* small screens: keep single line */
@media (max-width:520px){
  .themeItem{ min-width: 260px; width: 80vw; }
}
`;

function useInjectCSS(){
  useEffect(() => {
    if (document.getElementById(CSS_ID)) return;
    const s = document.createElement('style');
    s.id = CSS_ID; s.textContent = CSS_TEXT;
    document.head.appendChild(s);
  }, []);
}

const Step5TravelStyle = ({ formData, updateData, nextStep, prevStep }) => {
  useInjectCSS();

  const [selected, setSelected] = useState(formData.travelStyle || '');
  const [themes, setThemes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
  const fetchThemes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/circuits/themes`);
      console.log("Themes API response:", res.data);
      setThemes(Array.isArray(res.data) ? res.data : res.data.themes || []);
    } catch (err) {
      console.error("❌ Error fetching themes:", err.message);
      setThemes([]);
    }
  };
  fetchThemes();
}, []);

  const handleNext = () => {
    if (!selected) {
      setError('Please select a travel theme.');
      return;
    }
    setError('');
    updateData('travelStyle', selected);
    nextStep();
  };

  return (
    <motion.div
      className="step5-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="step5-indicator">
        <span className="dot" />
        <span>Step 5 of 7: Choose Travel Style</span>
      </div>

      <h2 className="step5-title">Pick a travel theme</h2>

      {/* SINGLE-LINE THEMES */}
      <div className="railWrap">
        <div className="rail" role="radiogroup" aria-label="Travel themes">
          {themes.map((t) => {
            const isActive = selected === t.value;
            return (
              <button
                key={t.value}
                type="button"
                className={`themeItem${isActive ? ' isActive' : ''}`}
                onClick={() => { setSelected(t.value); setError(''); }}
                role="radio"
                aria-checked={isActive}
                title={t.label}
              >
                <span className="badge">Selected</span>
                <div className="themeHead">{t.label}</div>
                {t.description ? <div className="themeDesc">{t.description}</div> : null}
              </button>
            );
          })}
        </div>
      </div>

      {error && <div className="err">{error}</div>}

      <div className="navRow">
        <button onClick={prevStep} className="btn btn-ghost" type="button">← Back</button>
        <button onClick={handleNext} className="btn btn-primary" type="button">Next →</button>
      </div>
    </motion.div>
  );
};

export default Step5TravelStyle;
