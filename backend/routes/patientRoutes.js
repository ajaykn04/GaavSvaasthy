const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

// Search patients by phone number
router.get('/search/:phone', async (req, res) => {
    const { phone } = req.params;

    if (!supabase) {
        return res.status(503).json({ error: 'Database service unavailable' });
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('*, patient_info(*)')
            .eq('phone_number', phone)
            .eq('role', 'patient');

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Register new patient
router.post('/', async (req, res) => {
    const { phone_number, username, age, address } = req.body;

    if (!supabase) {
        return res.status(503).json({ error: 'Database service unavailable' });
    }

    try {
        // 1. Create user record
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([{ phone_number, username, age, address: address || null, role: 'patient' }])
            .select();

        if (userError) throw userError;

        // 2. Create patient_info record (health metrics will be added during consultation)
        const { data: patientData, error: patientError } = await supabase
            .from('patient_info')
            .insert([{
                user_id: userData[0].id,
                weight: null,
                height: null,
                pressure: null
            }])
            .select();

        if (patientError) throw patientError;

        // 3. Return combined data
        const combinedData = {
            ...userData[0],
            patient_info: patientData
        };

        res.status(201).json(combinedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
