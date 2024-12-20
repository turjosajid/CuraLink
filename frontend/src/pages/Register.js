import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import './Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = { name, email, password, role: role.toLowerCase() };
      await axiosInstance.post('/users/register', userData);
      setMessage('Registration successful! Redirecting to login...');
      
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setRole('');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { state: { message: 'Registration successful! Please login.' } });
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
              <option value="medicalStudent">Medical Student</option>
              <option value="pharmacist">Pharmacist</option>
            </select>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        {message && <p className={message.includes('successful') ? 'success-message' : 'error-message'}>{message}</p>}
      </div>
    </div>
  );
};

export default Register;
