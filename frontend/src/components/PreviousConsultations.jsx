import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, Grid, Chip, IconButton, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const PreviousConsultations = () => {
    const navigate = useNavigate();
    const [consultations, setConsultations] = useState([]);
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
                const res = await api.get(`/api/consultation/patient/${patientInfoId}`);
                setConsultations(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [navigate]);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" ,
      width: "100vw",ml:-5,mt:-4}}>
            <Box sx={{ bgcolor: "#2e7d32", color: "white", p: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton color="inherit" onClick={() => navigate("/dashboard")}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight="bold">My Consultations</Typography>
            </Box>

            <Box sx={{ p: 3, maxWidth: "1000px", margin: "auto" ,ml:"15vw"}}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : consultations.length === 0 ? (
                    <Typography textAlign="center" color="text.secondary" sx={{ mt: 5 }}>
                        No consultation history found.
                    </Typography>
                ) : (
                    <Grid container spacing={3}>
  {consultations.map((consult) => (
    <Grid
      item
      xs={12}   // Mobile: 1 card
      sm={6}    // Tablet: 2 cards
      md={4}    // Small desktop: 3 cards
      lg={3}    // Large desktop: 4 cards (12/3 = 4)
      key={consult.id}
      display="flex"
    >
      <Card
        sx={{
          width: "20vw",
          height: "30vh", // Make all cards equal height
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          borderLeft: `6px solid ${
            consult.risk_factor === "HIGH" ? "#d32f2f" : "#388e3c"
          }`,
          boxShadow: 3,
        }}
      >
        <CardContent
          sx={{
            flexGrow: 1, // Push content evenly
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              {new Date(consult.created_at).toLocaleDateString()}
            </Typography>

            <Chip
              label={consult.risk_factor}
              color={consult.risk_factor === "HIGH" ? "error" : "success"}
              size="small"
              icon={
                consult.risk_factor === "HIGH" ? (
                  <WarningIcon />
                ) : (
                  <CheckCircleIcon />
                )
              }
            />
          </Box>

          {/* Middle Section */}
          <Typography variant="h6" gutterBottom>
            {consult.predicted_disease}
          </Typography>

          {/* Bottom Section */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: "auto" }} // Push to bottom
          >
            <strong>Symptoms:</strong>{" "}
            {Array.isArray(consult.symptoms)
              ? consult.symptoms.join(", ")
              : consult.symptoms}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: "auto" }} // Push to bottom
          >
            <strong>Medicines:</strong>{" "}
            {Array.isArray(consult.prescribed_medicines.medicines)
              ? consult.prescribed_medicines.medicines.join(", ")
              : consult.prescribed_medicines.medicines}{consult.prescribed_medicines?.rest &&
  consult.prescribed_medicines.rest !== "Immediate medical attention required" &&
  ` & rest ${consult.prescribed_medicines.rest}`}

          </Typography>
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

export default PreviousConsultations;
