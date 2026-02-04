import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, Grid, Chip, IconButton, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

const MyAppointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const p = localStorage.getItem("currentPatient");
            if (!p) {
                navigate("/login");
                return;
            }
            const patient = JSON.parse(p);

            const patientInfoId = patient.patient_info && patient.patient_info.length > 0
                ? patient.patient_info[0].id
                : null;

            if (!patientInfoId) return;

            try {
                const res = await api.get(`/api/appointments/patient/${patientInfoId}`);
                setAppointments(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [navigate]);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
            <Box sx={{ bgcolor: "#F57C00", color: "white", p: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton color="inherit" onClick={() => navigate("/dashboard")}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight="bold">My Appointments</Typography>
            </Box>

            <Box sx={{ p: 3, maxWidth: "800px", margin: "auto" }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : appointments.length === 0 ? (
                    <Typography textAlign="center" color="text.secondary" sx={{ mt: 5 }}>
                        No upcoming appointments.
                    </Typography>
                ) : (
                    <Grid container spacing={2}>
                        {appointments.map((apt) => (
                            <Grid item xs={12} key={apt.id}>
                                <Card sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', mb: 2 }}>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: { xs: 1, sm: 0 } }}>
                                                <CalendarTodayIcon color="action" />
                                                <Typography variant="h6">{new Date(apt.appointment_date).toDateString()}</Typography>
                                            </Box>
                                            <Chip label={apt.status} color={apt.status === 'CONFIRMED' ? 'success' : 'default'} />
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                                            <AccessTimeIcon color="action" fontSize="small" />
                                            <Typography>{apt.slot_start} - {apt.slot_end}</Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                            <PersonIcon color="primary" />
                                            <Box>
                                                <Typography variant="subtitle2">Dr. {apt.doctors?.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{apt.doctors?.specialization}</Typography>
                                            </Box>
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

export default MyAppointments;
