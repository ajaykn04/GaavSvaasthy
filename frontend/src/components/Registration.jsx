import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, MenuItem, CircularProgress } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Registration = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        phone_number: "",
        username: "",
        age: "",
        address: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (state && state.mobile) {
            setFormData(prev => ({ ...prev, phone_number: state.mobile }));
        }
    }, [state]);

    const handleSubmit = async () => {
        if (!formData.username || !formData.age || !formData.phone_number) {
            setError("Please fill all required fields.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await api.post('/api/patients', formData);
            // Auto login/select
            localStorage.setItem('currentPatient', JSON.stringify(res.data));
            navigate('/consultation');
        } catch (err) {
            setError("Registration failed. Try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100vw",
            height: "100vh",
            bgcolor: "#e8f5e9",
            overflow: "hidden"
        }}>
            <Box
                sx={{
                    width: { xs: "90%", sm: "400px" },
                    p: 4,
                    bgcolor: "white",
                    boxShadow: "0px 10px 40px rgba(0,0,0,0.15)",
                    borderRadius: 4,
                    textAlign: "center"
                }}
            >
                <Typography variant="h4" sx={{ mb: 1, fontWeight: "900", color: "#2e7d32" }}>
                    New Registration
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
                    Join GaavSwaasthy Community
                </Typography>

                <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone_number}
                    onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                />
                <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                />
                <TextField
                    fullWidth
                    label="Age"
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                />
                <TextField
                    fullWidth
                    label="Address (Village/City)"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    sx={{ mb: 2 }}
                    placeholder="Optional"
                />

                {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ bgcolor: "#2e7d32", py: 1.5, fontWeight: "bold", "&:hover": { bgcolor: "#1b5e20" } }}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Register & Continue"}
                </Button>

                <Button
                    onClick={() => navigate('/login')}
                    sx={{ mt: 2, color: "text.secondary", textTransform: "none" }}
                >
                    Cancel
                </Button>
            </Box>
        </Box>
    );
};

export default Registration;
