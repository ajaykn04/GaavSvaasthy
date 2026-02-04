import React, { useState } from "react";
import { Box, Button, TextField, Typography, Card, CardActionArea, CardContent, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

const MOCK_DATA = {
  "9876543210": [
    { id: "P1", username: "Rajesh Singh", age: 45, place: "Nabha", admin: false },
    { id: "P2", username: "Sunita Kaur", age: 40, place: "Nabha", admin: false }
  ],
  "admin": [
    { id: "A1", username: "Hospital Staff", admin: true, place: "Civil Hospital" }
  ]
};

const Login = () => {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(1); 
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlePhoneSubmit = () => {
    if (!phone) {
      setError("Please enter a phone number");
      return;
    }
    const foundUsers = MOCK_DATA[phone];
    if (foundUsers) {
      setPatients(foundUsers);
      setStep(2);
      setError("");
    } else {
      setError("Number not found. Try '9876543210' or 'admin'");
    }
  };

  const selectUser = (user) => {
    localStorage.setItem("userData", JSON.stringify(user));
    user.admin ? navigate("/admindash") : navigate("/userdash");
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
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{ bgcolor: "#2e7d32", py: 2, fontWeight: "bold", "&:hover": { bgcolor: "#1b5e20" } }}
              onClick={handlePhoneSubmit}
            >
              Access Records
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
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardActionArea onClick={() => selectUser(p)} sx={{ p: 1 }}>
                      <CardContent>
                        <Typography variant="h6" color="#2e7d32">{p.username}</Typography>
                        <Typography variant="body2">{p.place} • {p.age} Yrs</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Button onClick={() => setStep(1)} sx={{ mt: 2, color: "#2e7d32", textTransform: "none" }}>
              ← Switch Number
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Login;