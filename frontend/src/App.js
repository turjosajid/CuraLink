import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/home";
import LoginPage from "./pages/login";
import Register from "./pages/Register";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorRegistration from './pages/DoctorRegistration';
import PatientDashboard from './pages/PatientDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import { AuthProvider, useAuth } from "./context/AuthContext";

// Protected Route Component
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/doctor/dashboard" 
            element={
              <PrivateRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/doctor/register" 
            element={
              <PrivateRoute allowedRoles={['doctor']}>
                <DoctorRegistration />
              </PrivateRoute>
            }
          />
          <Route 
            path="/patient/dashboard" 
            element={
              <PrivateRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </PrivateRoute>
            }
          />
          <Route 
            path="/pharmacist/dashboard" 
            element={
              <PrivateRoute allowedRoles={['pharmacist']}>
                <PharmacistDashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
