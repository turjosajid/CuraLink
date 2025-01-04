import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Container, Typography, Paper, Grid, Button, List, ListItem, 
  ListItemText, CircularProgress, Avatar, Card, CardContent, CardHeader, Chip, TextField, Alert, Link
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const [patientProfile, setPatientProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportFile, setReportFile] = useState(null);
  const [reportName, setReportName] = useState('');
  const [selectedFileName, setSelectedFileName] = useState(''); // Add state for selected file name
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

  useEffect(() => {
    if (token) {
      fetchPatientProfile();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFileChange = (e) => {
    setReportFile(e.target.files[0]);
    setSelectedFileName(e.target.files[0]?.name || ''); // Update selected file name
  };

  const handleUploadReport = async () => {
    if (!reportFile || !reportName) {
      setError('Please provide a report name and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('report', reportFile);
    formData.append('reportName', reportName);

    try {
      const response = await fetch(`http://localhost:5000/api/patients/${patientProfile._id}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload report');
      }

      setPatientProfile((prevProfile) => ({
        ...prevProfile,
        medicalReports: [...prevProfile.medicalReports, data]
      }));
      setReportFile(null);
      setReportName('');
      setSelectedFileName(''); // Reset selected file name
    } catch (error) {
      console.error('Error uploading report:', error);
      setError('Failed to upload report. Please try again.');
    }
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
              <CardHeader title="Medical Reports" />
              <CardContent>
                <List>
                  {patientProfile.medicalReports?.map((report, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={report.reportName}
                        secondary={new Date(report.date).toLocaleDateString()}
                      />
                      <Link href={report.reportUrl} target="_blank" rel="noopener noreferrer">
                        View Report
                      </Link>
                    </ListItem>
                  ))}
                </List>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Report Name"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    component="label"
                    fullWidth
                  >
                    Select PDF File
                    <input
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>
                  {selectedFileName && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected file: {selectedFileName}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleUploadReport}
                  >
                    Upload Report
                  </Button>
                </Box>
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
