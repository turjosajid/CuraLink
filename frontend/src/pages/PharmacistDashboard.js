import React, { useState, useEffect, useContext } from 'react';
import { Box, Container, Typography, Paper, Grid, Button, List, ListItem, ListItemText, CircularProgress, TextField } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PharmacistDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newDrug, setNewDrug] = useState({ medicationName: '', stockLevel: '', expirationDate: '' });
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/pharmacists/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch inventory');
      }

      setInventory(data.inventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/pharmacists/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch notifications');
      }

      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addDrug = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pharmacists/inventory/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDrug)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add drug');
      }

      setInventory(data.inventory);
      setNewDrug({ medicationName: '', stockLevel: '', expirationDate: '' });
    } catch (error) {
      console.error('Error adding drug:', error);
    }
  };

  const removeDrug = async (drugId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/pharmacists/inventory/remove/${drugId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove drug');
      }

      setInventory(data.inventory);
    } catch (error) {
      console.error('Error removing drug:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInventory();
      fetchNotifications();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
      <Typography sx={{ ml: 2 }}>Loading...</Typography>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: (theme) => theme.palette.grey[100],
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper sx={{ mb: 4, p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <Typography variant="h4">Pharmacist Dashboard</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">Welcome, {user.name}</Typography>
              <Button variant="outlined" color="error" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Inventory</Typography>
              <List>
                {inventory.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.medicationName}
                      secondary={`Stock Level: ${item.stockLevel}, Expiration Date: ${new Date(item.expirationDate).toLocaleDateString()}`}
                    />
                    <Button variant="outlined" color="error" onClick={() => removeDrug(item._id)}>
                      Remove
                    </Button>
                  </ListItem>
                ))}
              </List>
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Medication Name"
                  value={newDrug.medicationName}
                  onChange={(e) => setNewDrug({ ...newDrug, medicationName: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Stock Level"
                  value={newDrug.stockLevel}
                  onChange={(e) => setNewDrug({ ...newDrug, stockLevel: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Expiration Date"
                  type="date"
                  value={newDrug.expirationDate}
                  onChange={(e) => setNewDrug({ ...newDrug, expirationDate: e.target.value })}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <Button variant="contained" color="primary" onClick={addDrug} sx={{ mt: 2 }}>
                  Add Drug
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Notifications</Typography>
              <List>
                {notifications.map((notification, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={notification} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PharmacistDashboard;
