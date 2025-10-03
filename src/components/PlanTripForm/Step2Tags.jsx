import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const CSS_ID = 'step2-tags-rail-css';
const CSS_TEXT = `
:root{
  --brand1:#f97316; /* orange-500 */
  --brand2:#ec4899; /* pink-500 */
  --ink-900:#0f172a; --ink-700:#334155; --ink-500:#64748b;
  --line:#e5e7eb; --card:#ffffff;
  --radius-card:20px; --radius-pill:999px;
}

/* Card */
.step2-card{
  width:100%;
  max-width: 860px;
  margin: 0 auto;
  background: color-mix(in srgb, var(--card), transparent 0%);
  backdrop-filter: blur(6px);
  border:1px solid var(--line);
  border-radius: var(--radius-card);
  box-shadow: 0 14px 36px rgba(2,6,23,.12);
  padding: 28px;
}

/* Tiny step line */
.step2-indicator{
  display:flex; align-items:center; gap:8px; color:var(--ink-500); font-weight:600; font-size:12px;
}
.step2-indicator .dot{ width:8px; height:8px; border-radius:999px; background:#000; }

/* Title */
.step2-title{
  margin: 6px 0 6px;
  text-align:center;
  font-size: 24px;
  font-weight: 800;
  color: var(--ink-900);
}

/* --- SINGLE-LINE TAG RAIL --- */
.railWrap{
  position: relative;
  margin-top: 6px;
}
.rail{
  display:flex; flex-wrap: nowrap; align-items:center;
  overflow-x: auto; overflow-y: hidden;
  gap: 14px; padding: 8px 12px;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
}

/* Edges hint */
.railWrap::before,
.railWrap::after{
  content:""; position:absolute; top:0; bottom:0; width:48px; pointer-events:none;
}
.railWrap::before{
  left:-1px;
  background: linear-gradient(90deg, #fff 20%, rgba(255,255,255,0));
  border-top-left-radius: var(--radius-card);
  border-bottom-left-radius: var(--radius-card);
}
.railWrap::after{
  right:-1px;
  background: linear-gradient(270deg, #fff 20%, rgba(255,255,255,0));
  border-top-right-radius: var(--radius-card);
  border-bottom-right-radius: var(--radius-card);
}

/* Scrollbar (subtle) */
.rail::-webkit-scrollbar{ height:8px }
.rail::-webkit-scrollbar-track{ background: transparent }
.rail::-webkit-scrollbar-thumb{
  background: #e5e7eb; border-radius: 8px;
}

/* Pill */
.pill{
  scroll-snap-align: start;
  display:inline-flex; align-items:center; gap:10px;
  padding: 10px 18px;
  border-radius: var(--radius-pill);
  border:1px solid #d1d5db;
  background:#fff; color:#1f2937;
  font-weight: 700; font-size: 14px;
  cursor:pointer; user-select:none; white-space:nowrap;
  transition: transform .15s ease, box-shadow .15s ease, background .15s ease, color .15s ease, border-color .15s ease;
  box-shadow: 0 2px 6px rgba(15,23,42,.06);
}
.pill:hover{ transform: translateY(-1px); background:#f9fafb; }
.pill:active{ transform: translateY(0); }
.pill .ico{ font-size:18px; line-height:0; }

.pill.isSelected{
  border-color: transparent;
  color:#fff;
  background: linear-gradient(90deg, var(--brand1), var(--brand2));
  box-shadow: 0 10px 22px rgba(236,72,153,.28);
}

/* Error */
.error{
  text-align:center; color:#b91c1c; font-weight:700; font-size:14px;
}

/* Nav buttons */
.navRow{ display:flex; justify-content:space-between; gap:12px; margin-top: 22px; }
.btn{
  border:0; border-radius:12px; padding:10px 18px; font-weight:700; cursor:pointer;
  transition: transform .15s ease, box-shadow .15s ease, filter .15s ease;
}
.btn-ghost{
  background:#eef1f6; color:#111827;
}
.btn-ghost:hover{ filter: saturate(1.04); box-shadow: 0 6px 16px rgba(15,23,42,.12); }

.btn-primary{
  color:#fff;
  background: linear-gradient(90deg, var(--brand1), var(--brand2));
  box-shadow: 0 10px 22px rgba(236,72,153,.28);
}
.btn-primary:hover{ transform: translateY(-1px); box-shadow: 0 16px 30px rgba(236,72,153,.35); }

/* Responsive padding */
@media (max-width: 480px){
  .step2-card{ padding: 20px; }
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

const Step2Tags = ({ formData, updateData, nextStep, prevStep }) => {
  useInjectCSS();

  const [tagOptions, setTagOptions] = useState([]);
  const [selected, setSelected] = useState(formData.placeTags || []);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/circuits/categories');
        const uniqueOptions = Array.from(new Map(res.data.map(opt => [opt.value, opt])).values());
        setTagOptions(uniqueOptions);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const toggleTag = (value) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleNext = () => {
    if (selected.length === 0) {
      setError('Please select at least one preference.');
      return;
    }
    setError('');
    updateData('placeTags', selected);
    nextStep();
  };

  return (
    <motion.div
      className="step2-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {/* Step Indicator */}
      <div className="step2-indicator">
        <span className="dot" />
        <span>Step 2 of 7: Choose Landscape Types</span>
      </div>

      <h2 className="step2-title">What kind of places do you want to visit?</h2>

      {/* SINGLE LINE TAGS */}
      <div className="railWrap">
        <div className="rail" role="listbox" aria-multiselectable="true">
          {tagOptions.map((tag) => {
            const isSelected = selected.includes(tag.value);
            return (
              <button
                key={tag.value}
                type="button"
                className={`pill${isSelected ? ' isSelected' : ''}`}
                onClick={() => toggleTag(tag.value)}
                role="option"
                aria-selected={isSelected}
                title={tag.label}
              >
                {tag.icon ? <span className="ico" aria-hidden>{tag.icon}</span> : null}
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Navigation */}
      <div className="navRow">
        <button onClick={prevStep} className="btn btn-ghost">← Back</button>
        <button onClick={handleNext} className="btn btn-primary">Next →</button>
      </div>
    </motion.div>
  );
};

export default Step2Tags;
