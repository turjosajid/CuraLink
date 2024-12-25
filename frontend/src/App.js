import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/home";
import LoginPage from "./pages/login";
import Register from "./pages/Register";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorRegistration from './pages/DoctorRegistration';
import { AuthProvider, useAuth } from "./context/AuthContext";

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'doctor') return <Navigate to="/" />;
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
              <PrivateRoute>
                <DoctorDashboard />
              </PrivateRoute>
            } 
          />
          <Route path="/doctor/register" element={<DoctorRegistration />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
