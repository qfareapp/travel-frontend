import React, { useState } from 'react';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Tags from './Step2Tags';
import Step3Circuits from './Step3Circuits';
import Step4Experiences from './Step4Experiences';
import Step5TravelStyle from './Step5TravelStyle';
import Step6CarOption from './Step6CarOption';
import Step7ReviewAndConfirm from './Step7ReviewAndConfirm';

const styles = {
  backgroundWrapper: {
    backgroundImage: `url('public/images/30205.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#f3f4f6', // fallback color
    minHeight: '100vh',
    width: '100%',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
  },
  overlay: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '32px 28px',
    width: '100%',
    maxWidth: '840px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
    boxSizing: 'border-box',
  },
  heading: {
    textAlign: 'center',
    fontSize: '30px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '30px',
    letterSpacing: '0.5px',
  },
  progressBarWrapper: {
    width: '100%',
    height: '12px',
    borderRadius: '8px',
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
    marginBottom: '40px',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(to right, #ff6a00, #ee0979)',
    transition: 'width 0.5s ease-in-out',
  },
};

const PlanTripForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    pax: 1,
    noOfRooms: '',
    placeTags: [],
    selectedCircuit: '',
    experiences: [],
    travelStyle: '',
    withCar: false,
    budgetRange: '',
  });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 7));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  const updateData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const renderStep = () => {
  switch (step) {
    case 1:
      return <Step1BasicInfo formData={formData} updateData={updateData} nextStep={nextStep} />;
    case 2:
      return <Step2Tags formData={formData} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
    case 3:
      return <Step3Circuits formData={formData} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
    case 4:
      return <Step4Experiences formData={formData} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
    case 5:
      return <Step5TravelStyle formData={formData} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
    case 6:
      return <Step6CarOption formData={formData} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
    case 7:
      return (
        <Step7ReviewAndConfirm
          formData={formData}
          updateData={updateData} // ✅ THIS LINE ADDED
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    default:
      return <div>Invalid step</div>;
  }
};


  return (
    <div style={styles.backgroundWrapper}>
      <div style={styles.overlay}>
        <h2 style={styles.heading}>Plan Your Dream Trip</h2>

        <div style={styles.progressBarWrapper}>
          <div style={{ ...styles.progressBarFill, width: `${(step / 7) * 100}%` }} />
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default PlanTripForm;
