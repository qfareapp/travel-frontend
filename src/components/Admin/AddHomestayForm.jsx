import React, { useState, useEffect, useMemo } from 'react';
import './AddHomestayForm.css';
import axios from 'axios';
import { API_BASE } from "../../config";

const guestOptions = ['Family', 'Solo', 'Couple', 'Group'];
const addonOptions = ['Bonfire', 'Meals', 'Pickup', 'Local Guide'];

const AddHomestayForm = () => {
  const [circuits, setCircuits] = useState([]);
  const [availableExperiences, setAvailableExperiences] = useState([]);

  const [formData, setFormData] = useState({
    circuit: '',
    homestayName: '',
    placeName: '',
    distance: '',
    images: [],
    description: '',
    // Pricing: per-head (with food) ONLY
    price: '',                 // per head per night
    contact: '',
    // rooms is now derived from roomConfigs.count (read-only)
    rooms: '',
    // MULTI select guest types
    guestTypes: [],
    addons: [],
    isFeatured: false,
    experiences: [],
    experienceDistances: {},
    locationTypes: [],
    // Dynamic rooms (no price per night here)
    roomConfigs: [
      // { label: '2-bed room', capacity: 2, count: 5 }
    ],
  });

  useEffect(() => {
    const fetchCircuits = async () => {
      const res = await axios.get(`${API_BASE}/api/circuits`);
      setCircuits(res.data);
    };
    fetchCircuits();
  }, []);

  useEffect(() => {
    const selectedCircuit = circuits.find(c => c._id === formData.circuit);
    setAvailableExperiences(selectedCircuit?.experiences || []);
  }, [formData.circuit, circuits]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiCheckbox = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleImageUpload = (e) => {
    setFormData(prev => ({
      ...prev,
      images: Array.from(e.target.files || [])
    }));
  };

  // --- Dynamic Room Configs (no price per night) ---
  const addRoomConfig = () => {
    setFormData(prev => ({
      ...prev,
      roomConfigs: [...prev.roomConfigs, { label: '', capacity: '', count: '' }]
    }));
  };

  const updateRoomConfig = (idx, field, value) => {
    setFormData(prev => {
      const next = [...prev.roomConfigs];
      // coerce numbers for capacity/count so totals remain correct
      const v = ['capacity', 'count'].includes(field) ? Number(value || 0) : value;
      next[idx] = { ...next[idx], [field]: v };
      return { ...prev, roomConfigs: next };
    });
  };

  const removeRoomConfig = (idx) => {
    setFormData(prev => ({
      ...prev,
      roomConfigs: prev.roomConfigs.filter((_, i) => i !== idx)
    }));
  };
  // --------------------------------------------------

  // Auto-calc total rooms from roomConfigs
  const totalRooms = useMemo(
    () => (formData.roomConfigs || []).reduce((sum, r) => sum + (Number(r.count) || 0), 0),
    [formData.roomConfigs]
  );

  // Keep a read-only mirror for display, but don’t rely on user input
  useEffect(() => {
    setFormData(prev => ({ ...prev, rooms: String(totalRooms) }));
  }, [totalRooms]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.price || Number(formData.price) <= 0) {
      alert('Please enter a valid per-head price (₹) for the homestay.');
      return;
    }

    try {
      const data = new FormData();

      // Required/basic
      data.append('circuitId', formData.circuit);
      data.append('homestayName', formData.homestayName);
      data.append('placeName', formData.placeName);
      data.append('description', formData.description || '');
      data.append('contact', formData.contact || '');
      data.append('isFeatured', String(!!formData.isFeatured));

      // Numbers (normalized)
      data.append('distance', String(Number(formData.distance || 0)));
      // rooms derived from roomConfigs
      data.append('rooms', String(Number(totalRooms || 0)));

      // Pricing locked to per-head with food
      data.append('pricingType', 'perhead');
      data.append('price', String(Number(formData.price)));

      // Arrays/objects as JSON
      data.append('guestTypes', JSON.stringify(formData.guestTypes || []));
      data.append('addons', JSON.stringify(formData.addons || []));
      data.append('locationTypes', JSON.stringify(formData.locationTypes || []));
      data.append('experiences', JSON.stringify(formData.experiences || []));
      data.append('experienceDistances', JSON.stringify(formData.experienceDistances || {}));

      // Room configs (no price here)
      const roomConfigsClean = (formData.roomConfigs || []).map(r => ({
        label: r.label || '',
        capacity: Number(r.capacity || 0),
        count: Number(r.count || 0),
      }));
      data.append('roomConfigs', JSON.stringify(roomConfigsClean));

      // Images
      (formData.images || []).forEach((img) => data.append('images', img));

      await axios.post(`${API_BASE}/api/homestays`, data);
      alert('Homestay created successfully!');
    } catch (err) {
      console.error(err);
      alert('Error creating homestay');
    }
  };

  return (
    <form className="homestay-form" onSubmit={handleSubmit}>
      <h2>Add New Homestay</h2>

      <div className="form-group">
        <label>Select Circuit</label>
        <select value={formData.circuit} onChange={e => handleChange('circuit', e.target.value)} required>
          <option value="">-- Select --</option>
          {circuits.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Homestay Name</label>
        <input type="text" value={formData.homestayName} onChange={e => handleChange('homestayName', e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Homestay Location (Place Name)</label>
        <input type="text" value={formData.placeName} onChange={e => handleChange('placeName', e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Distance from Entry Point (in km)</label>
        <input type="number" value={formData.distance} onChange={e => handleChange('distance', e.target.value)} />
      </div>

      <div className="form-group">
        <label>Upload Images</label>
        <input type="file" multiple onChange={handleImageUpload} />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea value={formData.description} onChange={e => handleChange('description', e.target.value)} />
      </div>

      {/* Pricing: PER HEAD only */}
      <div className="form-group">
        <label>Price per Head per Night (with food) – ₹</label>
        <input
          type="number"
          placeholder="e.g., 1200"
          value={formData.price}
          onChange={e => handleChange('price', e.target.value)}
          required
          min="1"
        />
      </div>

      {/* Dynamic Rooms (no price per night here) */}
      <h3>Room Types (capacity & availability only)</h3>
      <div className="room-configs">
        {formData.roomConfigs.map((rc, i) => (
          <div key={i} className="room-config-row">
            <input
              type="text"
              placeholder="Label (e.g., 2-bed room)"
              value={rc.label}
              onChange={e => updateRoomConfig(i, 'label', e.target.value)}
            />
            <input
              type="number"
              placeholder="Capacity (guests/room)"
              value={rc.capacity}
              onChange={e => updateRoomConfig(i, 'capacity', e.target.value)}
            />
            <input
              type="number"
              placeholder="Rooms available"
              value={rc.count}
              onChange={e => updateRoomConfig(i, 'count', e.target.value)}
            />
            <button type="button" onClick={() => removeRoomConfig(i)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addRoomConfig}>+ Add Room Type</button>
      </div>

      {/* Auto-calculated Rooms (read-only) */}
      <div className="form-group">
        <label>Total Rooms (auto)</label>
        <input type="number" value={totalRooms} readOnly />
      </div>

      {/* Guest Types: multiple selection */}
      <div className="form-group checkbox-group">
        <label>Preferred Guest Types</label>
        {guestOptions.map(opt => (
          <label key={opt}>
            <input
              type="checkbox"
              checked={formData.guestTypes.includes(opt)}
              onChange={() => handleMultiCheckbox('guestTypes', opt)}
            /> {opt}
          </label>
        ))}
      </div>

      <div className="form-group checkbox-group">
        <label>Homestay Type</label>
        {['Offbeat', 'City'].map(type => (
          <label key={type}>
            <input
              type="checkbox"
              checked={formData.locationTypes.includes(type)}
              onChange={() => handleMultiCheckbox('locationTypes', type)}
            /> {type}
          </label>
        ))}
      </div>

      <div className="form-group checkbox-group">
        <label>Add-on Services</label>
        {addonOptions.map(opt => (
          <label key={opt}>
            <input
              type="checkbox"
              checked={formData.addons.includes(opt)}
              onChange={() => handleMultiCheckbox('addons', opt)}
            /> {opt}
          </label>
        ))}
      </div>

      <div className="form-group">
        <label>Select Nearby Experiences</label>
        <select
          multiple
          value={formData.experiences}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map(o => o.value);
            setFormData(prev => ({
              ...prev,
              experiences: selected,
              experienceDistances: Object.fromEntries(
                selected.map(exp => [exp, prev.experienceDistances[exp] || ''])
              )
            }));
          }}
        >
          {availableExperiences.map(exp => (
            <option key={exp} value={exp}>{exp}</option>
          ))}
        </select>
      </div>

      {formData.experiences.length > 0 && (
        <div className="form-group">
          <label>Distance to Each Experience (in km)</label>
          {formData.experiences.map(exp => (
            <div key={exp} className="experience-distance-input">
              <label>{exp}</label>
              <input
                type="number"
                placeholder="e.g. 2"
                value={formData.experienceDistances[exp] || ''}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    experienceDistances: {
                      ...prev.experienceDistances,
                      [exp]: e.target.value
                    }
                  }))
                }
              />
            </div>
          ))}
        </div>
      )}

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.isFeatured}
            onChange={() => handleChange('isFeatured', !formData.isFeatured)}
          />
          Mark as Featured
        </label>
      </div>

      <button type="submit" className="submit-btn">Save Homestay</button>
    </form>
  );
};

export default AddHomestayForm;
