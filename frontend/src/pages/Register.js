import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h4" component="h1">Register</Typography>
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <MenuItem value="patient">Patient</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
              <MenuItem value="pharmacist">Pharmacist</MenuItem>
              <MenuItem value="student">Medical Student</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            fullWidth
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Already have an account? <Link to="/login">Log in</Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
