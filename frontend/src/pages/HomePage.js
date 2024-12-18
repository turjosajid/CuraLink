import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  return (
    <div className="homepage">
      <header className="header">
        <h1 className="logo">CuraLink</h1>
        <nav className="nav">
          <a href="#home">Home</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
          <Link to="/login" className="login-button">
            Login
          </Link>
        </nav>
      </header>
      <main className="main-content">
        <div className="text-content">
          <h1>Empowering Better Healthcare Outcomes</h1>
          <Link to='/register' className="cta-button">Join Us</Link>
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
