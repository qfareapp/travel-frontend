import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CSS_ID = 'step6-car-option-css';
const CSS_TEXT = `
:root{
  --brand1:#f97316; /* orange-500 */
  --brand2:#ec4899; /* pink-500 */
  --ink-900:#0f172a; --ink-700:#334155; --ink-500:#64748b;
  --line:#e5e7eb; --card:#ffffff;
  --radius-card:20px; --radius-item:18px;
}

/* Card shell (same family as Step2/3/4/5) */
.step6-card{
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
.step6-indicator{ display:flex; align-items:center; gap:8px; color:var(--ink-500); font-weight:600; font-size:12px; }
.step6-indicator .dot{ width:8px; height:8px; border-radius:999px; background:#000; }
.step6-title{ margin:8px 0 10px; font-size:26px; font-weight:800; color:var(--ink-900); }

/* Yes/No tiles */
.choiceRow{ display:grid; grid-template-columns: 1fr; gap:14px; }
@media (min-width: 640px){ .choiceRow{ grid-template-columns: 1fr 1fr; } }
.choice{
  border-radius: var(--radius-item);
  border:1px solid #d1d5db;
  background:#fff;
  box-shadow: 0 6px 18px rgba(15,23,42,.08);
  padding:22px 18px; text-align:center; cursor:pointer; user-select:none;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease, color .18s ease;
}
.choice:hover{ transform: translateY(-3px); box-shadow: 0 14px 28px rgba(15,23,42,.16); }
.choice .ico{ font-size:28px; margin-bottom:8px; }
.choice .hd{ font-size:16px; font-weight:800; color:var(--ink-900); }

/* selected: full gradient fill */
.choice.isActive{
  border-color: transparent; color:#fff;
  background: linear-gradient(90deg, var(--brand1), var(--brand2));
  box-shadow: 0 16px 34px rgba(236,72,153,.28);
}
.choice.isActive .hd{ color:#fff; }

/* Car type rail (single line) */
.railWrap{ position:relative; margin-top: 14px; }
.rail{
  display:flex; flex-wrap:nowrap; align-items:stretch;
  overflow-x:auto; overflow-y:hidden;
  gap:16px; padding:10px 12px;
  scroll-snap-type:x proximity; -webkit-overflow-scrolling:touch;
}
.rail::-webkit-scrollbar{ height:8px }
.rail::-webkit-scrollbar-thumb{ background:#e5e7eb; border-radius:8px }
.railWrap::before, .railWrap::after{
  content:""; position:absolute; top:0; bottom:0; width:60px; pointer-events:none;
}
.railWrap::before{ left:-1px;  background:linear-gradient(90deg,#fff 25%,transparent) }
.railWrap::after{  right:-1px; background:linear-gradient(270deg,#fff 25%,transparent) }

/* Car type item with gradient ring (text stays readable) */
.typeItem{
  scroll-snap-align:start;
  min-width: 220px; width: 30vw; max-width: 280px;
  border-radius: var(--radius-item);
  border:1px solid #d1d5db;
  background:#fff; color:#1f2937;
  box-shadow: 0 6px 18px rgba(15,23,42,.08);
  padding:16px; text-align:center; cursor:pointer; user-select:none;
  display:flex; align-items:center; justify-content:center; gap:10px;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease, color .18s ease;
}
.typeItem:hover{ transform: translateY(-2px); box-shadow: 0 14px 28px rgba(15,23,42,.16); }
.typeItem .lbl{ font-size:15px; font-weight:800; }
.typeItem.isActive{
  border-color: transparent;
  background:
    linear-gradient(#fff,#fff) padding-box,
    linear-gradient(135deg, var(--brand1), var(--brand2)) border-box;
  border: 2px solid transparent;
  box-shadow: 0 16px 34px rgba(236,72,153,.28);
}

/* Error + Nav Buttons (same theme) */
.err{ color:#b91c1c; font-weight:700; font-size:14px; margin-top:6px; }
.navRow{ display:flex; justify-content:space-between; gap:12px; margin-top:22px; }
.btn{ border:0; border-radius:12px; padding:10px 18px; font-weight:700; cursor:pointer; transition: transform .15s ease, box-shadow .15s ease, filter .15s ease; }
.btn-ghost{ background:#eef1f6; color:#111827; }
.btn-ghost:hover{ filter:saturate(1.04); box-shadow:0 6px 16px rgba(15,23,42,.12); }
.btn-primary{ color:#fff; background:linear-gradient(90deg,var(--brand1),var(--brand2)); box-shadow:0 10px 22px rgba(236,72,153,.28); }
.btn-primary:hover{ transform:translateY(-1px); box-shadow:0 16px 30px rgba(236,72,153,.35); }

@media (max-width:520px){ .typeItem{ min-width: 200px; width: 80vw; } }
`;

function useInjectCSS(){
  useEffect(() => {
    if (document.getElementById(CSS_ID)) return;
    const s = document.createElement('style');
    s.id = CSS_ID; s.textContent = CSS_TEXT;
    document.head.appendChild(s);
  }, []);
}

const Step6CarOption = ({ formData, updateData, nextStep, prevStep }) => {
  useInjectCSS();

  const [selected, setSelected] = useState(formData.withCar ?? null);
  const [carType, setCarType] = useState(formData.carType || '');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (selected === null) {
      setError('Please select whether you want a car or not.');
      return;
    }
    if (selected && !carType) {
      setError('Please select a car type.');
      return;
    }
    setError('');
    updateData('withCar', selected);
    updateData('carType', selected ? carType : null);
    nextStep();
  };

  const carOptions = [
    { value: 'Hatchback', label: '🚙 Hatchback' },
    { value: 'Sedan',     label: '🚘 Sedan'     },
    { value: 'SUV',       label: '🚜 SUV'       },
  ];

  return (
    <motion.div
      className="step6-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {/* Step Indicator */}
      <div className="step6-indicator">
        <span className="dot" />
        <span>Step 6 of 7: Transport Option</span>
      </div>

      <h2 className="step6-title">Do you want a car for pickup and drop?</h2>

      {/* Yes / No */}
      <div className="choiceRow" role="radiogroup" aria-label="Need a car?">
        <button
          type="button"
          className={`choice${selected === true ? ' isActive' : ''}`}
          onClick={() => { setSelected(true); setError(''); }}
          role="radio"
          aria-checked={selected === true}
        >
          <div className="ico" aria-hidden>🚗</div>
          <div className="hd">Yes, I want a car</div>
        </button>

        <button
          type="button"
          className={`choice${selected === false ? ' isActive' : ''}`}
          onClick={() => { setSelected(false); setCarType(''); setError(''); }}
          role="radio"
          aria-checked={selected === false}
        >
          <div className="ico" aria-hidden>🚶‍♂️</div>
          <div className="hd">No, I’ll manage my own travel</div>
        </button>
      </div>

      {/* Car type options (single-line rail) */}
      {selected === true && (
        <div className="railWrap" aria-live="polite">
          <div className="rail" role="radiogroup" aria-label="Choose car type">
            {carOptions.map((option) => {
              const active = carType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`typeItem${active ? ' isActive' : ''}`}
                  onClick={() => { setCarType(option.value); setError(''); }}
                  role="radio"
                  aria-checked={active}
                  title={option.value}
                >
                  <span className="lbl">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <div className="err">{error}</div>}

      {/* Navigation */}
      <div className="navRow">
        <button onClick={prevStep} className="btn btn-ghost" type="button">← Back</button>
        <button onClick={handleNext} className="btn btn-primary" type="button">Next →</button>
      </div>
    </motion.div>
  );
};

export default Step6CarOption;
