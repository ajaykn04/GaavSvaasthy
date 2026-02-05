import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, Chip, Button, AppBar, Toolbar, IconButton, CircularProgress } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const DoctorDashboard = () => {
    const [doctor, setDoctor] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default today
    const navigate = useNavigate();

    useEffect(() => {
        const storedDoctor = localStorage.getItem("doctor");
        if (!storedDoctor) {
            navigate("/doctor/login");
            return;
        }
        setDoctor(JSON.parse(storedDoctor));
    }, [navigate]);

    useEffect(() => {
        if (doctor) {
            fetchAppointments();
        }
    }, [doctor, selectedDate]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/appointments/doctor/${doctor.id}?date=${selectedDate}`);
            setAppointments(res.data);
        } catch (err) {
            console.error("Failed to fetch appointments", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("doctor");
        navigate("/doctor/login");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'success';
            case 'BOOKED': return 'warning';
            case 'COMPLETED': return 'default';
            case 'CANCELLED': return 'error';
            default: return 'default';
        }
    };

    if (!doctor) return null;

    return (
        <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "#f5f5f5" }}>
            <AppBar position="static" sx={{ bgcolor: "#1565c0" }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {doctor.name} - Dashboard
                    </Typography>
                    <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h5" color="text.secondary">
                        Appointments for {selectedDate}
                    </Typography>
                    <Box>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                marginRight: '10px'
                            }}
                        />
                        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchAppointments}>
                            Refresh
                        </Button>
                    </Box>
                </Box>

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : appointments.length === 0 ? (
                    <Box sx={{ textAlign: "center", mt: 5 }}>
                        <Typography variant="h6" color="text.secondary">
                            No appointments found for this date.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {appointments.map((apt) => (
                            <Grid item xs={12} sm={6} md={4} key={apt.id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderLeft: '5px solid #1565c0' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Chip
                                                label={`Token #${apt.token_no}`}
                                                color="primary"
                                                size="small"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                            <Chip
                                                label={apt.status}
                                                color={getStatusColor(apt.status)}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>

                                        <Typography variant="h6" gutterBottom>
                                            {apt.patient_info?.users?.username || "Unknown Patient"}
                                        </Typography>

                                        <Typography color="text.secondary" variant="body2" gutterBottom>
                                            Age: {apt.patient_info?.users?.age} | Sex: {apt.patient_info?.users?.sex || 'N/A'}
                                        </Typography>

                                        <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
                                            {apt.slot_start.slice(0, 5)} - {apt.slot_end.slice(0, 5)}
                                        </Typography>

                                        <Box sx={{ mt: 2, bgcolor: "#e3f2fd", p: 1.5, borderRadius: 1 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Predicted Disease
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {apt.consultations?.predicted_disease || "Not available"}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ mt: 1, bgcolor: "#fff3e0", p: 1.5, borderRadius: 1 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Symptoms
                                            </Typography>
                                            <Typography variant="body2">
                                                {apt.consultations?.symptoms ? JSON.stringify(apt.consultations.symptoms) : "No symptoms recorded"}
                                            </Typography>
                                        </Box>

                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Box>
    );
};

export default DoctorDashboard;
