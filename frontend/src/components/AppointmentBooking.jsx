import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Card, CardContent, Grid, CircularProgress, FormControl, InputLabel, Select, MenuItem, Chip } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const AppointmentBooking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { consultation, patient } = location.state || {};

    const [selectedDate, setSelectedDate] = useState(getTomorrowDate());
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [appointmentDetails, setAppointmentDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        if (selectedDate) {
            fetchAvailableDoctors();
        }
    }, [selectedDate]);

    function getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }

    const fetchAvailableDoctors = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/doctors/available?date=${selectedDate}`);
            setAvailableDoctors(res.data);
            setSelectedDoctor(null);
            setSelectedSlot(null);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch available doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = async () => {
        if (!patient || !selectedDoctor || !selectedSlot) return;

        // Get patient_info.id from the patient object
        const patientInfoId = patient.patient_info && patient.patient_info.length > 0
            ? patient.patient_info[0].id
            : null;

        if (!patientInfoId) {
            alert("Patient information not found. Please return to login.");
            navigate('/login');
            return;
        }

        setBooking(true);
        try {
            const res = await api.post('/api/appointments', {
                patient_id: patientInfoId,  // This references patient_info.id
                doctor_id: selectedDoctor.doctor_id,
                consultation_id: consultation?.id,
                appointment_date: selectedDate,
                slot_start: selectedSlot.start,
                slot_end: selectedSlot.end
            });
            setAppointmentDetails(res.data);
            setConfirmed(true);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 409) {
                alert('This slot is no longer available. Please select another.');
                fetchAvailableDoctors();
            } else {
                alert('Booking failed. Please try again.');
            }
        } finally {
            setBooking(false);
        }
    };

    if (!patient) {
        navigate('/login');
        return null;
    }

    if (confirmed) {
        return (
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                bgcolor: "#e8f5e9",
                p: 2
            }}>
                <Card sx={{ maxWidth: 500, p: 4, textAlign: 'center' }}>
                    <LocalHospitalIcon sx={{ fontSize: 80, color: '#2e7d32', mb: 2 }} />
                    <Typography variant="h4" color="#2e7d32" fontWeight="bold" gutterBottom>
                        Appointment Confirmed!
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        Your appointment with <strong>{selectedDoctor.doctor_name}</strong> has been successfully booked.
                    </Typography>
                    <Box sx={{ bgcolor: '#f1f8e9', p: 2, borderRadius: 2, mb: 3 }}>
                        <Typography variant="h5" color="secondary" sx={{ mb: 2, fontWeight: 'bold', color: '#e65100' }}>
                            Token Number: {appointmentDetails?.token_no}
                        </Typography>
                        <Typography><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</Typography>
                        <Typography><strong>Time:</strong> {selectedSlot.start} - {selectedSlot.end}</Typography>
                        <Typography><strong>Specialization:</strong> {selectedDoctor.specialization}</Typography>
                    </Box>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
                        onClick={() => navigate('/consultation')}
                    >
                        Back to Dashboard
                    </Button>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: "100vh",
            bgcolor: "#f5f5f5",
            p: 3
        }}>
            <Box sx={{ maxWidth: 900, margin: 'auto' }}>
                {/* Header */}
                <Typography variant="h4" sx={{ mb: 1, color: '#2e7d32', fontWeight: 'bold' }}>
                    Book Doctor Appointment
                </Typography>
                {consultation && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        High risk detected: {consultation.diagnosis}
                    </Typography>
                )}

                {/* Date Selection */}
                <Card sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon /> Select Date
                    </Typography>
                    <TextField
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        inputProps={{ min: getTomorrowDate() }}
                        fullWidth
                    />
                </Card>

                {/* Available Doctors */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : availableDoctors.length === 0 ? (
                    <Card sx={{ p: 3, textAlign: 'center' }}>
                        <Typography>No doctors available on this date</Typography>
                    </Card>
                ) : (
                    <Grid container spacing={2}>
                        {availableDoctors.map((doctor) => (
                            <Grid item xs={12} key={doctor.doctor_id}>
                                <Card
                                    sx={{
                                        p: 2,
                                        border: selectedDoctor?.doctor_id === doctor.doctor_id ? '2px solid #2e7d32' : '1px solid #e0e0e0',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        setSelectedDoctor(doctor);
                                        setSelectedSlot(null);
                                    }}
                                >
                                    <Typography variant="h6" color="#2e7d32">{doctor.doctor_name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{doctor.specialization}</Typography>

                                    {selectedDoctor?.doctor_id === doctor.doctor_id && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AccessTimeIcon fontSize="small" /> Available Time Slots
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {doctor.available_slots.map((slot, idx) => (
                                                    <Chip
                                                        key={idx}
                                                        label={`${slot.start.substring(0, 5)} - ${slot.end.substring(0, 5)}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedSlot(slot);
                                                        }}
                                                        color={selectedSlot?.start === slot.start ? "success" : "default"}
                                                        variant={selectedSlot?.start === slot.start ? "filled" : "outlined"}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Book Button */}
                {selectedDoctor && selectedSlot && (
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleBookAppointment}
                            disabled={booking}
                            sx={{
                                bgcolor: '#d32f2f',
                                px: 5,
                                py: 1.5,
                                fontSize: '1.1rem',
                                '&:hover': { bgcolor: '#b71c1c' }
                            }}
                        >
                            {booking ? <CircularProgress size={24} color="inherit" /> : 'Confirm Booking'}
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default AppointmentBooking;
