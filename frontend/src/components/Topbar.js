import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Topbar.css';

const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="topbar">
      <div className="topbar-logo">CURALINK</div>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Topbar;
