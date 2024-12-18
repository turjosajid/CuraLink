import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import { useAuth } from '../context/AuthContext';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'doctor') {
            navigate('/login');
            return;
        }
        fetchAppointments();
    }, [user, navigate]);

    // Fetch doctor's appointments
    const fetchAppointments = async () => {
        try {
            const response = await axiosInstance.get(`/appointments/doctor/${user._id}`);
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    // Handle prescription creation
    const handlePrescription = async (patientId) => {
        try {
            const prescriptionData = {
                patientId,
                doctorId: user._id,
                diagnosis: 'Sample diagnosis',
                prescription: [{
                    medication: 'Sample medication',
                    dosage: '1 tablet',
                    frequency: 'twice daily',
                    duration: '7 days'
                }]
            };
            await axiosInstance.post('/medical-records', prescriptionData);
            fetchMedicalRecords(patientId);
        } catch (error) {
            console.error('Error creating prescription:', error);
        }
    };

    // Fetch patient's medical records
    const fetchMedicalRecords = async (patientId) => {
        try {
            const response = await axiosInstance.get(`/medical-records/patient/${patientId}`);
            setMedicalRecords(response.data);
        } catch (error) {
            console.error('Error fetching medical records:', error);
        }
    };

    if (!user || user.role !== 'doctor') {
        return null;
    }

    return (
        <div className="doctor-dashboard">
            {user && (
                <div className="doctor-profile">
                    <h2>Doctor Profile</h2>
                    <div className="profile-info">
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                    </div>
                </div>
            )}
            
            <section className="appointments-section">
                <h2>Upcoming Appointments</h2>
                <div className="appointments-list">
                    {appointments.map(appointment => (
                        <div key={appointment._id} className="appointment-card">
                            <h3>Patient: {appointment.patient?.name}</h3>
                            <p>Date: {new Date(appointment.dateTime).toLocaleString()}</p>
                            <p>Reason: {appointment.reason}</p>
                            <button onClick={() => setSelectedPatient(appointment.patient)}>
                                View Patient Details
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {selectedPatient && (
                <section className="patient-details">
                    <h2>Patient Details</h2>
                    <div className="patient-info">
                        <h3>{selectedPatient.name}</h3>
                        <p>Email: {selectedPatient.email}</p>
                        <button onClick={() => handlePrescription(selectedPatient._id)}>
                            Create Prescription
                        </button>
                    </div>

                    <div className="medical-records">
                        <h3>Medical Records</h3>
                        {medicalRecords.map(record => (
                            <div key={record._id} className="record-card">
                                <p>Date: {new Date(record.createdAt).toLocaleDateString()}</p>
                                <p>Diagnosis: {record.diagnosis}</p>
                                <div className="prescriptions">
                                    {record.prescription.map((med, index) => (
                                        <div key={index} className="prescription">
                                            <p>Medication: {med.medication}</p>
                                            <p>Dosage: {med.dosage}</p>
                                            <p>Frequency: {med.frequency}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default DoctorDashboard;
