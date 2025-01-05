import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Stack,
  Divider,
  IconButton as MuiIconButton,
  List as MuiList,
  ListItem as MuiListItem,
  ListItemSecondaryAction,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  useTheme,
  Tooltip,
  Badge,
  MenuItem,
  Alert,
  Switch,
  Collapse,
  Drawer,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import TimerIcon from "@mui/icons-material/Timer";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import BarChartIcon from "@mui/icons-material/BarChart";
import VerifiedIcon from "@mui/icons-material/Verified";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { parseISO, format } from "date-fns";
import { validateEmail } from "../utils/validation"; // You'll need to create this utility
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import "@fontsource/roboto/300.css"; // Light weight
import "@fontsource/roboto/400.css"; // Regular weight
import "@fontsource/roboto/500.css"; // Medium weight

const theme = createTheme({
  typography: {
    fontFamily: "Helvetica, Arial, sans-serif", // Use a clean sans-serif font
    allVariants: {
      fontWeight: 400, // Regular weight for all texts to keep it soft and readable
      letterSpacing: "0.3px", // Slight letter spacing for clarity
      lineHeight: 1.6, // Consistent line height for better readability
    },
    h4: {
      fontSize: "2rem", // Slightly larger font for headings
      fontWeight: 600, // Slightly bold for prominence but not too heavy
      lineHeight: 1.4, // A bit more space between lines for a relaxed look
      letterSpacing: "0.5px", // Slightly tighter letter spacing for clarity
    },
    subtitle1: {
      fontSize: "1.2rem", // Slightly smaller font for subtitles
      fontWeight: 400, // Regular weight for a more comfortable feel
      lineHeight: 1.6, // More breathing space between lines for legibility
      letterSpacing: "0.3px", // Subtle letter spacing
    },
    body2: {
      fontSize: "1rem", // Standard body text size
      fontWeight: 300, // Light font weight for a relaxed feel
      lineHeight: 1.7, // Generous line height for readability
      letterSpacing: "0.2px", // Light letter spacing for clean text
    },
    button: {
      textTransform: "none", // Avoid uppercase letters for a softer appearance
      fontWeight: 500, // Slightly bolder text for buttons
      letterSpacing: "0.8px", // Increase letter spacing for clearer readability
      padding: "8px 20px", // Provide some padding for better button size
    },
  },
  spacing: 10,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // Adjust the border radius for rounded corners
        },
      },
    },
  },
});

const drawerWidth = 400;

