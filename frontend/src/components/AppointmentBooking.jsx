import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Card, CardContent, CircularProgress, Select, MenuItem, FormControl, InputLabel, Alert } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

const AppointmentBooking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { consultationId, userId, riskLevel } = location.state || {};

    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [loading, setLoading] = useState(false);
    const [bookingComplete, setBookingComplete] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!consultationId || !userId) {
            navigate("/consultation");
            return;
        }
        fetchDoctors();
    }, [consultationId, userId, navigate]);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/api/appointments/doctors');
            setDoctors(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load doctors");
        }
    };

    const fetchAvailableSlots = async (doctorId, date) => {
        try {
            const res = await api.get(`/api/appointments/availability/${doctorId}/${date}`);

            // Generate time slots based on availability
            if (res.data.availability && res.data.availability.length > 0) {
                const avail = res.data.availability[0];
                const slots = generateTimeSlots(
                    avail.start_time,
                    avail.end_time,
                    avail.slot_duration || 30,
                    res.data.bookedSlots
                );
                setAvailableSlots(slots);
            } else {
                setAvailableSlots([]);
                setError("No availability for selected date");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load available slots");
        }
    };

    const generateTimeSlots = (startTime, endTime, duration, bookedSlots) => {
        const slots = [];
        let current = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);

        while (current < end) {
            const slotStart = current.toTimeString().slice(0, 5);
            current = new Date(current.getTime() + duration * 60000);
            const slotEnd = current.toTimeString().slice(0, 5);

            // Check if slot is not booked
            const isBooked = bookedSlots.some(
                slot => slot.slot_start === slotStart
            );

            if (!isBooked) {
                slots.push({ start: slotStart, end: slotEnd });
            }
        }

        return slots;
    };

    const handleDoctorChange = (doctorId) => {
        setSelectedDoctor(doctorId);
        setAppointmentDate("");
        setSelectedSlot("");
        setAvailableSlots([]);
    };

    const handleDateChange = (date) => {
        setAppointmentDate(date);
        setSelectedSlot("");
        if (selectedDoctor && date) {
            fetchAvailableSlots(selectedDoctor, date);
        }
    };

    const handleBookAppointment = async () => {
        if (!selectedDoctor || !appointmentDate || !selectedSlot) {
            setError("Please select all fields");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await api.post('/api/appointments/book', {
                doctor_id: selectedDoctor,
                patient_id: userId,
                consultation_id: consultationId,
                appointment_date: appointmentDate,
                slot_start: selectedSlot.start,
                slot_end: selectedSlot.end
            });

            setBookingComplete(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Booking failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (bookingComplete) {
        return (
            <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Card sx={{ p: 4, maxWidth: "500px", textAlign: "center" }}>
                    <CheckCircleIcon sx={{ fontSize: 80, color: "#388e3c", mb: 2 }} />
                    <Typography variant="h4" sx={{ mb: 2, color: "#388e3c", fontWeight: "bold" }}>
                        Appointment Confirmed!
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Your emergency appointment has been successfully booked.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Date: {appointmentDate} at {selectedSlot?.start}
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate("/consultation")}
                        sx={{ bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
                    >
                        Return to Dashboard
                    </Button>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
            {/* Header */}
            <Box sx={{
                bgcolor: "#d32f2f",
                color: "white",
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                boxShadow: 2
            }}>
                <MedicalServicesIcon />
                <Typography variant="h6" fontWeight="bold">Emergency Appointment Booking</Typography>
            </Box>

            {/* Main Content */}
            <Box sx={{ p: 3, maxWidth: "700px", margin: "auto" }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="body1" fontWeight="bold">High Risk Detected</Typography>
                    <Typography variant="body2">Immediate medical attention is recommended. Please book an appointment with a doctor.</Typography>
                </Alert>

                <Card sx={{ p: 3, borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 3, color: "#2e7d32" }}>
                            Select Doctor & Time
                        </Typography>

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Select Doctor</InputLabel>
                            <Select
                                value={selectedDoctor}
                                onChange={(e) => handleDoctorChange(e.target.value)}
                                label="Select Doctor"
                            >
                                {doctors.map((doctor) => (
                                    <MenuItem key={doctor.id} value={doctor.id}>
                                        Dr. {doctor.name} - {doctor.specialization}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {selectedDoctor && (
                            <TextField
                                fullWidth
                                type="date"
                                label="Appointment Date"
                                value={appointmentDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                                sx={{ mb: 3 }}
                            />
                        )}

                        {availableSlots.length > 0 && (
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Select Time Slot</InputLabel>
                                <Select
                                    value={selectedSlot}
                                    onChange={(e) => setSelectedSlot(e.target.value)}
                                    label="Select Time Slot"
                                >
                                    {availableSlots.map((slot, index) => (
                                        <MenuItem key={index} value={slot}>
                                            {slot.start} - {slot.end}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate("/consultation")}
                                sx={{ flex: 1 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleBookAppointment}
                                disabled={loading || !selectedDoctor || !appointmentDate || !selectedSlot}
                                sx={{ flex: 1 }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Confirm Booking"}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default AppointmentBooking;
