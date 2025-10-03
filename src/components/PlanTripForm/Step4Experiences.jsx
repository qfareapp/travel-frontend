import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const CSS_ID = 'step4-experiences-rail-css';
const CSS_TEXT = `
:root{
  --brand1:#f97316; /* orange-500 */
  --brand2:#ec4899; /* pink-500 */
  --ink-900:#0f172a; --ink-700:#334155; --ink-500:#64748b;
  --line:#e5e7eb; --card:#ffffff;
  --radius-card:20px; --radius-pill:999px; --radius-item:18px;
}

/* Card shell (same as Step2/3) */
.step4-card{
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

.step4-indicator{ display:flex; align-items:center; gap:8px; color:var(--ink-500); font-weight:600; font-size:12px; }
.step4-indicator .dot{ width:8px; height:8px; border-radius:999px; background:#000; }
.step4-title{ margin:8px 0 10px; font-size:26px; font-weight:800; color:var(--ink-900); text-align:left; }

/* -------- SINGLE-LINE EXPERIENCE RAIL -------- */
.railWrap{ position: relative; margin-top: 6px; }
.rail{
  display:flex; flex-wrap: nowrap; align-items:stretch;
  overflow-x:auto; overflow-y:hidden; gap:14px; padding:10px 12px;
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

/* experience tile (pill-like card) */
.exTile{
  scroll-snap-align:start;
  min-width: 220px; width: 26vw; max-width: 280px;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
  padding:18px 16px;
  text-align:center; cursor:pointer; user-select:none; 
  border-radius: var(--radius-item);
  border:1px solid #d1d5db; background:#fff;
  color:#1f2937; font-weight:700;
  box-shadow: 0 6px 18px rgba(15,23,42,.08);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease, color .18s ease;
}
.exTile:hover{ transform: translateY(-2px); box-shadow: 0 14px 28px rgba(15,23,42,.16); }
.exIcon{ font-size:28px; line-height:1; }
.exLabel{ font-size:14px; }

/* selected state – gradient fill + subtle glow */
.exTile.isSelected{
  border-color: transparent;
  color:#fff;
  background: linear-gradient(90deg, var(--brand1), var(--brand2));
  box-shadow: 0 16px 34px rgba(236,72,153,.28);
}

/* nav buttons – match Step2/3 */
.navRow{ display:flex; justify-content:space-between; gap:12px; margin-top:22px; }
.btn{ border:0; border-radius:12px; padding:10px 18px; font-weight:700; cursor:pointer; transition: transform .15s ease, box-shadow .15s ease, filter .15s ease; }
.btn-ghost{ background:#eef1f6; color:#111827; }
.btn-ghost:hover{ filter:saturate(1.04); box-shadow:0 6px 16px rgba(15,23,42,.12); }
.btn-primary{ color:#fff; background:linear-gradient(90deg,var(--brand1),var(--brand2)); box-shadow:0 10px 22px rgba(236,72,153,.28); }
.btn-primary:hover{ transform:translateY(-1px); box-shadow:0 16px 30px rgba(236,72,153,.35); }

/* small screens: keep single line but wider tiles */
@media (max-width: 520px){
  .exTile{ min-width: 200px; width: 80vw; }
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

const Step4Experiences = ({ formData, updateData, nextStep, prevStep }) => {
  useInjectCSS();

  const [experienceOptions, setExperienceOptions] = useState([]);
  const [selected, setSelected] = useState(formData.experiences || []);

  // Fetch experiences
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/circuits/experiences');
        const unique = Array.from(new Map(res.data.map(i => [i.value, i])).values());
        setExperienceOptions(unique);
      } catch (err) {
        console.error('Failed to fetch experiences:', err);
      }
    };
    fetchExperiences();
  }, []);

  const toggleActivity = (value) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleNext = () => {
    updateData('experiences', selected);
    nextStep();
  };

  return (
    <motion.div
      className="step4-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {/* Step Indicator */}
      <div className="step4-indicator">
        <span className="dot" />
        <span>Step 4 of 7: Choose Experiences</span>
      </div>

      <h2 className="step4-title">Pick the activities you’re interested in</h2>

      {/* SINGLE-LINE OPTIONS */}
      <div className="railWrap">
        <div className="rail" role="listbox" aria-multiselectable="true">
          {experienceOptions.map((activity) => {
            const isSelected = selected.includes(activity.value);
            return (
              <button
                key={activity.value}
                type="button"
                className={`exTile${isSelected ? ' isSelected' : ''}`}
                onClick={() => toggleActivity(activity.value)}
                role="option"
                aria-selected={isSelected}
                title={activity.label}
              >
                <span className="exIcon" aria-hidden>{activity.icon}</span>
                <span className="exLabel">{activity.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="navRow">
        <button onClick={prevStep} className="btn btn-ghost" type="button">← Back</button>
        <button onClick={handleNext} className="btn btn-primary" type="button">Next →</button>
      </div>
    </motion.div>
  );
};

export default Step4Experiences;
