import React, { useEffect, useRef, useState } from 'react';
import './HomePage.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';

const HomePage = () => {
  const scrollRef = useRef(null);
  const [packages, setPackages] = useState([]);
  const [featuredStays, setFeaturedStays] = useState([]);
  

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [packagesRes, staysRes] = await Promise.all([
        axios.get(`${API_BASE}/api/circuits`),
        axios.get(`${API_BASE}/api/homestays`),
      ]);

      console.log("Circuits API:", packagesRes.data);
      console.log("Homestays API:", staysRes.data);

      setPackages(
        Array.isArray(packagesRes.data) ? packagesRes.data : packagesRes.data.circuits || []
      );
      setFeaturedStays(
        Array.isArray(staysRes.data) ? staysRes.data : staysRes.data.homestays || []
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  fetchData();
}, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: `url('/images/30205.jpg')` }}>
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Discover India</h1>
            <p>Personalized trips, curated circuits, local guides and homestays.</p>
            <Link to="/plan" className="hero-button">Plan a Trip</Link>
          </div>
        </div>
      </section>

      
{/* Popular Circuits */}
{/* Popular Circuits */}
<section className="circuits-section">
  <h2>Popular Circuits</h2>
  <div className="card-grid">
    {packages.map((place, index) => (
      <Link to={`/circuit/${place._id}`} key={index} className="card-link">
        <div className="card">
          <img
            src={place.img ? `${API_BASE}${place.img}` : '/images/fallback.jpg'}
            alt={place.name}
            className="card-image"
          />
          <div className="card-body">
            <div className="card-meta">
              <span>📍 {place.locations?.[0] || 'Location not available'}</span>
              <span>⏱ {place.duration || 'Duration not available'}</span>
            </div>
            <h3>{place.name || 'Circuit Name not available'}</h3>
            <p className="card-tag">{place.tags?.[0] || 'No tags available'}</p>
          </div>
        </div>
      </Link>
    ))}
  </div>
</section>

      {/* Featured Stays Section */}
<section className="stays-section">
  <h2>Featured Stays</h2>
  <div className="scroll-buttons">
    <button className="scroll-arrow" onClick={() => scroll('left')}>‹</button>
    <button className="scroll-arrow" onClick={() => scroll('right')}>›</button>
  </div>

  <div className="stay-card-list no-scrollbar" ref={scrollRef}>
    {featuredStays.map((stay, i) => {
      const img = stay?.images?.[0]
        ? `${API_BASE}${stay.images[0]}`
        : '/images/placeholder-stay.jpg';

      const name = stay.homestayName || stay.name || 'Homestay';
      const location =
        stay.location ||
        stay.city ||
        stay.town ||
        stay.circuitId?.locations?.[0] ||
        stay.circuitId?.name ||
        '—';

      // Ensure rating is properly handled, fallback to "Not Rated" if missing
      const ratingVal = Number(stay.rating ?? stay.avgRating ?? 0);
      const ratingText = ratingVal > 0 ? `${ratingVal.toFixed(1)}/5` : 'Not Rated';

      const pricePerHead = Number(stay.perHeadPrice ?? stay.pricePerHead ?? stay.price ?? 0);
      const pricingType = stay.pricingType || (stay.pricePerHead ? 'perHead' : 'perRoom');
      const unit = /head/i.test(pricingType) ? 'per person' : 'per room';
      const inr = v => `₹${Number(v || 0).toLocaleString('en-IN')}`;

      return (
        <Link
          key={stay._id || i}
          to={`/homestays/${stay._id}`}
          className="stay-card"
          aria-label={`View details for ${name}`}
        >
          <img src={img} alt={name} className="stay-img" />

          <div className="stay-body stack">
            <h3 className="stay-title">{name}</h3>
            <div className="stay-location" title={location}>{location}</div>

            <div className="stay-price">
              <span className="stay-price-amount">
                {pricePerHead > 0 ? inr(pricePerHead) : 'Price on request'}
              </span>
              {pricePerHead > 0 && <span className="stay-price-unit">{unit}</span>}
            </div>

            {/* Display Rating */}
            <div className="stay-rating">
              <span className="stay-rating-badge">{ratingText}</span> {/* Show formatted rating */}
            </div>
          </div>
        </Link>
      );
    })}
  </div>
</section>

    </div>
  );
};

export default HomePage;
