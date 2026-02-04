const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const axios = require('axios'); // Install this: npm install axios

router.post('/predict', async (req, res) => {
    const { user_id, symptoms, weight, height, pressure } = req.body;

    try {
        // 1. Call the Flask AI Service
        const flaskResponse = await axios.post('http://127.0.0.1:5001/predict_ai', {
            symptoms: symptoms
        });

        const { disease, criticality, medicines } = flaskResponse.data;

        // 2. Prepare logic for database
        const symptomsArray = symptoms.split(',').map(s => s.trim());
        const needsAppointment = criticality === 'HIGH';

        // 3. Save to Supabase
        const { data: consultationData, error: consultError } = await supabase
            .from('consultations')
            .insert([{
                id: user_id,
                symptoms: symptomsArray,
                predicted_disease: disease,
                risk_factor: criticality,
                doctor_consulatation: needsAppointment ? 'True' : 'False',
                prescribed_meds: medicines // Ensure this column exists in Supabase
            }])
            .select();

        if (consultError) throw consultError;

        // 4. Update health metrics
        if (weight || height || pressure) {
            await supabase.from('patient_info').update({ weight, height, pressure }).eq('user_id', user_id);
        }

        // 5. Send combined response to React
        res.json({
            ...consultationData[0],
            action: needsAppointment ? 'RE-ROUTE_TO_APPOINTMENT' : 'SHOW_MEDICINES',
            medicines: medicines
        });

    } catch (err) {
        console.error("AI Service Error:", err.message);
        res.status(500).json({ error: "Failed to process AI prediction" });
    }
});
module.exports = router;