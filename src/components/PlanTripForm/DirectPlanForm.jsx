// src/components/PlanTripForm/DirectPlanForm.jsx
import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Step1BasicInfo from "./Step1BasicInfo";
import Step6CarOption from "./Step6CarOption";
import Step7ReviewAndConfirm from "./Step7ReviewAndConfirm";

/* ------------------------------
   STEP DEFINITIONS
   ------------------------------ */
const STEP_COMPONENTS = {
  1: Step1BasicInfo,
  6: Step6CarOption,
  7: Step7ReviewAndConfirm,
};

const TOTAL_STEPS = 7;

/* ------------------------------
   MAIN COMPONENT
   ------------------------------ */
export default function DirectPlanForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const itinerary = location.state?.itinerary || {};

  // unified form state
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    pax: 1,
    withCar: false,
    carType: "",
  });

  const [step, setStep] = useState(1);

  /* ---------- step controls ---------- */
  const nextStep = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  const updateData = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  /* ---------- confirm handler ---------- */
  const handleConfirm = () => {
    navigate("/itinerary/result", {
      state: {
        flow: "direct", // mark flow explicitly
        filters: formData,
        itineraries: [itinerary],
      },
    });
  };

  /* ---------- step renderer ---------- */
  const StepComponent = useMemo(() => STEP_COMPONENTS[step] || null, [step]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Quick Trip Planner</h2>

      {!StepComponent ? (
        <div className="text-red-500">Invalid step</div>
      ) : (
        <StepComponent
          formData={formData}
          updateData={updateData}
          nextStep={nextStep}
          prevStep={prevStep}
          onConfirm={step === 7 ? handleConfirm : undefined}
        />
      )}
    </div>
  );
}
