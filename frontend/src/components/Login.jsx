import React, { useState } from "react";
import { Box, Button, TextField, Typography, Card, CardActionArea, CardContent, Grid, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(1);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePhoneSubmit = async () => {
    if (!phone) {
      setError("Please enter a phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/api/patients/search/${phone}`);
      // res.data is expected to be an array of patients
      if (res.data && res.data.length > 0) {
        setPatients(res.data);
        setStep(2);
      } else {
        setError("Number not found.");
      }
    } catch (err) {
      console.error(err);
      setError("Connection error or server unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const selectUser = (user) => {
    localStorage.setItem("currentPatient", JSON.stringify(user));
    navigate("/dashboard");
  };

  const goToRegister = () => {
    navigate("/register", { state: { mobile: phone } });
  };

  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100vw",
      height: "100vh",
      bgcolor: "#e8f5e9",
      overflow: "hidden",m: 0,
    p: 0,ml:-15,mt:-4,mb:-4
    }}>
      <Box
        sx={{
          // Responsive Aspect Ratio Sizing
          width: {
            xs: "min(95vw, (9/16) * 95vh)",
            md: "min(95vw, (16/9) * 95vh)"
          },
          height: {
            xs: "min(95vh, (16/9) * 95vw)",
            md: "min(95vh, (9/16) * 95vw)"
          },

          // Centering content inside the card
          display: "flex",
          flexDirection: "column",
          justifyContent: "center", // Vertical center
          alignItems: "center",     // Horizontal center
          textAlign: "center",

          p: { xs: 2, md: 4 },
          bgcolor: "white",
          boxShadow: "0px 10px 40px rgba(0,0,0,0.15)",
          borderRadius: 4,
        }}
      >
        <Typography variant="h3" sx={{
          mb: 1,
          fontWeight: "900",
          color: "#2e7d32",
          fontSize: { xs: "2rem", md: "3.5rem" }
        }}>
          GaavSwaasthy
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 4, color: "text.secondary" }}>
          Village Healthcare Portal
        </Typography>

        {step === 1 ? (
          <Box sx={{ width: "100%", maxWidth: "350px" }}>
            <TextField
              fullWidth
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={!!error}
              helperText={error}
              sx={{ mb: 3 }}
              disabled={loading}
            />
            {error === "Number not found." && (
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                size="large"
                sx={{ mb: 2, py: 1.5, fontWeight: "bold" }}
                onClick={goToRegister}
              >
                Register New Member
              </Button>
            )}
            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{ bgcolor: "#2e7d32", py: 2, fontWeight: "bold", "&:hover": { bgcolor: "#1b5e20" } }}
              onClick={handlePhoneSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Access Records"}
            </Button>
          </Box>
        ) : (
          <Box sx={{ width: "100%", overflowY: "auto", px: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Select Patient
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {patients.map((p) => (
                <Grid item xs={12} sm={6} key={p.id}>
                  <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#2e7d32" }}>
                    <CardActionArea onClick={() => selectUser(p)} sx={{ p: 1 }}>
                      <CardContent>
                        <Typography variant="h6" color="#2e7d32">{p.username}</Typography>
                        <Typography variant="body2">{p.age} Yrs</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Button
              onClick={goToRegister}
              fullWidth sx={{ mt: 2, mb: 1, textTransform: "none", color: "#1b5e20", bgcolor: "#e8f5e9" }}
            >
              + Add Another Member
            </Button>
            <Button onClick={() => { setStep(1); setPatients([]); setError(""); }} sx={{ mt: 1, color: "text.secondary", textTransform: "none" }}>
              ← Switch Number
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Login;