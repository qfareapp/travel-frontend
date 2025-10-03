import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCircuitForm.css'; 
import axios from 'axios';
import { API_BASE } from "../../config";

const categories = ['Mountain', 'Forest', 'River', 'Tea Garden', 'Sea', 'Desert'];
const experiences = ['Rafting', 'Kanchanjunga View', 'Trekking', 'Tea Tasting', 'Safari'];
const transportOptions = ['Car Rental', 'Shared Jeep', 'Local Bus', 'Toy Train'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CreateCircuitForm = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    categories: [],
    experiences: [],
    locations: '',
    duration: '',
    bestSeasons: [],
    description: '',
    entryPoints: '',
    transport: [],
    isOffbeat: false,
    tags: '',
    featuredActivities: [],
    carPriceHatchback: '',
    carPriceSedan: '',
    carPriceSUV: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('image', imageFile);
      data.append('name', formData.name);
      data.append('categories', JSON.stringify(formData.categories));
      data.append('experiences', JSON.stringify(formData.experiences));
      data.append('locations', formData.locations);
      data.append('duration', formData.duration);
      data.append('bestSeasons', JSON.stringify(formData.bestSeasons));
      data.append('description', formData.description);
      data.append('entryPoints', formData.entryPoints);
      data.append('transport', JSON.stringify(formData.transport));
      data.append('isOffbeat', formData.isOffbeat);

      const tagArray = formData.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase().replace(/\s+/g, '_'))
        .filter(Boolean);
      data.append('tags', JSON.stringify(tagArray));

      data.append('featuredActivities', JSON.stringify(formData.featuredActivities));
      data.append('carPriceHatchback', Number(formData.carPriceHatchback));
data.append('carPriceSedan', Number(formData.carPriceSedan));
data.append('carPriceSUV', Number(formData.carPriceSUV));

      const response = await axios.post("${API_BASE}/api/circuits", data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Circuit created successfully!');
      console.log(response.data);
    } catch (err) {
      console.error(err);
      alert('Error creating circuit');
    }
  };

  const isCarRentalSelected = formData.transport.includes('Car Rental');

  return (
    <form className="circuit-form" onSubmit={handleSubmit}>
      <h2>Create New Circuit</h2>

      <div className="form-group">
        <label>Circuit Name</label>
        <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
      </div>

      <div className="form-group checkbox-group">
        <label>Select Category</label>
        {categories.map(cat => (
          <label key={cat}>
            <input
              type="checkbox"
              checked={formData.categories.includes(cat)}
              onChange={() => handleMultiCheckbox('categories', cat)}
            /> {cat}
          </label>
        ))}
      </div>

      <div className="form-group checkbox-group">
        <label>Add Experiences</label>
        {experiences.map(exp => (
          <label key={exp}>
            <input
              type="checkbox"
              checked={formData.experiences.includes(exp)}
              onChange={() => handleMultiCheckbox('experiences', exp)}
            /> {exp}
          </label>
        ))}
      </div>

      <div className="form-group">
        <label>Locations Included (comma-separated)</label>
        <input type="text" value={formData.locations} onChange={e => handleChange('locations', e.target.value)} />
      </div>

      <div className="form-group">
        <label>Recommended Duration (e.g. 2–4 days)</label>
        <input type="text" value={formData.duration} onChange={e => handleChange('duration', e.target.value)} />
      </div>

      <div className="form-group checkbox-group">
        <label>Best Seasons / Months to Visit</label>
        {months.map(month => (
          <label key={month}>
            <input
              type="checkbox"
              checked={formData.bestSeasons.includes(month)}
              onChange={() => handleMultiCheckbox('bestSeasons', month)}
            /> {month}
          </label>
        ))}
      </div>

      <div className="form-group">
        <label>Circuit Description</label>
        <textarea value={formData.description} onChange={e => handleChange('description', e.target.value)} />
      </div>

      <div className="form-group">
        <label>Entry Points (comma-separated)</label>
        <input type="text" value={formData.entryPoints} onChange={e => handleChange('entryPoints', e.target.value)} />
      </div>

      <div className="form-group checkbox-group">
        <label>Local Transport Options</label>
        {transportOptions.map(option => (
          <label key={option}>
            <input
              type="checkbox"
              checked={formData.transport.includes(option)}
              onChange={() => handleMultiCheckbox('transport', option)}
            /> {option}
          </label>
        ))}
      </div>

      {isCarRentalSelected && (
        <>
          <div className="form-group">
            <label>Rental Car Price per Km (Hatchback)</label>
            <input
              type="number"
              min="0"
              value={formData.carPriceHatchback}
              onChange={e => handleChange('carPriceHatchback', e.target.value)}
              placeholder="e.g. 12"
            />
          </div>

          <div className="form-group">
            <label>Rental Car Price per Km (Sedan)</label>
            <input
              type="number"
              min="0"
              value={formData.carPriceSedan}
              onChange={e => handleChange('carPriceSedan', e.target.value)}
              placeholder="e.g. 15"
            />
          </div>

          <div className="form-group">
            <label>Rental Car Price per Km (SUV)</label>
            <input
              type="number"
              min="0"
              value={formData.carPriceSUV}
              onChange={e => handleChange('carPriceSUV', e.target.value)}
              placeholder="e.g. 18"
            />
          </div>
        </>
      )}

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.isOffbeat}
            onChange={() => handleChange('isOffbeat', !formData.isOffbeat)}
          />
          Offbeat Location
        </label>
      </div>

      <div className="form-group">
        <label>Tags for Search (comma-separated)</label>
        <input type="text" value={formData.tags} onChange={e => handleChange('tags', e.target.value)} />
      </div>

      <div className="form-group">
        <label>Upload Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setImageFile(e.target.files[0])}
          required
        />
      </div>

      <button type="submit" className="submit-btn">Create Circuit</button>
      <button
        type="button"
        className="add-homestay-btn"
        onClick={() => navigate('/admin/add-homestay')}
      >
        ➕ Add Homestay
      </button>

      <button
        type="button"
        className="add-homestay-btn"
        onClick={() => navigate('/admin/create-itinerary')}
        style={{ marginLeft: '10px' }}
      >
        ➕ Add Itinerary
      </button>
    </form>
  );
};

export default CreateCircuitForm;
