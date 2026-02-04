import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Card, CardContent, CircularProgress, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import LogoutIcon from '@mui/icons-material/Logout';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Consultation = () => {
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [symptoms, setSymptoms] = useState("");
    const [healthMetrics, setHealthMetrics] = useState({
        weight: "",
        height: "",
        pressure: ""
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAppointment, setShowAppointment] = useState(false);

    useEffect(() => {
        const p = localStorage.getItem("currentPatient");
        if (!p) {
            navigate("/login");
        } else {
            const patientData = JSON.parse(p);
            setPatient(patientData);

            // Pre-fill health metrics if they exist
            if (patientData.patient_info && patientData.patient_info.length > 0) {
                const info = patientData.patient_info[0];
                setHealthMetrics({
                    weight: info.weight || "",
                    height: info.height || "",
                    pressure: info.pressure || ""
                });
            }
        }
    }, [navigate]);

    const handleAnalyze = async () => {
        if (!symptoms) return;
        setLoading(true);
        try {
            // patient_info is an array from the database join
            const patientInfoId = patient.patient_info && patient.patient_info.length > 0
                ? patient.patient_info[0].id
                : null;

            if (!patientInfoId) {
                alert("Patient information not found. Please re-login.");
                return;
            }

            const res = await api.post('/api/consultation/predict', {
                patient_info_id: patientInfoId,
                symptoms,
                weight: healthMetrics.weight || null,
                height: healthMetrics.height || null,
                pressure: healthMetrics.pressure || null
            });
            setResult(res.data);

            // If HIGH risk, show appointment booking option
            if (res.data.risk_factor === 'HIGH') {
                setShowAppointment(true);
            }
        } catch (err) {
            console.error(err);
            alert("Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        navigate("/dashboard");
    };

    const handleBookAppointment = () => {
        // Navigate to appointment booking with consultation data
        navigate("/appointment", {
            state: {
                consultation: result,
                patient: patient
            }
        });
    };

    if (!patient) return null;

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
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
                    <IconButton color="inherit" onClick={goBack}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" fontWeight="bold">New Consultation</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                        <Typography variant="subtitle2">{patient.username}</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ p: 3, maxWidth: "800px", margin: "auto" }}>
                {!result ? (
                    <Box>
                        <Typography variant="h5" sx={{ mb: 2, color: "#2e7d32", fontWeight: "bold" }}>
                            What are you feeling today?
                        </Typography>
                        <Card sx={{ p: 2, borderRadius: 3, mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>Health Metrics (Optional)</Typography>
                                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                                    <TextField
                                        label="Weight (kg)"
                                        type="number"
                                        value={healthMetrics.weight}
                                        onChange={(e) => setHealthMetrics({ ...healthMetrics, weight: e.target.value })}
                                        sx={{ flex: 1, minWidth: '150px' }}
                                    />
                                    <TextField
                                        label="Height (cm)"
                                        type="number"
                                        value={healthMetrics.height}
                                        onChange={(e) => setHealthMetrics({ ...healthMetrics, height: e.target.value })}
                                        sx={{ flex: 1, minWidth: '150px' }}
                                    />
                                    <TextField
                                        label="BP (mmHg)"
                                        type="number"
                                        value={healthMetrics.pressure}
                                        onChange={(e) => setHealthMetrics({ ...healthMetrics, pressure: e.target.value })}
                                        sx={{ flex: 1, minWidth: '150px' }}
                                    />
                                </Box>

                                <Typography variant="h6" sx={{ mb: 2 }}>Symptoms</Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="Describe your symptoms (e.g., headache, fever, chest pain)..."
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    sx={{ mb: 3 }}
                                />
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={handleAnalyze}
                                    disabled={loading || !symptoms}
                                    sx={{
                                        bgcolor: "#2e7d32",
                                        py: 1.5,
                                        fontSize: "1.1rem",
                                        "&:hover": { bgcolor: "#1b5e20" }
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : "Analyze Health Risk"}
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>
                ) : (
                    <Box>
                        <Button onClick={() => { setResult(null); setSymptoms(""); }} sx={{ mb: 2 }}>
                            ← New Analysis
                        </Button>

                        <Card sx={{
                            p: 3,
                            borderRadius: 3,
                            borderLeft: "10px solid",
                            borderColor: result.risk_factor === "HIGH" ? "#d32f2f" : "#388e3c"
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                {result.risk_factor === "HIGH" ? (
                                    <WarningIcon sx={{ fontSize: 40, color: "#d32f2f" }} />
                                ) : (
                                    <CheckCircleIcon sx={{ fontSize: 40, color: "#388e3c" }} />
                                )}
                                <Box>
                                    <Typography variant="h5" fontWeight="bold" sx={{ color: result.risk_factor === "HIGH" ? "#d32f2f" : "#388e3c" }}>
                                        Risk Level: {result.risk_factor}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Diagnosis: {result.predicted_disease}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mt: 3, p: 2, bgcolor: result.risk_factor === "HIGH" ? "#ffebee" : "#e8f5e9", borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>Recommended Action</Typography>
                                {result.risk_factor === "HIGH" ? (
                                    <Box>
                                        <Typography sx={{ mb: 2 }}>
                                            Your symptoms indicate a potential high-risk condition. Immediate medical attention is recommended.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            fullWidth
                                            size="large"
                                            onClick={handleBookAppointment}
                                        >
                                            Book Emergency Appointment
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Typography sx={{ mb: 2 }}>
                                            Your condition appears stable. Rest and hydration are advised.
                                        </Typography>
                                        <Button variant="contained" color="success" fullWidth size="large">
                                            View & Download Prescription
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Card>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Consultation;
