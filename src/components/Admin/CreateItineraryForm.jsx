import React, { useState, useEffect } from 'react';
import './CreateItineraryForm.css';
import axios from 'axios';

const guestOptions = ['Family', 'Solo', 'Couple', 'Group'];
const themes = ['Offbeat', 'City', 'Mixed'];
const carOptions = ['SUV', 'Sedan', 'Hatchback'];


const CreateItineraryForm = () => {
  const [circuits, setCircuits] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [imageFile, setImageFile] = useState(null);
const [homestayMap, setHomestayMap] = useState({});
const [carPrices, setCarPrices] = useState({
  Hatchback: null,
  Sedan: null,
  SUV: null
});
  const [formData, setFormData] = useState({
    title: '',
    circuitId: '',
    theme: '',
    categoryTags: [],
    experienceTags: [],
    durationDays: '',
    guestType: '',
    paxMin: '',
    paxMax: '',
    budgetMin: '',
    budgetMax: '',
    transportIncluded: false,
    carTypes: [],
    isFeatured: false,
    dayWisePlan: [],
    localGuide: {
      name: '',
      contact: '',
      location: '',
      bio: '',
      image: null
    }
  });

 useEffect(() => {
  const fetchData = async () => {
    const circuitsRes = await axios.get('http://localhost:5000/api/circuits');
    const homestaysRes = await axios.get('http://localhost:5000/api/homestays');
    setCircuits(circuitsRes.data);
    setHomestays(homestaysRes.data);

    // 🧠 Map homestays by ID
    const map = {};
    homestaysRes.data.forEach(h => {
      map[h._id] = h;
    });
    setHomestayMap(map);
  };
  fetchData();
}, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

     // When circuit is selected, pull car prices
  if (field === 'circuitId') {
    const selectedCircuit = circuits.find(c => c._id === value);
    if (selectedCircuit) {
      setCarPrices({
        Hatchback: selectedCircuit.carPriceHatchback || null,
        Sedan: selectedCircuit.carPriceSedan || null,
        SUV: selectedCircuit.carPriceSUV || null
      });
    } else {
      setCarPrices({ Hatchback: null, Sedan: null, SUV: null });
    }
  }
  };

  const handleCarTypeChange = (value) => {
  setFormData(prev => ({
    ...prev,
    carTypes: prev.carTypes.includes(value)
      ? prev.carTypes.filter(v => v !== value)
      : [...prev.carTypes, value]
  }));
};

  const handleDayChange = (index, field, value) => {
    const updated = [...formData.dayWisePlan];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, dayWisePlan: updated }));
  };

  const addDay = () => {
    setFormData(prev => ({
      ...prev,
      dayWisePlan: [...prev.dayWisePlan, { day: prev.dayWisePlan.length + 1, title: '', description: '', stayAtHomestayId: '', activities: '', travelDistanceKm: '' }]
    }));
  };

  const removeDay = (index) => {
    const updated = formData.dayWisePlan.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, dayWisePlan: updated }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ Validation for required numeric fields
  const requiredFields = ['durationDays', 'budgetMin', 'budgetMax'];
  for (const field of requiredFields) {
    if (!formData[field] || isNaN(Number(formData[field]))) {
      alert(`Please fill a valid number in: ${field}`);
      return;
    }
  }

  try {
    // ✅ Clean & sanitize before submission
    const parsedData = {
      ...formData,
      durationDays: Number(formData.durationDays || 0),
      paxMin: Number(formData.paxMin || 0),
      paxMax: Number(formData.paxMax || 0),
      budgetMin: Number(formData.budgetMin || 0),
      budgetMax: Number(formData.budgetMax || 0),
      transportIncluded: formData.transportIncluded === true || formData.transportIncluded === 'true',
      isFeatured: formData.isFeatured === true || formData.isFeatured === 'true',
      carTypes: JSON.stringify(formData.carTypes || []),
      categoryTags: JSON.stringify(formData.categoryTags || []),
      experienceTags: JSON.stringify(formData.experienceTags || []),
      dayWisePlan: JSON.stringify(formData.dayWisePlan || [])
    };

    const data = new FormData();

    // 🔁 Append all key-value pairs
    Object.entries(parsedData).forEach(([key, value]) => {
      if (key === 'localGuide') {
        data.append('localGuideName', value.name);
        data.append('localGuideContact', value.contact);
        data.append('localGuideLocation', value.location);
        data.append('localGuideBio', value.bio);
        if (value.image) data.append('localGuideImage', value.image);
      } else {
        data.append(key, typeof value === 'number' ? value.toString() : value);
      }
    });

    if (imageFile) {
      data.append('image', imageFile);
    }

    // ✅ POST to backend
    await axios.post('http://localhost:5000/api/itinerary', data);
    alert('✅ Itinerary created successfully!');
  } catch (err) {
    console.error('❌ Itinerary creation failed:', err.response?.data || err.message);
    alert(`❌ Itinerary creation failed: ${err.response?.data?.error || err.message}`);
  }
};

  return (
    <form className="itinerary-form" onSubmit={handleSubmit}>
      <h2>Create Preset Trip Itinerary</h2>

      <input type="text" placeholder="Itinerary Title" required value={formData.title} onChange={e => handleChange('title', e.target.value)} />

      <select value={formData.circuitId} onChange={e => handleChange('circuitId', e.target.value)} required>
        <option value="">Select Circuit</option>
        {circuits.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>

      <select value={formData.theme} onChange={e => handleChange('theme', e.target.value)} required>
        <option value="">Select Theme</option>
        {themes.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <input type="number" placeholder="Duration (days)" value={formData.durationDays} onChange={e => handleChange('durationDays', e.target.value)} required />

      <select value={formData.guestType} onChange={e => handleChange('guestType', e.target.value)}>
        <option value="">Guest Type</option>
        {guestOptions.map(g => <option key={g} value={g}>{g}</option>)}
      </select>

      <input type="number" placeholder="Min Pax" value={formData.paxMin} onChange={e => handleChange('paxMin', e.target.value)} />
      <input type="number" placeholder="Max Pax" value={formData.paxMax} onChange={e => handleChange('paxMax', e.target.value)} />

      <input type="number" placeholder="Min Budget ₹" value={formData.budgetMin} onChange={e => handleChange('budgetMin', e.target.value)} />
      <input type="number" placeholder="Max Budget ₹" value={formData.budgetMax} onChange={e => handleChange('budgetMax', e.target.value)} />

      <label>
        <input type="checkbox" checked={formData.transportIncluded} onChange={e => handleChange('transportIncluded', e.target.checked)} />
        Transport Included?
      </label>

      {formData.transportIncluded && (
  <div className="form-group checkbox-group">
    <label>Available Car Types for this Itinerary</label>
    {carOptions.map(opt => (
      <label key={opt} style={{ display: 'block', marginBottom: '6px' }}>
        <input
          type="checkbox"
          checked={formData.carTypes.includes(opt)}
          onChange={() => handleCarTypeChange(opt)}
        />
        {opt} {carPrices[opt] ? `– ₹${carPrices[opt]}/km` : '(price not set in circuit)'}
      </label>
    ))}
  </div>
)}

<div className="form-group">
  <label>Category Tags</label>
  <select
    multiple
    value={formData.categoryTags}
    onChange={(e) =>
      handleChange('categoryTags', Array.from(e.target.selectedOptions).map(o => o.value))
    }
  >
    <option value="mountain">Mountain</option>
    <option value="forest">Forest</option>
    <option value="river">River</option>
    <option value="tea garden">Tea Garden</option>
    <option value="sea">Sea</option>
    <option value="desert">Desert</option>
  </select>
</div>

<div className="form-group">
  <label>Experience Tags</label>
  <select
    multiple
    value={formData.experienceTags}
    onChange={(e) =>
      handleChange('experienceTags', Array.from(e.target.selectedOptions).map(o => o.value))
    }
  >
    <option value="safari">Safari</option>
    <option value="trekking">Trekking</option>
    <option value="boating">Boating</option>
    <option value="tea tasting">Tea Tasting</option>
    <option value="camping">Camping</option>
  </select>
</div>

      <div className="form-group">
        <label>Cover Image</label>
        <input type="file" onChange={e => setImageFile(e.target.files[0])} />
      </div>

      <h3>📅 Day-wise Plan</h3>
      {formData.dayWisePlan.map((day, i) => (
        <div key={i} className="day-block">
          <h4>Day {i + 1}</h4>
          <input type="text" placeholder="Title" value={day.title} onChange={e => handleDayChange(i, 'title', e.target.value)} />
          <textarea placeholder="Description" value={day.description} onChange={e => handleDayChange(i, 'description', e.target.value)} />
          <select value={day.stayAtHomestayId} onChange={e => handleDayChange(i, 'stayAtHomestayId', e.target.value)}>
            <option value="">Stay (optional)</option>
            {homestays.map(h => (
              <option key={h._id} value={h._id}>{h.homestayName} - {h.placeName}</option>
            ))}
          </select>
          {homestayMap[day.stayAtHomestayId]?.experiences?.length > 0 ? (
  <div className="form-group">
    <label>Activities</label>
    <select
      multiple
      value={Array.isArray(day.activities) ? day.activities : []}
      onChange={(e) => {
        const selected = Array.from(e.target.selectedOptions).map(o => o.value);
        handleDayChange(i, 'activities', selected);
      }}
    >
      {homestayMap[day.stayAtHomestayId].experiences.map((exp, idx) => (
        <option key={idx} value={exp}>{exp}</option>
      ))}
    </select>
  </div>
) : (
  <p style={{ fontStyle: 'italic', marginTop: '10px' }}>
    No mapped experiences found for this homestay.
  </p>
)}

          <input type="number" placeholder="Travel Distance (km)" value={day.travelDistanceKm} onChange={e => handleDayChange(i, 'travelDistanceKm', e.target.value)} />
          <button type="button" onClick={() => removeDay(i)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={addDay}>➕ Add Day</button>

      <h3>👤 Local Guide Info</h3>
      <input type="text" placeholder="Name" value={formData.localGuide.name} onChange={e => setFormData(prev => ({ ...prev, localGuide: { ...prev.localGuide, name: e.target.value } }))} />
      <input type="text" placeholder="Contact" value={formData.localGuide.contact} onChange={e => setFormData(prev => ({ ...prev, localGuide: { ...prev.localGuide, contact: e.target.value } }))} />
      <input type="text" placeholder="Location" value={formData.localGuide.location} onChange={e => setFormData(prev => ({ ...prev, localGuide: { ...prev.localGuide, location: e.target.value } }))} />
      <textarea placeholder="Bio" value={formData.localGuide.bio} onChange={e => setFormData(prev => ({ ...prev, localGuide: { ...prev.localGuide, bio: e.target.value } }))} />
      <input type="file" onChange={e => setFormData(prev => ({ ...prev, localGuide: { ...prev.localGuide, image: e.target.files[0] } }))} />

      <label>
        <input type="checkbox" checked={formData.isFeatured} onChange={e => handleChange('isFeatured', e.target.checked)} />
        Featured Itinerary?
      </label>

      <button type="submit">Save Itinerary</button>
    </form>
  );
};

export default CreateItineraryForm;
