import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Container, Typography, Paper, Grid, Button, List, ListItem, 
  ListItemText, CircularProgress, Avatar, Card, CardContent, CardHeader, Chip, Input, IconButton
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const [patientProfile, setPatientProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchPatientProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/patients/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        // Instead of redirecting to registration, show error
        throw new Error(data.message || 'Failed to fetch profile');
      }

      setPatientProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load patient profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Uploading file:', file.name);
      const response = await fetch('http://localhost:5000/api/patients/upload-report', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setPatientProfile(prev => ({
        ...prev,
        medicalReports: [...(prev.medicalReports || []), data.report]
      }));
    } catch (error) {
      console.error('Upload error details:', error);
      setError(error.message || 'Failed to upload report');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPatientProfile();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
      <Typography sx={{ ml: 2 }}>Loading profile...</Typography>
    </Box>
  );

  if (error) return (
    <Box display="flex" flexDirection="column" alignItems="center" minHeight="80vh" padding={4}>
      <Typography color="error" gutterBottom>{error}</Typography>
      <Button variant="contained" onClick={fetchPatientProfile} sx={{ mt: 2 }}>
        Retry Loading
      </Button>
    </Box>
  );

  if (!patientProfile) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Typography>No profile data available</Typography>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: (theme) => theme.palette.grey[100],
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Card sx={{ mb: 4, p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{ 
                  width: 64, 
                  height: 64,
                  bgcolor: (theme) => theme.palette.primary.main 
                }}
              >
                {user.name[0]}
              </Avatar>
              <Box>
                <Typography variant="h4">{user.name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {patientProfile.email}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Card>

        <Grid container spacing={3}>
          {/* Profile Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Profile Information" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                      Phone
                    </Typography>
                    <Typography paragraph>{patientProfile.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Address
                    </Typography>
                    <Box sx={{ mt: 1, mb: 2 }}>
                      <Typography>
                        {`${patientProfile.address?.street}, ${patientProfile.address?.city}`}<br />
                        {`${patientProfile.address?.state}, ${patientProfile.address?.country}`}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Medical History */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Medical History" />
              <CardContent>
                <List>
                  {patientProfile.medicalHistory?.map((history, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={history.description}
                        secondary={new Date(history.date).toLocaleDateString()}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Medical Reports */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Medical Reports"
                action={
                  <>
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      id="upload-medical-report"
                    />
                    <label htmlFor="upload-medical-report">
                      <Button
                        component="span"
                        startIcon={<UploadFileIcon />}
                        variant="contained"
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading...' : 'Upload Report'}
                      </Button>
                    </label>
                  </>
                }
              />
              <CardContent>
                <List>
                  {patientProfile.medicalReports?.map((report, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="view"
                          onClick={() => window.open(report.reportUrl, '_blank')}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={report.reportName}
                        secondary={new Date(report.date).toLocaleDateString()}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Appointments */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Appointments" />
              <CardContent>
                <List>
                  {patientProfile.appointments?.map((appointment, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`Appointment on ${new Date(appointment.date).toLocaleDateString()}`}
                        secondary={`Status: ${appointment.status}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PatientDashboard;
