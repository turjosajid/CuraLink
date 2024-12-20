import React, { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import axiosInstance from '../config/axios';
import './Dashboard.css';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appointmentsResponse, prescriptionsResponse] = await Promise.all([
          axiosInstance.get('/appointments/patient'),
          axiosInstance.get('/prescriptions/patient')
        ]);
        setAppointments(appointmentsResponse.data);
        setPrescriptions(prescriptionsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <Topbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Patient Dashboard</h1>
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>My Appointments</h2>
            <div className="card-content">
              {appointments.length > 0 ? (
                <ul>
                  {appointments.map(appointment => (
                    <li key={appointment.id}>
                      <h3>Dr. {appointment.doctorName}</h3>
                      <p>Date: {new Date(appointment.date).toLocaleDateString()}</p>
                      <p>Time: {appointment.time}</p>
                      <button className="primary-button">Reschedule</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No upcoming appointments.</p>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <h2>My Prescriptions</h2>
            <div className="card-content">
              {prescriptions.length > 0 ? (
                <ul>
                  {prescriptions.map(prescription => (
                    <li key={prescription.id}>
                      <h3>Medicine: {prescription.medicineName}</h3>
                      <p>Prescribed by: Dr. {prescription.doctorName}</p>
                      <p>Status: {prescription.status}</p>
                      <button className="secondary-button">View Details</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No active prescriptions.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
