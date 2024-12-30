import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Container, Typography, Paper, Grid, Button, List, ListItem, 
  ListItemText, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, CircularProgress, Stack, Divider, IconButton as MuiIconButton,
  List as MuiList, ListItem as MuiListItem, 
  ListItemSecondaryAction, Card, CardContent, CardHeader, Avatar, Chip,
  useTheme, Tooltip, Badge, MenuItem 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import TimerIcon from '@mui/icons-material/Timer';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { parseISO, format } from 'date-fns';

const DoctorDashboard = () => {
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Add new state for education and certificates
  const [newEducation, setNewEducation] = useState({ degree: '', institute: '', year: '' });
  const [newCertificate, setNewCertificate] = useState({ name: '', issuer: '', year: '' });

  // Add new state for time slots
  const [timeSlots, setTimeSlots] = useState([]);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day: 'Monday',
    startTime: null,
    endTime: null
  });

  const fetchDoctorProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/doctors/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 && data.status === 'PROFILE_NOT_FOUND') {
          setError({
            type: 'PROFILE_NOT_FOUND',
            message: 'Please complete your doctor profile registration.',
            action: 'register'
          });
        } else if (response.status === 403) {
          setError({
            type: 'NOT_AUTHORIZED',
            message: 'You are not authorized as a doctor.',
            action: 'redirect'
          });
        } else {
          throw new Error(data.message || 'Failed to fetch profile');
        }
        return;
      }

      setDoctorProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError({
        type: 'FETCH_ERROR',
        message: 'Failed to load doctor profile. Please try again.',
        action: 'retry'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctors/time-slots', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = await response.json();
      setTimeSlots(data.timeSlots || []);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDoctorProfile();
      fetchTimeSlots();
    }
  }, [token]);

  const handleRetry = () => {
    if (token) {
      fetchDoctorProfile();
    }
  };

  const handleEdit = () => {
    setEditedProfile({ ...doctorProfile });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctors/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedProfile)
      });

      if (!response.ok) throw new Error('Update failed');
      
      const updatedProfile = await response.json();
      setDoctorProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditedProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle education changes
  const handleAddEducation = () => {
    setEditedProfile(prev => ({
      ...prev,
      education: [...(prev.education || []), newEducation]
    }));
    setNewEducation({ degree: '', institute: '', year: '' });
  };

  const handleRemoveEducation = (index) => {
    setEditedProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // Handle certificate changes
  const handleAddCertificate = () => {
    setEditedProfile(prev => ({
      ...prev,
      certificates: [...(prev.certificates || []), newCertificate]
    }));
    setNewCertificate({ name: '', issuer: '', year: '' });
  };

  const handleRemoveCertificate = (index) => {
    setEditedProfile(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
  };

  // Handle time slot changes
  const handleSlotSubmit = async () => {
    if (!newSlot.startTime || !newSlot.endTime) return;

    const formattedSlot = {
      day: newSlot.day,
      startTime: format(new Date(newSlot.startTime), 'HH:mm'),
      endTime: format(new Date(newSlot.endTime), 'HH:mm'),
      isAvailable: true
    };

    const updatedSlots = [...timeSlots, formattedSlot];

    try {
      await fetch('http://localhost:5000/api/doctors/time-slots', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ timeSlots: updatedSlots })
      });

      setTimeSlots(updatedSlots);
      setShowSlotDialog(false);
      setNewSlot({ day: 'Monday', startTime: null, endTime: null });
    } catch (error) {
      console.error('Error updating time slots:', error);
    }
  };

  const handleDeleteSlot = async (index) => {
    const updatedSlots = timeSlots.filter((_, i) => i !== index);
    
    try {
      await fetch('http://localhost:5000/api/doctors/time-slots', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ timeSlots: updatedSlots })
      });

      setTimeSlots(updatedSlots);
    } catch (error) {
      console.error('Error deleting time slot:', error);
    }
  };

  // Add logout handler
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
      <Typography color="error" gutterBottom>{error.message}</Typography>
      {error.action === 'retry' && (
        <Button variant="contained" onClick={handleRetry} sx={{ mt: 2 }}>
          Retry Loading
        </Button>
      )}
      {error.action === 'register' && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/doctor/register')} 
          sx={{ mt: 2 }}
        >
          Complete Registration
        </Button>
      )}
      {error.action === 'redirect' && (
        <Button variant="contained" color="primary" href="/" sx={{ mt: 2 }}>
          Go to Home
        </Button>
      )}
    </Box>
  );

  if (!doctorProfile) return (
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
                  {doctorProfile.specialization}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography>Experience: {doctorProfile.experience} years</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography>License: {doctorProfile.license}</Typography>
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                      About
                    </Typography>
                    <Typography paragraph>{doctorProfile.about}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Languages
                    </Typography>
                    <Box sx={{ mt: 1, mb: 2 }}>
                      {doctorProfile.languages?.map((lang) => (
                        <Chip 
                          key={lang} 
                          label={lang} 
                          sx={{ mr: 1, mb: 1 }} 
                          size="small"
                        />
                      ))}
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Address
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                      <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography>
                        {`${doctorProfile.address?.street}, ${doctorProfile.address?.city}`}<br />
                        {`${doctorProfile.address?.state}, ${doctorProfile.address?.country}`}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Quick Stats" />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      ${doctorProfile.fees}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Consultation Fee
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {doctorProfile.patients?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Patients
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Update Education & Certificates Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Education & Certificates"
                action={
                  <IconButton onClick={handleEdit}>
                    <EditIcon />
                  </IconButton>
                }
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Education
                </Typography>
                <List>
                  {doctorProfile.education?.map((edu, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1">
                            {edu.degree}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {`${edu.institute} - ${edu.year}`}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Certificates
                </Typography>
                <List>
                  {doctorProfile.certificates?.map((cert, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1">
                            {cert.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {`${cert.issuer} - ${cert.year}`}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Patients List */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <GroupIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Patients</Typography>
                  </Box>
                }
              />
              <CardContent>
                <List>
                  {doctorProfile.patients.map((patient) => (
                    <ListItem 
                      key={patient._id}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          borderRadius: 1
                        }
                      }}
                    >
                      <ListItemText 
                        primary={patient.name}
                        secondary={patient.email}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Appointment Slots */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimerIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Appointment Slots</Typography>
                  </Box>
                }
                action={
                  <Button
                    variant="contained"
                    onClick={() => setShowSlotDialog(true)}
                  >
                    Add Slot
                  </Button>
                }
              />
              <CardContent>
                <List>
                  {timeSlots.map((slot, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleDeleteSlot(index)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={slot.day}
                        secondary={`${slot.startTime} - ${slot.endTime}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Edit Dialog remains unchanged */}
        <Dialog open={isEditing} onClose={() => setIsEditing(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Specialization"
                    name="specialization"
                    value={editedProfile?.specialization || ''}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="License Number"
                    name="license"
                    value={editedProfile?.license || ''}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Years of Experience"
                    name="experience"
                    value={editedProfile?.experience || ''}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Consultation Fee"
                    name="fees"
                    value={editedProfile?.fees || ''}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="About"
                    name="about"
                    value={editedProfile?.about || ''}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Languages (comma-separated)"
                    name="languages"
                    value={editedProfile?.languages?.join(', ') || ''}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      languages: e.target.value.split(',').map(lang => lang.trim())
                    })}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                {/* Address Fields */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Address</Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street"
                    name="address.street"
                    value={editedProfile?.address?.street || ''}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="address.city"
                    value={editedProfile?.address?.city || ''}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="State"
                    name="address.state"
                    value={editedProfile?.address?.state || ''}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="address.country"
                    value={editedProfile?.address?.country || ''}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Zip Code"
                    name="address.zipCode"
                    value={editedProfile?.address?.zipCode || ''}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                {/* Education Section */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>Education</Typography>
                  <Stack spacing={2}>
                    {editedProfile?.education?.map((edu, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography>{`${edu.degree} - ${edu.institute} (${edu.year})`}</Typography>
                        <IconButton size="small" onClick={() => handleRemoveEducation(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          label="Degree"
                          value={newEducation.degree}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          label="Institute"
                          value={newEducation.institute}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, institute: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <TextField
                          fullWidth
                          label="Year"
                          value={newEducation.year}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, year: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Button 
                          variant="contained" 
                          onClick={handleAddEducation}
                          disabled={!newEducation.degree || !newEducation.institute || !newEducation.year}
                        >
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                  </Stack>
                </Grid>

                {/* Certificates Section */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>Certificates</Typography>
                  <Stack spacing={2}>
                    {editedProfile?.certificates?.map((cert, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography>{`${cert.name} - ${cert.issuer} (${cert.year})`}</Typography>
                        <IconButton size="small" onClick={() => handleRemoveCertificate(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          label="Certificate Name"
                          value={newCertificate.name}
                          onChange={(e) => setNewCertificate(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          label="Issuer"
                          value={newCertificate.issuer}
                          onChange={(e) => setNewCertificate(prev => ({ ...prev, issuer: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <TextField
                          fullWidth
                          label="Year"
                          value={newCertificate.year}
                          onChange={(e) => setNewCertificate(prev => ({ ...prev, year: e.target.value }))}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Button 
                          variant="contained" 
                          onClick={handleAddCertificate}
                          disabled={!newCertificate.name || !newCertificate.issuer || !newCertificate.year}
                        >
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Add Slot Dialog */}
        <Dialog open={showSlotDialog} onClose={() => setShowSlotDialog(false)}>
          <DialogTitle>Add Time Slot</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                select
                fullWidth
                label="Day"
                value={newSlot.day}
                onChange={(e) => setNewSlot(prev => ({ ...prev, day: e.target.value }))}
                sx={{ mb: 2 }}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </TextField>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Start Time"
                  value={newSlot.startTime}
                  onChange={(newValue) => setNewSlot(prev => ({ ...prev, startTime: newValue }))}
                  slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
                />
                <TimePicker
                  label="End Time"
                  value={newSlot.endTime}
                  onChange={(newValue) => setNewSlot(prev => ({ ...prev, endTime: newValue }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSlotDialog(false)}>Cancel</Button>
            <Button onClick={handleSlotSubmit} variant="contained">Add</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default DoctorDashboard;
