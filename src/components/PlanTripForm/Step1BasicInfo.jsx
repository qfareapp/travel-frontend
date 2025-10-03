import React, { useState, useEffect } from 'react';

const CSS_ID = 'step1-basic-info-css';
const CSS_TEXT = `
:root{
  --step1-radius: 20px;
  --step1-ink-900:#0f172a;
  --step1-ink-700:#334155;
  --step1-line:#e5e7eb;
  --step1-brand1:#f97316; /* orange */
  --step1-brand2:#4f46e5; /* indigo */
  --step1-accent:#10b981; /* mint */
}

/* Wrapper provides an anchor for the floating CTA and space below */
.step1-wrap{
  position: relative;
  width: 100%;
  max-width: 48rem; /* ~max-w-2xl */
  margin: 0 auto;
  padding-bottom: 56px; /* room for outside button */
}

/* Card: gradient border, subtle pattern, lift on hover */
.step1-card{
  position: relative;
  border-radius: var(--step1-radius);
  background:
    linear-gradient(#ffffff,#ffffff) padding-box,
    radial-gradient(120% 120% at 0% 0%, rgba(249,115,22,.35), transparent 55%),
    linear-gradient(135deg, var(--step1-brand1), var(--step1-brand2)) border-box;
  border: 1px solid transparent;
  box-shadow: 0 12px 28px rgba(2,6,23,.10);
  overflow: hidden;
  isolation: isolate;
  transition: transform .25s ease, box-shadow .25s ease;
}
.step1-card::before{
  content:""; position:absolute; right:-80px; top:-80px;
  width:240px; height:240px; border-radius:50%;
  background: radial-gradient(closest-side, rgba(79,70,229,.18), transparent 60%);
  filter: blur(2px); pointer-events:none;
}
.step1-card::after{
  content:""; position:absolute; left:20px; right:20px; top:0;
  height:2px; border-radius:2px;
  background: linear-gradient(90deg, var(--step1-brand1), var(--step1-brand2));
  opacity:.5;
}
.step1-card:hover{
  transform: translateY(-4px);
  box-shadow: 0 18px 48px rgba(2,6,23,.18);
}

/* Title */
.step1-title{
  background: linear-gradient(90deg, var(--step1-ink-900), #1f2937);
  -webkit-background-clip:text; background-clip:text; color: transparent;
  letter-spacing:.2px;
}

/* Fields */
.step1-label{
  color: var(--step1-ink-700);
  font-weight: 600;
  letter-spacing:.2px;
}
.step1-input{
  border:1px solid var(--step1-line);
  border-radius: 12px;
  transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
  background:#fff;
  box-shadow: inset 0 0 0 1px rgba(15,23,42,.02);
}
.step1-input:focus{
  outline: none;
  border-color: transparent;
  background: #fff;
  box-shadow:
    0 0 0 3px rgba(79,70,229,.10),
    0 0 0 6px rgba(249,115,22,.10),
    inset 0 0 0 1px rgba(15,23,42,.06);
}

/* Error note */
.step1-error{
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .5rem .75rem;
  border-radius: 10px;
  background: #fef2f2;
  color: #991b1b;
  border:1px solid #fecaca;
  font-weight: 600;
}
.step1-error::before{
  content:"!";
  display:inline-grid; place-items:center;
  width:18px; height:18px; border-radius:50%;
  background:#ef4444; color:#fff; font-size:12px; font-weight:800;
}

/* CTA base style */
.step1-cta{
  background: linear-gradient(90deg, var(--step1-brand2), var(--step1-brand1));
  color:#fff; border:1px solid rgba(15,23,42,.15);
  border-radius: 12px;
  box-shadow: 0 12px 26px rgba(79,70,229,.25);
  position: relative; overflow: hidden;
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
}
.step1-cta::after{
  content:""; position:absolute; inset:0;
  background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,.28) 40%, transparent 60%);
  transform: translateX(-120%);
  transition: transform .6s ease; pointer-events:none;
}
.step1-cta:hover{ transform: translateY(-2px); box-shadow: 0 18px 40px rgba(79,70,229,.32); filter: saturate(1.05); }
.step1-cta:hover::after{ transform: translateX(120%); }

/* Floating variant: OUTSIDE bottom-left of the card */
.step1-ctaFloat{
  position: absolute;
  left: 18px;
  bottom: -28px; /* sits outside */
  z-index: 2;
  padding: 12px 20px; /* compact so it hugs the corner */
  font-weight: 700;
}

/* Mobile: place button below naturally */
@media (max-width: 640px){
  .step1-wrap{ padding-bottom: 0; }
  .step1-ctaFloat{ position: static; margin-top: 12px; display: inline-flex; }
}

/* Optional: inner spacing if no Tailwind is present */
.step1-pad{ padding: 2rem; }
.step1-rounded{ border-radius: 1rem; }
.step1-shadow{ box-shadow: 0 10px 30px rgba(0,0,0,.08); }
`;

function useInjectCSS() {
  useEffect(() => {
    if (document.getElementById(CSS_ID)) return;
    const s = document.createElement('style');
    s.id = CSS_ID;
    s.textContent = CSS_TEXT;
    document.head.appendChild(s);
  }, []);
}

const Step1BasicInfo = ({ formData, updateData, nextStep }) => {
  useInjectCSS();
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!formData.startDate || !formData.endDate || !formData.pax || !formData.noOfRooms) {
      setError('Please fill all fields before continuing.');
      return;
    }
    setError('');
    nextStep();
  };

  return (
    <>
      <div className="step1-wrap">
        <div className="step1-card bg-white/90 backdrop-blur-md step1-pad step1-rounded step1-shadow space-y-6">
          <h2 className="step1-title text-3xl font-extrabold text-center">
            When are you planning your trip?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="step1-label block text-sm mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => updateData('startDate', e.target.value)}
                className="step1-input w-full px-4 py-3 text-gray-700"
              />
            </div>

            <div>
              <label className="step1-label block text-sm mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => updateData('endDate', e.target.value)}
                className="step1-input w-full px-4 py-3 text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="step1-label block text-sm mb-1">No. of People (Pax)</label>
            <input
              type="number"
              min={1}
              value={formData.pax}
              onChange={(e) => updateData('pax', e.target.value)}
              className="step1-input w-full px-4 py-3 text-gray-700"
            />
          </div>

          <div>
            <label className="step1-label block text-sm mb-1">No. of Rooms Needed</label>
            <input
              type="number"
              min={1}
              value={formData.noOfRooms}
              onChange={(e) => updateData('noOfRooms', e.target.value)}
              className="step1-input w-full px-4 py-3 text-gray-700"
            />
          </div>
        </div>

        {/* Floating NEXT outside the card */}
        <button onClick={handleNext} className="step1-cta step1-ctaFloat">
          Next →
        </button>
      </div>

      {/* Error below the card so layout doesn't jump */}
      {error && <p className="step1-error text-sm" style={{ marginTop: 8 }}>{error}</p>}
    </>
  );
};

export default Step1BasicInfo;
