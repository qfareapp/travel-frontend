import React from 'react';
import './ItineraryResult.css';

const ItineraryResult = ({ itineraries }) => {
  if (!Array.isArray(itineraries) || itineraries.length === 0) {
    return <div className="itinerary-result">No matching itineraries found. Please plan your trip again.</div>;
  }

  const renderStayName = (stay) => {
    if (!stay) return 'N/A';
    if (typeof stay === 'string') return `Homestay ID: ${stay}`;
    return stay.homestayName || 'Selected Homestay';
  };

  return (
    <div className="itinerary-result-list">
      {itineraries.map((itinerary, idx) => (
        <div className="itinerary-result" key={itinerary._id || idx}>
          <h2>Trip Itinerary Summary</h2>

          {/* Overview */}
          <section className="summary-section">
            <h3>Overview</h3>
            <p><strong>Title:</strong> {itinerary.title}</p>
            <p><strong>Theme:</strong> {itinerary.theme}</p>
            <p><strong>Duration:</strong> {itinerary.durationDays} days</p>
            <p><strong>Guest Type:</strong> {itinerary.guestType}</p>
            <p><strong>Pax:</strong> {itinerary.paxMin} – {itinerary.paxMax} people</p>
            <p><strong>Total Budget:</strong> ₹{itinerary.budgetMin} – ₹{itinerary.budgetMax}</p>
            <p><strong>Transport:</strong> {itinerary.transportIncluded ? `Yes (${itinerary.carType})` : 'Not Included'}</p>
            {itinerary.image && <img src={itinerary.image} alt="cover" className="itinerary-cover" />}
          </section>

          {/* Day-wise Plan */}
          <section className="summary-section">
            <h3>🗓️ Day-wise Plan</h3>
            {Array.isArray(itinerary.dayWisePlan) && itinerary.dayWisePlan.length > 0 ? (
              itinerary.dayWisePlan.map((day, index) => (
                <div key={index} className="day-block">
                  <h4>Day {index + 1}: {day.title}</h4>
                  <p>{day.description}</p>
                  {day.stayAtHomestayId && (
                    <p><strong>Stay:</strong> {renderStayName(day.stayAtHomestayId)}</p>
                  )}
                  {day.activities && (
                    <p><strong>Activities:</strong> {Array.isArray(day.activities)
                      ? day.activities.join(', ')
                      : day.activities}</p>
                  )}
                  {day.travelDistanceKm && (
                    <p><strong>Travel Distance:</strong> {day.travelDistanceKm} km</p>
                  )}
                </div>
              ))
            ) : (
              <p>No day-wise plan added.</p>
            )}
          </section>

          {/* Local Guide */}
          <section className="summary-section">
            <h3>👤 Local Guide</h3>
            <p><strong>Name:</strong> {itinerary.localGuide?.name || 'N/A'}</p>
            <p><strong>Contact:</strong> {itinerary.localGuide?.contact || 'N/A'}</p>
            <p><strong>Location:</strong> {itinerary.localGuide?.location || 'N/A'}</p>
            <p><strong>Bio:</strong> {itinerary.localGuide?.bio || 'N/A'}</p>
            {itinerary.localGuide?.image && (
              <img src={itinerary.localGuide.image} alt="Guide" className="guide-image" />
            )}
          </section>
        </div>
      ))}
    </div>
  );
};

export default ItineraryResult;
