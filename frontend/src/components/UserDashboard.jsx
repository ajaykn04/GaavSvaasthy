import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, Grid, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LogoutIcon from '@mui/icons-material/Logout';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HistoryIcon from '@mui/icons-material/History';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);

    useEffect(() => {
        const p = localStorage.getItem("currentPatient");
        if (!p) {
            navigate("/login");
        } else {
            setPatient(JSON.parse(p));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("currentPatient");
        navigate("/login");
    };

    if (!patient) return null;

    const cards = [
        {
            title: "New Consultation",
            icon: <MedicalServicesIcon sx={{ fontSize: 50, color: "#2e7d32" }} />,
            desc: "Check symptoms and get AI diagnosis",
            path: "/consultation",
            color: "#e8f5e9"
        },
        {
            title: "My Consultations",
            icon: <HistoryIcon sx={{ fontSize: 50, color: "#1976d2" }} />,
            desc: "View past medical records and advice",
            path: "/my-consultations",
            color: "#e3f2fd"
        },
        {
            title: "My Appointments",
            icon: <CalendarTodayIcon sx={{ fontSize: 50, color: "#ed6c02" }} />,
            desc: "Track your doctor appointments",
            path: "/my-appointments",
            color: "#fff3e0"
        }
    ];

    return (
        <Box
  sx={{
    width: "100vw",
    minHeight: "100vh",
    bgcolor: "#f5f5f5",
    m: 0,
    p: 0,ml:-15,mt:-4,mb:-4
  }}
>

            {/* Header */}
            <Box sx={{
                bgcolor: "#2e7d32",
                color: "white",
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MedicalServicesIcon />
                    <Typography variant="h6" fontWeight="bold">GaavSwaasthy</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                        <Typography variant="subtitle2">{patient.username}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>{patient.age} Yrs</Typography>
                    </Box>
                    <IconButton color="inherit" onClick={handleLogout} title="Logout">
                        <LogoutIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ p: 4, maxWidth: "1000px", margin: "auto" }}>
                <Typography variant="h4" sx={{ mb: 1, color: "#333", fontWeight: "bold" }}>
                    Welcome, {patient.username}
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
                    Manage your health and consultations
                </Typography>

                <Grid container spacing={3}>
                    {cards.map((card, index) => (
                        <Grid item xs={12} sm={4} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
                                    borderRadius: 3,
                                    bgcolor: card.color
                                }}
                                onClick={() => navigate(card.path)}
                            >
                                <CardContent sx={{ textAlign: 'center', py: 5 }}>
                                    {card.icon}
                                    <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
                                        {card.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {card.desc}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default UserDashboard;
