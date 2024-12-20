import React, { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import axiosInstance from '../config/axios';
import './Dashboard.css';

const PharmacistDashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [prescriptionsResponse, inventoryResponse] = await Promise.all([
          axiosInstance.get('/prescriptions/pending'),
          axiosInstance.get('/inventory')
        ]);
        setPrescriptions(prescriptionsResponse.data);
        setInventory(inventoryResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handlePrescriptionUpdate = async (prescriptionId, status) => {
    try {
      await axiosInstance.put(`/prescriptions/${prescriptionId}`, { status });
      // Refresh prescriptions list
      const response = await axiosInstance.get('/prescriptions/pending');
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error updating prescription:', error);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <Topbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Pharmacist Dashboard</h1>
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Pending Prescriptions</h2>
            <div className="card-content">
              {prescriptions.length > 0 ? (
                <ul>
                  {prescriptions.map(prescription => (
                    <li key={prescription.id} className="prescription-item">
                      <h3>Patient: {prescription.patientName}</h3>
                      <p>Medicine: {prescription.medicineName}</p>
                      <p>Dosage: {prescription.dosage}</p>
                      <div className="action-buttons">
                        <button 
                          className="approve-button"
                          onClick={() => handlePrescriptionUpdate(prescription.id, 'approved')}
                        >
                          Approve
                        </button>
                        <button 
                          className="reject-button"
                          onClick={() => handlePrescriptionUpdate(prescription.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No pending prescriptions.</p>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <h2>Inventory Management</h2>
            <div className="card-content">
              {inventory.length > 0 ? (
                <ul>
                  {inventory.map(item => (
                    <li key={item.id} className="inventory-item">
                      <h3>{item.medicineName}</h3>
                      <p>Stock: {item.quantity}</p>
                      <p>Status: {item.quantity < item.minThreshold ? 
                        <span className="low-stock">Low Stock</span> : 
                        <span className="in-stock">In Stock</span>}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No inventory items found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;
