// src/pages/CircuitDetailsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config";
import "./CircuitDetailsPage.css";


const toUrl = (p) => {
  if (!p) return "/placeholder-circuit.jpg";
  if (typeof p === "object" && p !== null) p = p.url || p.path || p.src || p.href || "";
  if (!p) return "/placeholder-circuit.jpg";
  if (/^https?:\/\//i.test(p)) return p;
  const clean = String(p).replace(/^\.?\//, "").replace(/\\/g, "/");
  return `${API_BASE}/${clean}`;
};

function ItineraryCard({ itin, onClick }) {
  return (
    <div className="package-card" onClick={onClick}>
      <div className="card-media">
        <img src={toUrl(itin.image)} alt={itin.title} loading="lazy" />
      </div>
      <div className="card-body">
        <h3 className="card-title">{itin.title}</h3>
        <p className="card-subtitle">
          {itin.durationDays || "—"}N /{" "}
          {itin.durationDays ? itin.durationDays + 1 : "—"}D
        </p>
        {itin.budgetMin && itin.budgetMax && (
          <div className="price-box">
            <span className="price">
              ₹{itin.budgetMin} – ₹{itin.budgetMax}
            </span>
            <span className="per-person">per person</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CircuitDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [circuit, setCircuit] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/circuits/${id}`);
        setCircuit(res.data || null);
        setItineraries(res.data?.itineraries || []);
      } catch (e) {
        console.error("Fetch failed:", e.message);
        setCircuit(null);
        setItineraries([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const filtered = useMemo(() => {
    if (activeTab === "all") return itineraries;
    return itineraries.filter((it) => it.theme?.toLowerCase() === activeTab);
  }, [itineraries, activeTab]);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "60px" }}>Loading...</p>;

  return (
    <div className="circuit-page">
      {/* Hero */}
      <div className="hero-banner">
  <img
    src={circuit?.img ? `${API_BASE}${circuit.img}` : "/default-hero.jpg"}
    alt={circuit?.name || "Circuit"}
    className="hero-img"
    onError={(e) => {
      e.currentTarget.src = "/default-hero.jpg";
    }}
  />
  <div className="hero-text">
    <h1>{circuit?.name || "Circuit Packages"}</h1>
  </div>
</div>

      <div className="content-wrap">
        {/* Filters */}
        <aside className="filters">
          <h3>Filters</h3>
          <div className="filter-group">
            <label>Duration (in Nights)</label>
            <input type="range" min="1" max="10" />
          </div>
          <div className="filter-group">
            <label>Budget</label>
            <input type="range" min="5000" max="100000" />
          </div>
        </aside>

        {/* Main */}
        <main className="packages">
          <header className="packages-header">
            <div className="tabs">
              {["all", "offbeat", "city", "mixed"].map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "all"
                    ? "All Packages"
                    : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="sort">
              <label>Sorted By:</label>
              <select>
                <option value="popular">Popular</option>
                <option value="price">Price</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </header>

          {filtered.length ? (
            <div className="card-grid">
              {filtered.map((itin) => (
                <ItineraryCard
                  key={itin._id}
                  itin={itin}
                  onClick={() => navigate(`/itineraries/${itin._id}`)}
                />
              ))}
            </div>
          ) : (
            <p>No itineraries available.</p>
          )}
        </main>
      </div>
    </div>
  );
}
