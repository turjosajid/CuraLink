import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Container, Typography, Paper, Grid, Button, List, ListItem, 
  ListItemText, CircularProgress, Card, CardContent, CardHeader, Avatar, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Divider, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import QuizIcon from '@mui/icons-material/Quiz';
import CaseIcon from '@mui/icons-material/Description';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const [studentProfile, setStudentProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchStudentProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/students/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      setStudentProfile(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStudentProfile();
    }
  }, [token]);

  const handleRetry = () => {
    if (token) {
      fetchStudentProfile();
    }
  };

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
      <Button variant="contained" onClick={fetchStudentProfile} sx={{ mt: 2 }}>
        Retry Loading
      </Button>
    </Box>
  );

  if (!studentProfile) return (
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
                  Medical Student
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
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
          {/* Quiz Scores */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <QuizIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Quiz Scores</Typography>
                  </Box>
                }
              />
              <CardContent>
                <List>
                  {studentProfile.quizScores.map((quiz, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`Quiz ID: ${quiz.quizId}`}
                        secondary={`Score: ${quiz.score} - Date: ${new Date(quiz.date).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Accessed Case Studies */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CaseIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Accessed Case Studies</Typography>
                  </Box>
                }
              />
              <CardContent>
                <List>
                  {studentProfile.accessedCases.map((caseStudy, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={caseStudy.caseId.title}
                        secondary={`Accessed on: ${new Date(caseStudy.date).toLocaleDateString()}`}
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

export default StudentDashboard;
