const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

// Doctor Login
router.post('/login', async (req, res) => {
    const { phone } = req.body;

    if (!supabase) {
        return res.status(503).json({ error: 'Database service unavailable' });
    }

    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    try {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('phone', phone)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        if (!data.active) {
            return res.status(403).json({ error: 'Doctor account is inactive' });
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


// Get available doctors with their slots for a specific date
router.get('/available', async (req, res) => {
    const { date } = req.query; // Expected format: YYYY-MM-DD

    if (!supabase) {
        return res.status(503).json({ error: 'Database service unavailable' });
    }

    if (!date) {
        return res.status(400).json({ error: 'Date parameter is required' });
    }

    try {
        // Get all active doctors with availability for the given date
        const { data: availability, error: availError } = await supabase
            .from('doctor_availability')
            .select(`
                id,
                available_date,
                start_time,
                end_time,
                slot_duration,
                doctors (
                    id,
                    name,
                    specialization,
                    phone
                )
            `)
            .eq('available_date', date)
            .eq('doctors.active', true);

        if (availError) throw availError;

        // Get existing appointments for this date to filter out booked slots
        const { data: bookedAppointments, error: bookError } = await supabase
            .from('appointments')
            .select('doctor_id, slot_start, slot_end')
            .eq('appointment_date', date)
            .in('status', ['BOOKED', 'CONFIRMED']);

        if (bookError) throw bookError;

        // Process availability and generate time slots
        const doctorsWithSlots = availability.map(avail => {
            const slots = generateTimeSlots(
                avail.start_time,
                avail.end_time,
                avail.slot_duration
            );

            // Filter out booked slots
            const bookedForDoctor = bookedAppointments.filter(
                apt => apt.doctor_id === avail.doctors.id
            );

            const availableSlots = slots.filter(slot => {
                return !bookedForDoctor.some(booked =>
                    booked.slot_start === slot.start && booked.slot_end === slot.end
                );
            });

            return {
                doctor_id: avail.doctors.id,
                doctor_name: avail.doctors.name,
                specialization: avail.doctors.specialization,
                phone: avail.doctors.phone,
                available_slots: availableSlots
            };
        }).filter(doc => doc.available_slots.length > 0); // Only include doctors with available slots

        res.json(doctorsWithSlots);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime, durationMinutes) {
    const slots = [];
    let current = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    while (current + durationMinutes <= end) {
        const slotStart = minutesToTime(current);
        const slotEnd = minutesToTime(current + durationMinutes);
        slots.push({ start: slotStart, end: slotEnd });
        current += durationMinutes;
    }

    return slots;
}

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}:00`;
}

module.exports = router;
