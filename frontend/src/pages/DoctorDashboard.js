import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import axiosInstance from '../config/axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import EditProfileModal from '../components/EditProfileModal';
import AppointmentSlotsModal from '../components/AppointmentSlotsModal';

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, logout, updateUserData } = useAuth();  // Add updateUserData
    const navigate = useNavigate();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showSlotsModal, setShowSlotsModal] = useState(false);
    const [appointmentSlots, setAppointmentSlots] = useState([]);

    useEffect(() => {
        if (!user || user.role !== 'doctor') {
            navigate('/login');
            return;
        }
        fetchDashboardData();
        if (user) {
            fetchAppointmentSlots();
        }
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        try {
            const [appointmentsResponse, patientsResponse] = await Promise.all([
                axiosInstance.get(`/appointments/doctor/${user._id}`),
                axiosInstance.get('/patients/doctor')
            ]);
            setAppointments(appointmentsResponse.data);
            setPatients(patientsResponse.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointmentSlots = async () => {
        try {
            const response = await axiosInstance.get(`/doctors/${user._id}/slots`);
            if (Array.isArray(response.data)) {
                setAppointmentSlots(response.data);
            } else {
                setAppointmentSlots([]);
            }
        } catch (error) {
            console.error('Error fetching appointment slots:', error);
            setAppointmentSlots([]);
        }
    };

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

    const fetchMedicalRecords = async (patientId) => {
        try {
            const response = await axiosInstance.get(`/medical-records/patient/${patientId}`);
            setMedicalRecords(response.data);
        } catch (error) {
            console.error('Error fetching medical records:', error);
        }
    };

    const handleProfileUpdate = async (updatedData) => {
        try {
            const response = await axiosInstance.put(`/doctors/${user._id}/profile`, updatedData);
            if (response.data) {
                await updateUserData();  // Update the user data in context
                setShowEditModal(false);
                // Optional: Show success message
                alert('Profile updated successfully');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    const handleSaveSlots = async (slots) => {
        try {
            console.log('Attempting to save slots:', slots);
            
            const response = await axiosInstance.put(`/doctors/${user._id}/slots`, {
                slots: slots
            });

            console.log('Server response:', response);

            if (response.data) {
                setAppointmentSlots(response.data);
                setShowSlotsModal(false);
                alert('Appointment slots updated successfully');
            }
        } catch (error) {
            console.error('Full error:', error);
            console.error('Error response:', error.response);
            alert(
                error.response?.data?.message || 
                'Failed to update appointment slots. Please try again.'
            );
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user || user.role !== 'doctor') {
        return null;
    }

    if (loading) {
        return <div className="dashboard-loading">Loading...</div>;
    }

    return (
        <div className="dashboard-wrapper">
            <Topbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>Welcome Dr. {user.name}</h1>
                </div>
                
                <div className="dashboard-grid">
                    <div className="dashboard-card profile-card">
                        <h2>Doctor Profile</h2>
                        <div className="profile-content">
                            <div className="doctor-name">
                                <h3>Dr. {user.name}</h3>
                                {user.specialization && <span className="specialization">{user.specialization}</span>}
                            </div>
                            <h4>Education</h4>
                            {user.education && user.education.length > 0 ? (
                                user.education.map((edu, index) => (
                                    <div key={index} className="education-item">
                                        <p>{edu.degree} - {edu.institution} ({edu.year})</p>
                                    </div>
                                ))
                            ) : (
                                <p>No education details added</p>
                            )}
                            <div className="profile-actions">
                                <button 
                                    className="edit-profile-button"
                                    onClick={() => setShowEditModal(true)}
                                >
                                    Edit Profile
                                </button>
                                <button 
                                    className="manage-slots-button"
                                    onClick={() => setShowSlotsModal(true)}
                                >
                                    Manage Appointment Slots
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <h2>Upcoming Appointments</h2>
                        <div className="card-content">
                            {appointments.length > 0 ? (
                                <ul>
                                    {appointments.map(appointment => (
                                        <li key={appointment._id}>
                                            <h3>Patient: {appointment.patient?.name}</h3>
                                            <p>Date: {new Date(appointment.dateTime).toLocaleString()}</p>
                                            <p>Reason: {appointment.reason}</p>
                                            <button className="primary-button" onClick={() => setSelectedPatient(appointment.patient)}>
                                                View Details
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No upcoming appointments.</p>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <h2>Patient List</h2>
                        <div className="card-content">
                            {patients.length > 0 ? (
                                <ul>
                                    {patients.map(patient => (
                                        <li key={patient._id}>
                                            <h3>{patient.name}</h3>
                                            <p>Last Visit: {patient.lastVisit || 'N/A'}</p>
                                            <button className="secondary-button" onClick={() => setSelectedPatient(patient)}>
                                                View Records
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No patients found.</p>
                            )}
                        </div>
                    </div>
                </div>

                {selectedPatient && (
                    <section className="patient-details">
                        <h2>Patient Details</h2>
                        <div className="patient-info">
                            <h3>{selectedPatient.name}</h3>
                            <p>Email: {selectedPatient.email}</p>
                            <button 
                                className="primary-button"
                                onClick={() => handlePrescription(selectedPatient._id)}
                            >
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

            <EditProfileModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSave={handleProfileUpdate}
                initialData={{
                    specialization: user.specialization || '',
                    education: user.education || []
                }}
            />

            <AppointmentSlotsModal
                show={showSlotsModal}
                onClose={() => setShowSlotsModal(false)}
                onSave={handleSaveSlots}
                initialSlots={appointmentSlots}
            />
        </div>
    );
};

export default DoctorDashboard;
