import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./ItineraryDetailsPage.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ItineraryDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [booking, setBooking] = useState({
    startDate: "",
    endDate: "",
    pax: 1,
    rooms: 1,
    vehicleNeeded: false,
    vehicleType: "",
    activities: [],
  });

  const [selection, setSelection] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/itineraries/${id}`);
        setItinerary(res.data);
      } catch (err) {
        console.error("Failed to fetch itinerary:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // handle date selection
  const handleDateSelect = (ranges) => {
    const start = ranges.selection.startDate;
    if (!start || !itinerary?.durationDays) return;

    // Auto-calc end date
    const end = new Date(start);
    end.setDate(end.getDate() + itinerary.durationDays - 1);

    setSelection([
      {
        startDate: start,
        endDate: end,
        key: "selection",
      },
    ]);

    setBooking({
      ...booking,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    });
  };

  // utility to validate trip days
  const calculateDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e - s;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    const tripDays = calculateDays(booking.startDate, booking.endDate);

    if (tripDays !== itinerary.durationDays) {
      alert(
        `This itinerary is for ${itinerary.durationDays} days. Please select exact dates matching ${itinerary.durationDays} days.`
      );
      return;
    }

    try {
      navigate("/itinerary/confirm", {
        state: { itinerary, booking, filters: booking },
      });
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Booking failed");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!itinerary) return <div>No itinerary found</div>;

  return (
    <div className="itinerary-page">
      {/* Left Section */}
      <div className="itinerary-left">
        <h1>{itinerary.title}</h1>
        <p><strong>Duration:</strong> {itinerary.durationDays} days</p>
        <p><strong>Budget:</strong> ₹{itinerary.budgetMin} – ₹{itinerary.budgetMax}</p>
        <p><strong>Car Type:</strong> {itinerary.carType || "N/A"}</p>

        <h2>Day-wise Plan</h2>
        <ul>
          {itinerary.dayWisePlan.map((d, idx) => (
            <li key={d._id || idx}>
              <h4>Day {d.day}: {d.title}</h4>
              <p>{d.description}</p>
              {d.stayAtHomestayId?.name && <p>Stay: {d.stayAtHomestayId.name}</p>}
              {Array.isArray(d.activities) && d.activities.length > 0 && (
                <ul>
                  {d.activities.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
              <p>Travel Distance: {d.travelDistanceKm} km</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Section: Booking */}
      <div className="itinerary-right">
        <h2>Book this Itinerary</h2>
        <form onSubmit={handleBookingSubmit} className="booking-form">
          
          <h3>Select Trip Dates</h3>
<DatePicker
  selected={booking.startDate ? new Date(booking.startDate) : null}
  onChange={(date) => {
    if (!date || !itinerary?.durationDays) return;

    const start = date;
    const end = new Date(start);
    end.setDate(end.getDate() + itinerary.durationDays - 1);

    setBooking({
      ...booking,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    });
  }}
  minDate={new Date()}   // disable past dates
  dateFormat="yyyy-MM-dd"
/>

<p><strong>Start Date:</strong> {booking.startDate || "—"}</p>
<p><strong>End Date (auto-calculated):</strong> {booking.endDate || "—"}</p>
          <label>
            No. of Pax:
            <input
              type="number"
              min="1"
              value={booking.pax}
              onChange={(e) => setBooking({ ...booking, pax: e.target.value })}
            />
          </label>

          <label>
            No. of Rooms:
            <input
              type="number"
              min="1"
              value={booking.rooms || 1}
              onChange={(e) => setBooking({ ...booking, rooms: e.target.value })}
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={booking.vehicleNeeded}
              onChange={(e) =>
                setBooking({
                  ...booking,
                  vehicleNeeded: e.target.checked,
                  vehicleType: e.target.checked ? booking.vehicleType : "",
                })
              }
            />
            Vehicle Needed
          </label>

          {booking.vehicleNeeded && (
            <label>
              Vehicle Type:
              <select
                value={booking.vehicleType}
                onChange={(e) => setBooking({ ...booking, vehicleType: e.target.value })}
                required
              >
                <option value="">-- Select --</option>
                {["Hatchback", "Sedan", "SUV"].map((type) =>
                  itinerary.circuitId?.[`carPrice${type}`] ? (
                    <option key={type} value={type}>
                      {type} (₹{itinerary.circuitId[`carPrice${type}`]}/km)
                    </option>
                  ) : null
                )}
              </select>
            </label>
          )}

          {Array.isArray(itinerary.activities) && itinerary.activities.length > 0 && (
            <div className="activities-section">
              <h3>Optional Activities</h3>
              {itinerary.activities.map((act, i) => (
                <label key={i}>
                  <input
                    type="checkbox"
                    checked={booking.activities.includes(act)}
                    onChange={() => {
                      const newActs = booking.activities.includes(act)
                        ? booking.activities.filter((a) => a !== act)
                        : [...booking.activities, act];
                      setBooking({ ...booking, activities: newActs });
                    }}
                  />
                  {act}
                </label>
              ))}
            </div>
          )}

          <button type="submit">Confirm Booking</button>
        </form>
      </div>
    </div>
  );
}
