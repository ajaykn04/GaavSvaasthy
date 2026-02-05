import React, { useState } from "react";
import { Box, Button, TextField, Typography, CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const DoctorLogin = () => {
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!phone) {
            setError("Please enter your registered phone number.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await api.post("/api/doctors/login", { phone });
            if (res.data) {
                // Save doctor info to local storage
                localStorage.setItem("doctor", JSON.stringify(res.data));
                navigate("/doctor/dashboard");
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("Login failed. Please check your connection or try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                bgcolor: "#e3f2fd", // Light blue background for doctors
                p: 2
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 400,
                    bgcolor: "white",
                    p: 4,
                    borderRadius: 4,
                    boxShadow: "0px 8px 24px rgba(0,0,0,0.1)",
                    textAlign: "center"
                }}
            >
                <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold", color: "#1565c0" }}>
                    Doctor Portal
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Login to manage appointments
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <TextField
                    fullWidth
                    label="Registered Phone Number"
                    variant="outlined"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    sx={{ mb: 3 }}
                    disabled={loading}
                    type="tel"
                />

                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleLogin}
                    disabled={loading}
                    sx={{
                        bgcolor: "#1565c0",
                        py: 1.5,
                        fontWeight: "bold",
                        "&:hover": { bgcolor: "#0d47a1" }
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
                </Button>

                <Button
                    variant="text"
                    sx={{ mt: 2, color: "#1565c0" }}
                    onClick={() => navigate("/")}
                >
                    Back to Patient Portal
                </Button>
            </Box>
        </Box>
    );
};

export default DoctorLogin;
