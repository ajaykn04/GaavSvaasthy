const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const axios = require('axios'); // Install this: npm install axios

router.post('/predict', async (req, res) => {
    const { patient_info_id, symptoms, weight, height, pressure } = req.body;

    if (!patient_info_id) {
        return res.status(400).json({ error: 'patient_info_id is required' });
    }

    let disease, criticality, medicines, symptomsArray;

    try {
        // 1. Try calling the Flask AI Service
        const flaskResponse = await axios.post('http://127.0.0.1:5001/predict_ai', {
            symptoms: symptoms
        },) //{ timeout: 3000 }); // 3 second timeout

        disease = flaskResponse.data.disease;
        criticality = flaskResponse.data.criticality;
        medicines = flaskResponse.data.medicines;
        symptomsArray = symptoms.split(',').map(s => s.trim());

    } catch (flaskError) {
        console.warn('Flask AI service unavailable, using fallback analysis:', flaskError.message);

        // Fallback: Simple keyword-based analysis
        const lowerSymptoms = symptoms.toLowerCase();
        const highRiskKeywords = ['chest pain', 'breathing', 'severe', 'blood', 'unconscious', 'heart attack'];
        const mediumRiskKeywords = ['fever', 'vomiting', 'pain', 'infection'];

        const isHigh = highRiskKeywords.some(word => lowerSymptoms.includes(word));
        criticality = isHigh ? 'HIGH' : mediumRiskKeywords.some(word => lowerSymptoms.includes(word)) ? 'MEDIUM' : 'LOW';

        disease = criticality === 'HIGH' ? 'Potential Critical Condition' :
            criticality === 'MEDIUM' ? 'Possible Infection or Inflammation' :
                'Mild Symptoms';

        medicines = criticality === 'LOW' ? ['Rest', 'Hydration', 'Monitor symptoms'] : ['Consult doctor immediately'];
        symptomsArray = symptoms.split(',').map(s => s.trim());
    }

    try {
        const needsAppointment = criticality === 'HIGH';

        // Save to Supabase
        const { data: consultationData, error: consultError } = await supabase
            .from('consultations')
            .insert([{
                patient_id: patient_info_id,  // This is patient_info.id
                symptoms: symptomsArray,
                predicted_disease: disease,
                risk_factor: criticality,
                doctor_consultation: needsAppointment
            }])
            .select();

        if (consultError) throw consultError;

        // Update health metrics
        if (weight || height || pressure) {
            const updateData = {};
            if (weight) updateData.weight = weight;
            if (height) updateData.height = height;
            if (pressure) updateData.pressure = pressure;

            await supabase
                .from('patient_info')
                .update(updateData)
                .eq('id', patient_info_id);
        }

        // Send combined response to React
        res.json({
            ...consultationData[0],
            action: needsAppointment ? 'RE-ROUTE_TO_APPOINTMENT' : 'SHOW_MEDICINES',
            medicines: medicines || []
        });

    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).json({ error: "Failed to save consultation: " + err.message });
    }
});

// Get all consultations for a patient
router.get('/patient/:patient_id', async (req, res) => {
    const { patient_id } = req.params;

    if (!supabase) {
        return res.status(503).json({ error: 'Database service unavailable' });
    }

    try {
        const { data, error } = await supabase
            .from('consultations')
            .select('*')
            .eq('patient_id', patient_id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;