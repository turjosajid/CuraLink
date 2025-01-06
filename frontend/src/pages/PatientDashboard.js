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
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  TextField,
  Alert,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Collapse,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const PatientDashboard = () => {
  const [patientProfile, setPatientProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportFile, setReportFile] = useState(null);
  const [reportName, setReportName] = useState("");
  const [selectedFileName, setSelectedFileName] = useState(""); // Add state for selected file name
  const [doctors, setDoctors] = useState([]); // Add state for doctors
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [openDialog, setOpenDialog] = useState(false); // Add state for dialog
  const [appointmentDate, setAppointmentDate] = useState(null); // Add state for appointment date
  const [medicalHistoryDescription, setMedicalHistoryDescription] = useState(""); // Add state for medical history description
  const [medicalHistoryDate, setMedicalHistoryDate] = useState(null); // Add state for medical history date
  const [drugs, setDrugs] = useState([{ name: "", dosage: "" }]); // Add state for drugs
  const [expanded, setExpanded] = useState({}); // Add state for expanded medical history
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchPatientProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "http://localhost:5000/api/patients/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Instead of redirecting to registration, show error
        throw new Error(data.message || "Failed to fetch profile");
      }

      setPatientProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load patient profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/doctors/all-doctors",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch doctors");
      }
      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      if (error instanceof SyntaxError) {
        setError("Failed to load doctors. Invalid response format.");
      } else {
        setError("Failed to load doctors. Please try again.");
      }
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/appointments/patient",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch appointments");
      }
      setPatientProfile((prevProfile) => ({
        ...prevProfile,
        appointments: data.appointments,
      }));
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load appointments. Please try again.");
    }
  };

  useEffect(() => {
    if (token) {
      fetchPatientProfile();
      fetchDoctors();
      fetchAppointments(); // Fetch appointments
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleFileChange = (e) => {
    setReportFile(e.target.files[0]);
    setSelectedFileName(e.target.files[0]?.name || ""); // Update selected file name
  };

  const handleUploadReport = async () => {
    if (!reportFile || !reportName) {
      setError("Please provide a report name and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("report", reportFile);
    formData.append("reportName", reportName);

    try {
      const response = await fetch(
        `http://localhost:5000/api/patients/${patientProfile._id}/reports`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload report");
      }

      setPatientProfile((prevProfile) => ({
        ...prevProfile,
        medicalReports: [...prevProfile.medicalReports, data],
      }));
      setReportFile(null);
      setReportName("");
      setSelectedFileName(""); // Reset selected file name
    } catch (error) {
      console.error("Error uploading report:", error);
      setError("Failed to upload report. Please try again.");
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null);
    setOpenDialog(true); // Open dialog
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedSlot || !appointmentDate) {
      setError("Please select a doctor, a slot, and a date.");
      return;
    }

    try {
      const appointmentDateTime = new Date(appointmentDate);
      appointmentDateTime.setHours(selectedSlot.startTime.split(":")[0]);
      appointmentDateTime.setMinutes(selectedSlot.startTime.split(":")[1]);

      const response = await fetch(
        `http://localhost:5000/api/appointments/book`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doctorId: selectedDoctor._id,
            date: appointmentDateTime,
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to book appointment");
      }

      setPatientProfile((prevProfile) => ({
        ...prevProfile,
        appointments: [...prevProfile.appointments, data],
      }));
      setSelectedDoctor(null);
      setSelectedSlot(null);
      setOpenDialog(false); // Close dialog
    } catch (error) {
      console.error("Error booking appointment:", error);
      setError("Failed to book appointment. Please try again.");
    }
  };

  const handleAddMedicalHistory = async () => {
    if (!medicalHistoryDescription || !medicalHistoryDate) {
      setError("Please provide a description and select a date.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/patients/${patientProfile._id}/medical-history`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: medicalHistoryDescription,
            date: medicalHistoryDate,
            drugs,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add medical history");
      }

      setPatientProfile((prevProfile) => ({
        ...prevProfile,
        medicalHistory: [...prevProfile.medicalHistory, data],
      }));
      setMedicalHistoryDescription("");
      setMedicalHistoryDate(null);
      setDrugs([{ name: "", dosage: "" }]); // Reset drugs
    } catch (error) {
      console.error("Error adding medical history:", error);
      setError("Failed to add medical history. Please try again.");
    }
  };

  const handleRemoveMedicalHistory = async (historyId) => {
    try {
      console.log(`Removing medical history with ID: ${historyId}`); // Log history ID

      const response = await fetch(
        `http://localhost:5000/api/patients/${patientProfile._id}/medical-history/${historyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to remove medical history");
      }

      setPatientProfile((prevProfile) => ({
        ...prevProfile,
        medicalHistory: prevProfile.medicalHistory.filter(
          (history) => history._id !== historyId
        ),
      }));
    } catch (error) {
      console.error("Error removing medical history:", error);
      setError("Failed to remove medical history. Please try again.");
    }
  };

  const handleDrugChange = (index, field, value) => {
    const newDrugs = [...drugs];
    newDrugs[index][field] = value;
    setDrugs(newDrugs);
  };

  const handleAddDrug = () => {
    setDrugs([...drugs, { name: "", dosage: "" }]);
  };

  const handleRemoveDrug = (index) => {
    const newDrugs = drugs.filter((_, i) => i !== index);
    setDrugs(newDrugs);
  };

  const handleExpandClick = (index) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [index]: !prevExpanded[index],
    }));
  };

  if (isLoading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading profile...</Typography>
      </Box>
    );

  if (error)
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        minHeight="80vh"
        padding={4}
      >
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={fetchPatientProfile}
          sx={{ mt: 2 }}
        >
          Retry Loading
        </Button>
      </Box>
    );

  if (!patientProfile)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Typography>No profile data available</Typography>
      </Box>
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: (theme) => theme.palette.grey[100],
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Card sx={{ mb: 4, p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: (theme) => theme.palette.primary.main,
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
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mt: 2 }}
                      >
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
                          {`${patientProfile.address?.street}, ${patientProfile.address?.city}`}
                          <br />
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
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemText
                          primary={history.description}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                Date: {new Date(history.date).toLocaleDateString()}
                              </Typography>
                              <br />
                              {history.drugs.map((drug, i) => (
                                <Typography
                                  key={i}
                                  component="span"
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {`Drug ${i + 1}: ${drug.name} - ${drug.dosage}`}
                                  <br />
                                </Typography>
                              ))}
                            </>
                          }
                        />
                        <IconButton
                          onClick={() => handleExpandClick(index)}
                          aria-expanded={expanded[index]}
                          aria-label="show more"
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                        <Collapse in={expanded[index]} timeout="auto" unmountOnExit>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Detailed Information:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {history.description}
                            </Typography>
                            {history.drugs.map((drug, i) => (
                              <Typography
                                key={i}
                                variant="body2"
                                color="text.secondary"
                              >
                                {`Drug ${i + 1}: ${drug.name} - ${drug.dosage}`}
                              </Typography>
                            ))}
                          </Box>
                        </Collapse>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleRemoveMedicalHistory(history._id)}
                        >
                          Remove
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={medicalHistoryDescription}
                      onChange={(e) => setMedicalHistoryDescription(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <DatePicker
                      label="Select Date"
                      value={medicalHistoryDate}
                      onChange={(newValue) => setMedicalHistoryDate(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth sx={{ mb: 2 }} />
                      )}
                    />
                    {drugs.map((drug, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                          label="Drug Name"
                          value={drug.name}
                          onChange={(e) => handleDrugChange(index, 'name', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          label="Dosage"
                          value={drug.dosage}
                          onChange={(e) => handleDrugChange(index, 'dosage', e.target.value)}
                          fullWidth
                        />
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleRemoveDrug(index)}
                        >
                          Remove
                        </Button>
                      </Box>
                    ))}
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleAddDrug}
                      sx={{ mb: 2 }}
                    >
                      Add Drug
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleAddMedicalHistory}
                    >
                      Add Medical History
                    </Button>
                  </Box>
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
                        <Link
                          href={report.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Report
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Report Name"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Button variant="contained" component="label" fullWidth>
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
                          primary={`Appointment with Dr. ${
                            appointment.doctorId?.userId?.name || "Unknown"
                          } on ${new Date(
                            appointment.date
                          ).toLocaleDateString()} at ${appointment.startTime}`}
                          secondary={`Status: ${appointment.status}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Available Doctors */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Available Doctors" />
                <CardContent>
                  <List>
                    {doctors.map((doctor) => (
                      <ListItem key={doctor._id}>
                        <ListItemText
                          primary={doctor.userId.name}
                          secondary={`${doctor.userId.email} - ${doctor.specialization}`}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleDoctorSelect(doctor)}
                        >
                          Book Appointment
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Book Appointment Dialog */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogContent>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Available Slots for Dr. {selectedDoctor?.userId.name}
              </Typography>
              <DatePicker
                label="Select Date"
                value={appointmentDate}
                onChange={(newValue) => setAppointmentDate(newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth sx={{ mt: 2 }} />
                )}
              />
              <List>
                {selectedDoctor?.timeSlots?.map((slot, index) => (
                  <ListItem
                    button
                    key={index}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <ListItemText
                      primary={`${slot.day}: ${slot.startTime} - ${slot.endTime}`}
                    />
                  </ListItem>
                ))}
              </List>
              {selectedSlot && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1">
                    Confirm Appointment with Dr. {selectedDoctor?.userId.name}{" "}
                    on {appointmentDate?.toLocaleDateString()} from{" "}
                    {selectedSlot.startTime} to {selectedSlot.endTime}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} color="secondary">
                Cancel
              </Button>
              <Button onClick={handleBookAppointment} color="primary">
                Confirm Appointment
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default PatientDashboard;
