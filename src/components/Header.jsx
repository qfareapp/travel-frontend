// src/components/Header.jsx
import React from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaUserCircle, FaShoppingCart } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="header">
      {/* Left: Logo + Menu */}
      <div className="header-left">
        <Link to="/" className="logo">
          <img src="/images/logo.png" alt="Togo Logo" />
          <span>togo</span>
        </Link>

        <nav className="nav-menu">
          <div className="menu-item">Demo ▾</div>
          <div className="menu-item">Destinations ▾</div>
          <div className="menu-item">Tour Listing ▾</div>
          <div className="menu-item">Pages ▾</div>
        </nav>
      </div>

      {/* Right: Icons + Call Button */}
      <div className="header-right">
        <FaShoppingCart className="header-icon" />
        <FaUserCircle className="header-icon" />
        <a href="tel:+002326777" className="call-btn">
          <FaPhoneAlt className="phone-icon" />
          +00 232 6777
        </a>
      </div>
    </header>
  );
};

export default Header;
