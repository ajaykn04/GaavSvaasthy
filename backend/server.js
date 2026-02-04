const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const supabase = require('./config/supabaseClient');

const app = express();
const PORT = process.env.PORT || 5000;

const patientRoutes = require('./routes/patientRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

app.use(cors());
app.use(express.json());

console.log('Patient Routes:', patientRoutes);
console.log('Consultation Routes:', consultationRoutes);
console.log('Appointment Routes:', appointmentRoutes);

app.use('/api/patients', patientRoutes);
app.use('/api/consultation', consultationRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Example route to test Supabase connection
app.get('/test-supabase', async (req, res) => {
    if (!supabase) {
        return res.status(503).json({ error: 'Supabase client not initialized' });
    }
    const { data, error } = await supabase.from('test').select('*').limit(1);
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json({ message: 'Supabase connection successful', data });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Supabase client initialized');
});
