const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

// Book a new appointment
router.post('/', async (req, res) => {
    const { patient_id, doctor_id, consultation_id, appointment_date, slot_start, slot_end } = req.body;

    if (!supabase) {
        return res.status(503).json({ error: 'Database service unavailable' });
    }

    if (!patient_id || !doctor_id || !appointment_date || !slot_start || !slot_end) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Check if slot is still available
        const { data: existing, error: checkError } = await supabase
            .from('appointments')
            .select('id')
            .eq('doctor_id', doctor_id)
            .eq('appointment_date', appointment_date)
            .eq('slot_start', slot_start)
            .in('status', ['BOOKED', 'CONFIRMED']);

        if (checkError) throw checkError;

        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'This slot is no longer available' });
        }

        // Generate Token Number
        // Count existing appointments for this doctor on this date
        const { count, error: countError } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('doctor_id', doctor_id)
            .eq('appointment_date', appointment_date);

        if (countError) throw countError;

        const tokenNo = count + 1;

        // Create appointment
        const { data, error } = await supabase
            .from('appointments')
            .insert([{
                patient_id,
                doctor_id,
                consultation_id,
                appointment_date,
                slot_start,
                slot_end,
                status: 'BOOKED',
                token_no: tokenNo
            }])
            .select(`
                *,
                doctors (name, specialization)
            `);

        if (error) throw error;

        res.status(201).json(data[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get appointments for a patient
router.get('/patient/:patient_id', async (req, res) => {
    const { patient_id } = req.params;

    if (!supabase) {
        return res.status(503).json({ error: 'Database service unavailable' });
    }

    try {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                doctors (name, specialization, phone)
            `)
            .eq('patient_id', patient_id)
            .order('appointment_date', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
