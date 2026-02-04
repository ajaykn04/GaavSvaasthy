const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

// Get all active doctors
router.get('/doctors', async (req, res) => {
    if (!supabase) {
        return res.status(503).json({ error: 'Database service unavailable' });
    }

    try {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('active', true);

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get available time slots for a specific doctor on a specific date
router.get('/availability/:doctor_id/:date', async (req, res) => {
    const { doctor_id, date } = req.params;

    if (!supabase) {
        return res.status(503).json({ error: 'Database service unavailable' });
    }

    try {
        // Get doctor's availability for the date
        const { data: availability, error: availError } = await supabase
            .from('doctor_availability')
            .select('*')
            .eq('doctor_id', doctor_id)
            .eq('available_date', date);

        if (availError) throw availError;

        // Get already booked appointments for this doctor on this date
        const { data: bookedSlots, error: bookError } = await supabase
            .from('appointments')
            .select('slot_start, slot_end')
            .eq('doctor_id', doctor_id)
            .eq('appointment_date', date)
            .neq('status', 'cancelled');

        if (bookError) throw bookError;

        res.json({
            availability,
            bookedSlots: bookedSlots || []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Book an appointment
router.post('/book', async (req, res) => {
    const { doctor_id, patient_id, consultation_id, appointment_date, slot_start, slot_end } = req.body;

    if (!supabase) {
        return res.status(503).json({ error: 'Database service unavailable' });
    }

    try {
        // Check if slot is still available
        const { data: existing, error: checkError } = await supabase
            .from('appointments')
            .select('id')
            .eq('doctor_id', doctor_id)
            .eq('appointment_date', appointment_date)
            .eq('slot_start', slot_start)
            .neq('status', 'cancelled');

        if (checkError) throw checkError;

        if (existing && existing.length > 0) {
            return res.status(409).json({ error: 'Time slot is already booked' });
        }

        // Create appointment
        const { data, error } = await supabase
            .from('appointments')
            .insert([{
                doctor_id,
                patient_id,
                consultation_id,
                appointment_date,
                slot_start,
                slot_end,
                status: 'scheduled'
            }])
            .select();

        if (error) throw error;

        res.status(201).json(data[0]);
    } catch (err) {
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
            .select('*, doctors(*)')
            .eq('patient_id', patient_id)
            .order('appointment_date', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
