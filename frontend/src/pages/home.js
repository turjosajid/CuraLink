import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Logo in top left */}
      <Box sx={{
        position: 'absolute',
        top: 24,
        left: 40,
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#fff',
            fontWeight: 700,
            letterSpacing: '0.1em'
          }}
        >
          CuraLink
        </Typography>
      </Box>

      {/* Main content */}
      <Container maxWidth="lg">
        <Box sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}>
          {/* Left side content */}
          <Box sx={{ 
            flex: 1,
            color: '#fff',
            position: 'relative',
            zIndex: 1
          }}>
            <Typography 
              variant="h2" 
              component="h1"
              sx={{ 
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Your Healthcare Connection Platform
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4,
                opacity: 0.9,
                maxWidth: '600px'
              }}
            >
              Connect with healthcare professionals, manage appointments, and take control of your health journey.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  backgroundColor: '#fff',
                  color: '#764ba2',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                  },
                  px: 4,
                  py: 1.5,
                }}
              >
                Login
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  borderColor: '#fff',
                  color: '#fff',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.9)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  px: 4,
                  py: 1.5,
                }}
              >
                Register
              </Button>
            </Box>
          </Box>

          {/* Right side decorative element */}
          <Box 
            sx={{ 
              flex: 1,
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Box 
              component="img"
              src="/assets/homepage-illustration.png"
              alt="Healthcare illustration"
              sx={{
                maxWidth: '150%',
                height: 'auto',
                filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.15))',
                marginLeft: '20%'
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
