import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  return (
    <div className="homepage">
      <header className="header">
        <h1 className="logo">CuraLink</h1>
        <nav className="nav">
          <Link to="/login" className="login-button">
            Login
          </Link>
        </nav>
      </header>
      <main className="main-content">
        <div className="text-content">
          <h1>Empowering Better Healthcare Outcomes</h1>
          <p className="subtitle">Connect, collaborate, and transform healthcare delivery with our innovative platform.</p>
          <Link to='/register' className="cta-button">Get Started</Link>
        </div>
        <div className="image-content">
          <img
            src="/homepageimg.png"
            alt="Doctor"
            className="doctor-image"
          />
        </div>
      </main>
    </div>
  );
}

export default HomePage;
