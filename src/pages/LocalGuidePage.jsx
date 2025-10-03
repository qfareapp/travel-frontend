// src/pages/LocalGuidePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./LocalGuidePage.css";
import { API_BASE } from "../config";

const toUrl = (p) => {
  if (!p) return "/placeholder-circuit.jpg";
  if (typeof p === "object" && p !== null)
    p = p.url || p.path || p.src || p.href || "";
  if (!p) return "/placeholder-circuit.jpg";
  if (/^https?:\/\//i.test(p)) return p;
  const clean = String(p).replace(/^\.?\//, "").replace(/\\/g, "/");
  const base = API_BASE.replace(/\/+$/, "");
  const path = clean.startsWith("/") ? clean : `/${clean}`;
  return `${base}${path}`;
};

function StarDisplay({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  const empties = 5 - full - (half ? 1 : 0);
  return (
    <div className="stars" aria-label={`Rating ${v} out of 5`}>
      {"★".repeat(full)}
      {half ? "☆" : ""}
      {"✩".repeat(empties)}
      <span className="stars-num">{v ? v.toFixed(1) : "New"}</span>
    </div>
  );
}

export default function LocalGuidePage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(state?.guide || null);
  const [loading, setLoading] = useState(!state?.guide);

  useEffect(() => {
    if (!guide) {
      // only try backend fetch if state not provided
      axios
        .get(`${API_BASE}/api/guides/${id}`)
        .then((res) => setGuide(res.data))
        .catch((err) =>
          console.error("❌ Failed to fetch guide:", err.message)
        )
        .finally(() => setLoading(false));
    }
  }, [id, guide]);


  if (loading) return <div className="container">Loading...</div>;
  if (!guide) return <div className="container">Guide not found.</div>;

  return (
    <div className="container guide-page">
      <button className="btn-ghost" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="guide-header">
        <img
          src={toUrl(guide.image)}
          alt={guide.name}
          onError={(e) => (e.currentTarget.src = "/placeholder-circuit.jpg")}
        />
        <div className="guide-info">
          <h1>{guide.name}</h1>
          <div className="guide-loc">{guide.location || "—"}</div>
          {guide.rating && <StarDisplay value={guide.rating} />}
          {guide.bio && <p className="guide-bio">{guide.bio}</p>}
        </div>
      </div>

      <section className="card">
        <h2>Contact Info</h2>
        {guide.contact ? (
          <p className="contact">{guide.contact}</p>
        ) : (
          <p className="muted">
            Contact details will be shared once your booking is confirmed.
          </p>
        )}
      </section>

      <section className="card">
  <h2>Associated Itineraries</h2>
  {Array.isArray(guide.itineraries) && guide.itineraries.length > 0 ? (
    <ul className="itin-list">
      {guide.itineraries.map((it) => (
        <li
          key={it._id}
          onClick={() =>
            navigate(`/itineraries/${it._id}`, { state: { itinerary: it } })
          }
          className="link"
        >
          {it.title}
        </li>
      ))}
    </ul>
  ) : (
    <p className="muted">No itineraries linked yet.</p>
  )}
</section>
    </div>
  );
}
