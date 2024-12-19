import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import { useAuth } from '../context/AuthContext';
import './PatientDashboard.css';

const PatientDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'patient') {
            navigate('/login');
            return;
        }
        fetchAppointments();
        fetchMedicalRecords();
        fetchDoctors();
    }, [user, navigate]);

    const fetchAppointments = async () => {
        try {
            const response = await axiosInstance.get(`/appointments/patient/${user._id}`);
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const fetchMedicalRecords = async () => {
        try {
            const response = await axiosInstance.get(`/medical-records/patient/${user._id}`);
            setMedicalRecords(response.data);
        } catch (error) {
            console.error('Error fetching medical records:', error);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await axiosInstance.get('/doctors');
            setDoctors(response.data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    const handleBookAppointment = async () => {
        try {
            if (!selectedDoctor || !selectedDate) {
                alert('Please select both doctor and date');
                return;
            }

            const appointmentData = {
                doctorId: selectedDoctor._id,
                patientId: user._id,
                dateTime: selectedDate,
                reason: 'Regular checkup'
            };

            await axiosInstance.post('/appointments/book', appointmentData);
            fetchAppointments();
            setSelectedDoctor(null);
            setSelectedDate('');
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Failed to book appointment. Please try again.');
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        try {
            await axiosInstance.patch(`/appointments/${appointmentId}`, {
                status: 'cancelled'
            });
            fetchAppointments();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('Failed to cancel appointment. Please try again.');
        }
    };

    if (!user || user.role !== 'patient') {
        return null;
    }

    return (
        <div className="patient-dashboard">
            <h1>Patient Dashboard</h1>

            <section className="book-appointment">
                <h2>Book New Appointment</h2>
                <div className="booking-form">
                    <select 
                        value={selectedDoctor ? selectedDoctor._id : ''} 
                        onChange={(e) => setSelectedDoctor(doctors.find(d => d._id === e.target.value))}
                    >
                        <option value="">Select Doctor</option>
                        {doctors.map(doctor => (
                            <option key={doctor._id} value={doctor._id}>
                                Dr. {doctor.name} - {doctor.specialization}
                            </option>
                        ))}
                    </select>
                    <input
                        type="datetime-local"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <button onClick={handleBookAppointment}>Book Appointment</button>
                </div>
            </section>

            <section className="appointments-section">
                <h2>Your Appointments</h2>
                <div className="appointments-list">
                    {appointments.map(appointment => (
                        <div key={appointment._id} className="appointment-card" data-status={appointment.status}>
                            <h3>Dr. {appointment.doctor?.name}</h3>
                            <p>Date: {new Date(appointment.dateTime).toLocaleString()}</p>
                            <p>Status: {appointment.status}</p>
                            {appointment.status === 'scheduled' && (
                                <button onClick={() => handleCancelAppointment(appointment._id)}>
                                    Cancel Appointment
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <section className="medical-records-section">
                <h2>Medical Records</h2>
                <div className="records-list">
                    {medicalRecords.map(record => (
                        <div key={record._id} className="record-card">
                            <div className="record-header">
                                <h3>Dr. {record.doctor?.name}</h3>
                                <p>Date: {new Date(record.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="record-details">
                                <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                                <div className="prescriptions">
                                    <h4>Prescriptions:</h4>
                                    {record.prescription.map((med, index) => (
                                        <div key={index} className="prescription">
                                            <p>{med.medication} - {med.dosage}</p>
                                            <p>Take {med.frequency} for {med.duration}</p>
                                        </div>
                                    ))}
                                </div>
                                {record.notes && (
                                    <div className="notes">
                                        <h4>Notes:</h4>
                                        <p>{record.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default PatientDashboard;
