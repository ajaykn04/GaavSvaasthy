const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

// Mock AI Logic for Risk Prediction
const analyzeRisk = (symptoms) => {
    const highRiskKeywords = ['chest pain', 'breathing', 'severe', 'blood', 'unconscious', 'heart'];
    const mediumRiskKeywords = ['fever', 'vomiting', 'pain', 'infection'];

    const lowerSymptoms = symptoms.toLowerCase();

    const isHigh = highRiskKeywords.some(word => lowerSymptoms.includes(word));
    if (isHigh) return 'HIGH';

    const isMedium = mediumRiskKeywords.some(word => lowerSymptoms.includes(word));
    if (isMedium) return 'MEDIUM';

    return 'LOW';
};

// Predict Disease & Risk with Health Metrics Collection
router.post('/predict', async (req, res) => {
    const { user_id, symptoms, weight, height, pressure } = req.body;

    if (!supabase) {
        // Fallback for demo without DB connection
        const risk = analyzeRisk(symptoms || '');
        return res.json({
            risk_factor: risk,
            predicted_disease: 'Analysis (Offline Mode)',
            message: 'Database unavailable, result is simulation.'
        });
    }

    try {
        const riskLevel = analyzeRisk(symptoms);
        let predictedDisease = '';

        switch (riskLevel) {
            case 'HIGH': predictedDisease = 'Potential Critical Condition - Immediate Care Required'; break;
            case 'MEDIUM': predictedDisease = 'Viral/Bacterial Infection - Medical Attention Recommended'; break;
            default: predictedDisease = 'Mild Symptoms - Rest and Hydration recommended'; break;
        }

        // Convert symptoms string to JSON array format
        const symptomsArray = symptoms.split(',').map(s => s.trim());

        // Save consultation record
        const { data: consultationData, error: consultError } = await supabase
            .from('consultations')
            .insert([{
                id: user_id,  // FK to users.id
                symptoms: symptomsArray,
                predicted_disease: predictedDisease,
                risk_factor: riskLevel,
                doctor_consulatation: riskLevel === 'HIGH' ? 'True' : 'False'
            }])
            .select();

        if (consultError) throw consultError;

        // Update patient_info with health metrics if provided
        if (weight || height || pressure) {
            const { error: updateError } = await supabase
                .from('patient_info')
                .update({
                    weight: weight || null,
                    height: height || null,
                    pressure: pressure || null
                })
                .eq('user_id', user_id);

            if (updateError) console.error('Failed to update patient_info:', updateError);
        }

        res.json(consultationData[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