const DoctorDashboard = () => {
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Add new state for education and certificates
  const [newEducation, setNewEducation] = useState({
    degree: "",
    institute: "",
    year: "",
  });
  const [newCertificate, setNewCertificate] = useState({
    name: "",
    issuer: "",
    year: "",
  });

  // Add new state for time slots
  const [timeSlots, setTimeSlots] = useState([]);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day: "Monday",
    startTime: null,
    endTime: null,
  });

  // Add new state for adding patient
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [availablePatients, setAvailablePatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [addPatientError, setAddPatientError] = useState("");

  // Add new states for patient search
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [searchMode, setSearchMode] = useState(true); // true for search, false for manual add

  // Add new state for upcoming appointments
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isAvailable, setIsAvailable] = useState(false);

  const [expanded, setExpanded] = useState({});

  const handleExpandClick = (card) => {
    setExpanded((prev) => ({ ...prev, [card]: !prev[card] }));
  };

  const fetchDoctorProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "http://localhost:5000/api/doctors/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 && data.status === "PROFILE_NOT_FOUND") {
          setError({
            type: "PROFILE_NOT_FOUND",
            message: "Please complete your doctor profile registration.",
            action: "register",
          });
        } else if (response.status === 403) {
          setError({
            type: "NOT_AUTHORIZED",
            message: "You are not authorized as a doctor.",
            action: "redirect",
          });
        } else {
          throw new Error(data.message || "Failed to fetch profile");
        }
        return;
      }

      setDoctorProfile(data);
      setIsAvailable(data.isAvailable);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError({
        type: "FETCH_ERROR",
        message: "Failed to load doctor profile. Please try again.",
        action: "retry",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/doctors/time-slots",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setTimeSlots(data.timeSlots || []);
    } catch (error) {
      console.error("Error fetching time slots:", error);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/doctors/appointments?doctorId=${doctorProfile._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setUpcomingAppointments(data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };
  useEffect(() => {
    if (doctorProfile && doctorProfile._id) {
      fetchUpcomingAppointments();
    }
  }, [doctorProfile]);

  useEffect(() => {
    if (token) {
      fetchDoctorProfile();
      fetchTimeSlots();
      fetchUpcomingAppointments();
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
      const response = await fetch(
        "http://localhost:5000/api/doctors/profile",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedProfile),
        }
      );

      if (!response.ok) throw new Error("Update failed");

      const updatedProfile = await response.json();
      setDoctorProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      setError("Failed to update profile");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setEditedProfile((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setEditedProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle education changes
  const handleAddEducation = () => {
    setEditedProfile((prev) => ({
      ...prev,
      education: [...(prev.education || []), newEducation],
    }));
    setNewEducation({ degree: "", institute: "", year: "" });
  };

  const handleRemoveEducation = (index) => {
    setEditedProfile((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // Handle certificate changes
  const handleAddCertificate = () => {
    setEditedProfile((prev) => ({
      ...prev,
      certificates: [...(prev.certificates || []), newCertificate],
    }));
    setNewCertificate({ name: "", issuer: "", year: "" });
  };

  const handleRemoveCertificate = (index) => {
    setEditedProfile((prev) => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index),
    }));
  };

  // Handle time slot changes
  const handleSlotSubmit = async () => {
    if (!newSlot.startTime || !newSlot.endTime) return;

    const formattedSlot = {
      day: newSlot.day,
      startTime: format(new Date(newSlot.startTime), "HH:mm"),
      endTime: format(new Date(newSlot.endTime), "HH:mm"),
      isAvailable: true,
    };

    const updatedSlots = [...timeSlots, formattedSlot];

    try {
      await fetch("http://localhost:5000/api/doctors/time-slots", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timeSlots: updatedSlots }),
      });

      setTimeSlots(updatedSlots);
      setShowSlotDialog(false);
      setNewSlot({ day: "Monday", startTime: null, endTime: null });
    } catch (error) {
      console.error("Error updating time slots:", error);
    }
  };

  const handleDeleteSlot = async (index) => {
    const updatedSlots = timeSlots.filter((_, i) => i !== index);

    try {
      await fetch("http://localhost:5000/api/doctors/time-slots", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timeSlots: updatedSlots }),
      });

      setTimeSlots(updatedSlots);
    } catch (error) {
      console.error("Error deleting time slot:", error);
    }
  };

  // Add new function to handle patient search
  const handleSearchPatient = async () => {
    if (!validateEmail(searchEmail)) {
      setSearchError("Please enter a valid email address");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/doctors/search-patients?email=${searchEmail}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to search patient");
      }

      setSearchResult(data);
      setSearchError("");
    } catch (error) {
      setSearchError(error.message);
      setSearchResult(null);
    }
  };

  // Add new function to fetch patients
  const fetchAvailablePatients = async (search = "") => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/doctors/search-patients?search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }

      const data = await response.json();
      setAvailablePatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  // Update handleAddPatient function
  const handleAddPatient = async () => {
    try {
      if (!selectedPatient) {
        setAddPatientError("Please select a patient first");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/doctors/patients",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ patientId: selectedPatient._id }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add patient");
      }

      const data = await response.json();
      setDoctorProfile((prev) => ({
        ...prev,
        patients: [...prev.patients, data.patient],
      }));
      setShowAddPatientDialog(false);
      setSelectedPatient(null);
      setSearchTerm("");
      fetchDoctorProfile(); // Reload the patients card
    } catch (error) {
      setAddPatientError(error.message);
    }
  };

  // Add new function to handle patient removal
  const handleRemovePatient = async (patientId) => {
    try {
      if (!patientId) {
        throw new Error("Patient ID is required");
      }

      const response = await fetch(
        `http://localhost:5000/api/doctors/patients/${patientId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove patient");
      }

      setDoctorProfile((prev) => ({
        ...prev,
        patients: prev.patients.filter((p) => p._id !== patientId),
      }));
    } catch (error) {
      console.error("Error removing patient:", error);
    }
  };

  // Add useEffect for fetching patients when dialog opens
  useEffect(() => {
    if (showAddPatientDialog) {
      fetchAvailablePatients();
    }
  }, [showAddPatientDialog]);

  // Add logout handler
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleToggleAvailability = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/doctors/availability",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isAvailable: !isAvailable }),
        }
      );

      if (!response.ok) throw new Error("Failed to update availability");

      setIsAvailable(!isAvailable);
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  const [selectedPatientReports, setSelectedPatientReports] = useState([]);
  const [showReportsDialog, setShowReportsDialog] = useState(false);

  const fetchMedicalReports = async (patientId) => {
    try {
      if (!patientId) {
        throw new Error("Patient ID is required");
      }

      const response = await fetch(
        `http://localhost:5000/api/doctors/patients/${patientId}/medical-reports`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch medical reports");
      }

      setSelectedPatientReports(data.medicalReports);
      console.log("Fetched medical reports:", data.medicalReports); // Log the fetched reports
      setShowReportsDialog(true);
    } catch (error) {
      console.error("Error fetching medical reports:", error);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/doctors/appointments/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      setUpcomingAppointments((prev) =>
        prev.filter((appointment) => appointment._id !== appointmentId)
      );
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const [selectedPatientHistory, setSelectedPatientHistory] = useState([]);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  const fetchMedicalHistory = async (patientId) => {
    try {
      if (!patientId) {
        throw new Error("Patient ID is required");
      }

      const response = await fetch(
        `http://localhost:5000/api/doctors/patients/${patientId}/medical-history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response");
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch medical history");
      }

      setSelectedPatientHistory(data.medicalHistory);
      setShowHistoryDialog(true);
    } catch (error) {
      console.error("Error fetching medical history:", error);
    }
  };

  if (isLoading)
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="80vh"
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading profile...</Typography>
        </Box>
      </ThemeProvider>
    );

  if (error)
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          minHeight="80vh"
          padding={4}
        >
          <Typography color="error" gutterBottom>
            {error.message}
          </Typography>
          {error.action === "retry" && (
            <Button variant="contained" onClick={handleRetry} sx={{ mt: 2 }}>
              Retry Loading
            </Button>
          )}
          {error.action === "register" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/doctor/register")}
              sx={{ mt: 2 }}
            >
              Complete Registration
            </Button>
          )}
          {error.action === "redirect" && (
            <Button variant="contained" color="primary" href="/" sx={{ mt: 2 }}>
              Go to Home
            </Button>
          )}
        </Box>
      </ThemeProvider>
    );

  if (!doctorProfile)
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="80vh"
        >
          <Typography>No profile data available</Typography>
        </Box>
      </ThemeProvider>
    );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 2,
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: (theme) => theme.palette.primary.main,
              }}
            >
              {user.name[0]}
            </Avatar>
            <Typography variant="h4" sx={{ mt: 2 }}>
              {user.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {doctorProfile.specialization}
            </Typography>
            <Switch
              checked={isAvailable}
              onChange={handleToggleAvailability}
              color="primary"
              sx={{ mt: 2 }}
            />
            <Typography>
              {isAvailable ? "Available" : "Not Available"}
            </Typography>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{
                mt: 2,
                borderRadius: "50px", // Rounded corners
                textTransform: "none", // Prevent text capitalization
                fontWeight: "bold", // Bold text for a stronger presence
                paddingX: 4, // Increase horizontal padding for a larger button
                paddingY: 1.5, // Add vertical padding for a taller button
                backgroundColor: "primary.main", // Primary color for background
                width: "100%", // Make the button span full width
                maxWidth: "300px", // Optional: limit the button width if needed
                "&:hover": {
                  backgroundColor: "primary.dark", // Darker shade on hover
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow on hover
                },
                transition: "all 0.3s ease", // Smooth transition for hover effect
              }}
            >
              Edit Profile
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                mt: 2,
                borderRadius: "50px", // Rounded corners
                textTransform: "none", // Prevent text capitalization
                fontWeight: "bold", // Bold text
                paddingX: 4, // Increase horizontal padding for a larger button
                paddingY: 1.5, // Add vertical padding for a taller button
                borderColor: "primary.main", // Use error color for border
                color: "primary.main", // Use error color for text
                width: "100%", // Make the button span full width
                maxWidth: "300px", // Optional: limit the button width if needed
                "&:hover": {
                  borderColor: "error.dark", // Darker border on hover
                  backgroundColor: "error.light", // Light background color on hover
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow on hover
                  color: "white",
                },
                transition: "all 0.3s ease", // Smooth transition for hover effect
              }}
            >
              Logout
            </Button>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Container maxWidth="lg">
            <Grid container spacing={3}>
              {/* Profile Information */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                  }}
                >
                  <CardHeader
                    title={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <InfoIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          Profile Information
                        </Typography>
                      </Box>
                    }
                    action={
                      <IconButton
                        onClick={() => handleExpandClick("profile")}
                        aria-expanded={expanded.profile}
                        aria-label="show more"
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    }
                  />
                  <Collapse in={expanded.profile} timeout="auto" unmountOnExit>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <WorkIcon sx={{ mr: 1, color: "primary.main" }} />
                            <Typography>
                              Experience: {doctorProfile.experience} years
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <SchoolIcon sx={{ mr: 1, color: "primary.main" }} />
                            <Typography>
                              License: {doctorProfile.license}
                            </Typography>
                          </Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ mt: 2 }}
                          >
                            About
                          </Typography>
                          <Typography paragraph>
                            {doctorProfile.about}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Languages
                          </Typography>
                          <Box sx={{ mt: 1, mb: 2 }}>
                            {doctorProfile.languages?.map((lang, index) => (
                              <Chip
                                key={index}
                                label={lang}
                                sx={{ mr: 1, mb: 1 }}
                                size="small"
                              />
                            ))}
                          </Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Address
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              mt: 1,
                            }}
                          >
                            <LocationOnIcon
                              sx={{ mr: 1, color: "primary.main" }}
                            />
                            <Typography>
                              {`${doctorProfile.address?.street}, ${doctorProfile.address?.city}`}
                              <br />
                              {`${doctorProfile.address?.state}, ${doctorProfile.address?.country}`}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>
              </Grid>

              {/* Quick Stats */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                  }}
                >
                  <CardHeader
                    title={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <BarChartIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Quick Stats</Typography>
                      </Box>
                    }
                    action={
                      <IconButton
                        onClick={() => handleExpandClick("stats")}
                        aria-expanded={expanded.stats}
                        aria-label="show more"
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    }
                  />
                  <Collapse in={expanded.stats} timeout="auto" unmountOnExit>
                    <CardContent>
                      <Box
                        sx={{ display: "flex", justifyContent: "space-around" }}
                      >
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="h4" color="primary">
                            ৳ {doctorProfile.fees}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Consultation Fee
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="h4" color="primary">
                            {doctorProfile.patients?.length || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Patients
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Collapse>
                </Card>
              </Grid>

              {/* Education & Certificates */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                  }}
                >
                  <CardHeader
                    title={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <SchoolIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          Education & Certificates
                        </Typography>
                      </Box>
                    }
                    action={
                      <IconButton
                        onClick={() => handleExpandClick("education")}
                        aria-expanded={expanded.education}
                        aria-label="show more"
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    }
                  />
                  <Collapse
                    in={expanded.education}
                    timeout="auto"
                    unmountOnExit
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <SchoolIcon sx={{ mr: 1, verticalAlign: "middle" }} />
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
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {`${edu.institute} - ${edu.year}`}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="h6" gutterBottom>
                        <VerifiedIcon sx={{ mr: 1, verticalAlign: "middle" }} />
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
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {`${cert.issuer} - ${cert.year}`}
                                </Typography>
                              }
                            />
                            <IconButton
                              edge="end"
                              onClick={() => handleRemoveCertificate(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Collapse>
                </Card>
              </Grid>

              {/* Patients List */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                  }}
                >
                  <CardHeader
                    title={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <GroupIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Patients</Typography>
                      </Box>
                    }
                    action={
                      <IconButton
                        onClick={() => handleExpandClick("patients")}
                        aria-expanded={expanded.patients}
                        aria-label="show more"
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    }
                  />
                  <Collapse in={expanded.patients} timeout="auto" unmountOnExit>
                    <CardContent>
                      <List>
                        {doctorProfile.patients.map((patient) => (
                          <ListItem
                            key={patient._id}
                            sx={{
                              "&:hover": {
                                backgroundColor: "action.hover",
                                borderRadius: 1,
                              },
                            }}
                          >
                            <ListItemText
                              primary={patient.name}
                              secondary={patient.email}
                            />
                            <Button
                              variant="outlined"
                              onClick={() => fetchMedicalReports(patient._id)}
                            >
                              View Reports
                            </Button>
                            <Button
                              sx={{ margin: "10px" }}
                              variant="outlined"
                              onClick={() => fetchMedicalHistory(patient._id)}
                            >
                              View History
                            </Button>
                            <IconButton
                              edge="end"
                              onClick={() => handleRemovePatient(patient._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItem>
                        ))}
                      </List>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setShowAddPatientDialog(true)}
                        sx={{ mt: 2 }}
                      >
                        Add Patient
                      </Button>
                    </CardContent>
                  </Collapse>
                </Card>
              </Grid>

              {/* Appointment Slots */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                  }}
                >
                  <CardHeader
                    title={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <TimerIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Appointment Slots</Typography>
                      </Box>
                    }
                    action={
                      <IconButton
                        onClick={() => handleExpandClick("slots")}
                        aria-expanded={expanded.slots}
                        aria-label="show more"
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    }
                  />
                  <Collapse in={expanded.slots} timeout="auto" unmountOnExit>
                    <CardContent>
                      <List>
                        {timeSlots.map((slot, index) => (
                          <ListItem
                            key={index}
                            secondaryAction={
                              <IconButton
                                edge="end"
                                onClick={() => handleDeleteSlot(index)}
                              >
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
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setShowSlotDialog(true)}
                        sx={{ mt: 2 }}
                      >
                        Add Slot
                      </Button>
                    </CardContent>
                  </Collapse>
                </Card>
              </Grid>

              {/* Upcoming Appointments */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                  }}
                >
                  <CardHeader
                    title={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CalendarTodayIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          Upcoming Appointments
                        </Typography>
                      </Box>
                    }
                    action={
                      <IconButton
                        onClick={() => handleExpandClick("appointments")}
                        aria-expanded={expanded.appointments}
                        aria-label="show more"
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    }
                  />
                  <Collapse
                    in={expanded.appointments}
                    timeout="auto"
                    unmountOnExit
                  >
                    <CardContent>
                      <List>
                        {upcomingAppointments.map((appointment, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={`${
                                appointment.patientId.name
                              } - ${new Date(
                                appointment.date
                              ).toLocaleDateString()}`}
                              secondary={`${appointment.startTime} - ${appointment.endTime}`}
                            />

                            <IconButton
                              edge="end"
                              onClick={() =>
                                handleCancelAppointment(appointment._id)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Collapse>
                </Card>
              </Grid>
            </Grid>

            {/* Edit Dialog remains unchanged */}
            <Dialog
              open={isEditing}
              onClose={() => setIsEditing(false)}
              maxWidth="md"
              fullWidth
            >
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
                        value={editedProfile?.specialization || ""}
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
                        value={editedProfile?.license || ""}
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
                        value={editedProfile?.experience || ""}
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
                        value={editedProfile?.fees || ""}
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
                        value={editedProfile?.about || ""}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Languages (comma-separated)"
                        name="languages"
                        value={editedProfile?.languages?.join(", ") || ""}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            languages: e.target.value
                              .split(",")
                              .map((lang) => lang.trim()),
                          })
                        }
                        sx={{ mb: 2 }}
                      />
                    </Grid>

                    {/* Address Fields */}
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Address
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Street"
                        name="address.street"
                        value={editedProfile?.address?.street || ""}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="City"
                        name="address.city"
                        value={editedProfile?.address?.city || ""}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="State"
                        name="address.state"
                        value={editedProfile?.address?.state || ""}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Country"
                        name="address.country"
                        value={editedProfile?.address?.country || ""}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Zip Code"
                        name="address.zipCode"
                        value={editedProfile?.address?.zipCode || ""}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                      />
                    </Grid>

                    {/* Education Section */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Education
                      </Typography>
                      <Stack spacing={2}>
                        {editedProfile?.education?.map((edu, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Typography>{`${edu.degree} - ${edu.institute} (${edu.year})`}</Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveEducation(index)}
                            >
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
                              onChange={(e) =>
                                setNewEducation((prev) => ({
                                  ...prev,
                                  degree: e.target.value,
                                }))
                              }
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              label="Institute"
                              value={newEducation.institute}
                              onChange={(e) =>
                                setNewEducation((prev) => ({
                                  ...prev,
                                  institute: e.target.value,
                                }))
                              }
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <TextField
                              fullWidth
                              label="Year"
                              value={newEducation.year}
                              onChange={(e) =>
                                setNewEducation((prev) => ({
                                  ...prev,
                                  year: e.target.value,
                                }))
                              }
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <Button
                              variant="contained"
                              onClick={handleAddEducation}
                              disabled={
                                !newEducation.degree ||
                                !newEducation.institute ||
                                !newEducation.year
                              }
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
                      <Typography variant="h6" gutterBottom>
                        Certificates
                      </Typography>
                      <Stack spacing={2}>
                        {editedProfile?.certificates?.map((cert, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Typography>{`${cert.name} - ${cert.issuer} (${cert.year})`}</Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveCertificate(index)}
                            >
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
                              onChange={(e) =>
                                setNewCertificate((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              label="Issuer"
                              value={newCertificate.issuer}
                              onChange={(e) =>
                                setNewCertificate((prev) => ({
                                  ...prev,
                                  issuer: e.target.value,
                                }))
                              }
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <TextField
                              fullWidth
                              label="Year"
                              value={newCertificate.year}
                              onChange={(e) =>
                                setNewCertificate((prev) => ({
                                  ...prev,
                                  year: e.target.value,
                                }))
                              }
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <Button
                              variant="contained"
                              onClick={handleAddCertificate}
                              disabled={
                                !newCertificate.name ||
                                !newCertificate.issuer ||
                                !newCertificate.year
                              }
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
                <Button onClick={handleSave} variant="contained">
                  Save
                </Button>
              </DialogActions>
            </Dialog>

            {/* Add Slot Dialog */}
            <Dialog
              open={showSlotDialog}
              onClose={() => setShowSlotDialog(false)}
            >
              <DialogTitle>Add Time Slot</DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    select
                    fullWidth
                    label="Day"
                    value={newSlot.day}
                    onChange={(e) =>
                      setNewSlot((prev) => ({ ...prev, day: e.target.value }))
                    }
                    sx={{ mb: 2 }}
                  >
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </TextField>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      label="Start Time"
                      value={newSlot.startTime}
                      onChange={(newValue) =>
                        setNewSlot((prev) => ({ ...prev, startTime: newValue }))
                      }
                      slotProps={{
                        textField: { fullWidth: true, sx: { mb: 2 } },
                      }}
                    />
                    <TimePicker
                      label="End Time"
                      value={newSlot.endTime}
                      onChange={(newValue) =>
                        setNewSlot((prev) => ({ ...prev, endTime: newValue }))
                      }
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowSlotDialog(false)}>Cancel</Button>
                <Button onClick={handleSlotSubmit} variant="contained">
                  Add
                </Button>
              </DialogActions>
            </Dialog>

            {/* Add Patient Dialog */}
            <Dialog
              open={showAddPatientDialog}
              onClose={() => setShowAddPatientDialog(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Add Patient</DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Search Patients"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      fetchAvailablePatients(e.target.value);
                    }}
                    sx={{ mb: 2 }}
                    placeholder="Search by name or email"
                  />

                  <List sx={{ maxHeight: 400, overflow: "auto" }}>
                    {availablePatients.map((patient) => {
                      const isExisting = doctorProfile.patients.some(
                        (p) => p._id === patient._id
                      );

                      return (
                        <ListItem
                          key={patient._id}
                          sx={{
                            bgcolor:
                              selectedPatient?._id === patient._id
                                ? "action.selected"
                                : "inherit",
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                            opacity: isExisting ? 0.5 : 1,
                          }}
                          button
                          onClick={() =>
                            !isExisting && setSelectedPatient(patient)
                          }
                          disabled={isExisting}
                        >
                          <ListItemText
                            primary={patient.name}
                            secondary={patient.email}
                          />
                          {isExisting && (
                            <Chip
                              label="Already Added"
                              size="small"
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </ListItem>
                      );
                    })}
                    {availablePatients.length === 0 && (
                      <Typography
                        color="text.secondary"
                        sx={{ p: 2, textAlign: "center" }}
                      >
                        No patients found
                      </Typography>
                    )}
                  </List>

                  {addPatientError && (
                    <Typography color="error" sx={{ mt: 1 }}>
                      {addPatientError}
                    </Typography>
                  )}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setShowAddPatientDialog(false);
                    setSelectedPatient(null);
                    setSearchTerm("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPatient}
                  variant="contained"
                  disabled={!selectedPatient}
                >
                  Add Patient
                </Button>
              </DialogActions>
            </Dialog>

            {/* View Reports Dialog */}
            <Dialog
              open={showReportsDialog}
              onClose={() => setShowReportsDialog(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Medical Reports</DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <List>
                    {selectedPatientReports.map((report, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={report.reportName} />
                        <Button
                          variant="outlined"
                          onClick={() =>
                            window.open(report.reportUrl, "_blank")
                          }
                        >
                          Open Report
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowReportsDialog(false)}>
                  Close
                </Button>
              </DialogActions>
            </Dialog>

            {/* View History Dialog */}
            <Dialog
              open={showHistoryDialog}
              onClose={() => setShowHistoryDialog(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Medical History</DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <List>
                    {selectedPatientHistory.map((history, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={history.description}
                          secondary={`Date: ${new Date(
                            history.date
                          ).toLocaleDateString()}`}
                        />
                        <List>
                          {history.drugs.map((prescription, idx) => (
                            <ListItem key={idx}>
                              <ListItemText
                                primary={prescription.name}
                                secondary={`Dosage: ${prescription.dosage}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowHistoryDialog(false)}>
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DoctorDashboard;
