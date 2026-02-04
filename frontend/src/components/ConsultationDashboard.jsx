import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ConsultationDashboard = () => {
    const [patient, setPatient] = useState(null);
    const [symptoms, setSymptoms] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const p = localStorage.getItem('currentPatient');
        if (!p) {
            navigate('/search'); // Redirect to search if no patient selected
        } else {
            setPatient(JSON.parse(p));
        }
    }, [navigate]);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const res = await api.post('/api/consultation/predict', {
                patient_id: patient.id,
                symptoms
            });
            setResult(res.data);
        } catch (err) {
            console.error(err);
            alert('Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    if (!patient) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Consultation Dashboard</h2>
                <button onClick={() => { localStorage.removeItem('currentPatient'); navigate('/search'); }}>
                    Exit Case
                </button>
            </div>

            <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>Patient Details</h3>
                <p><strong>Name:</strong> {patient.full_name}</p>
                <p><strong>Age:</strong> {patient.age} | <strong>Gender:</strong> {patient.gender}</p>
            </div>

            {!result ? (
                <div>
                    <h3>Symptoms & Diagnosis</h3>
                    <textarea
                        rows="5"
                        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                        placeholder="Describe patient symptoms (e.g., headache, fever, chest pain)..."
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !symptoms}
                        style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        {loading ? 'Analyzing AI Model...' : 'Analyze Symptoms'}
                    </button>
                </div>
            ) : (
                <div style={{ border: '2px solid', borderColor: result.risk_level === 'HIGH' ? 'red' : 'green', padding: '20px', borderRadius: '8px' }}>
                    <h3 style={{ color: result.risk_level === 'HIGH' ? 'red' : 'green' }}>
                        Risk Level: {result.risk_level}
                    </h3>
                    <p><strong>Diagnosis:</strong> {result.diagnosis}</p>

                    {result.risk_level === 'HIGH' ? (
                        <div style={{ marginTop: '20px', background: '#ffebee', padding: '15px' }}>
                            <h4>⚠️ Action Required: Immediate Appointment</h4>
                            <p>The system has detected high-risk indicators. Connecting to appointment booking...</p>
                            <button style={{ padding: '10px', background: 'red', color: 'white', border: 'none' }}>
                                Book Emergency Appointment
                            </button>
                        </div>
                    ) : (
                        <div style={{ marginTop: '20px', background: '#e8f5e9', padding: '15px' }}>
                            <h4>✅ Action: Prescription / Home Care</h4>
                            <p>Symptoms appear mild. Recommended course of action:</p>
                            <ul>
                                <li>Rest and hydration</li>
                                <li>Monitor temperature</li>
                                <li>Follow up in 2 days if symptoms persist</li>
                            </ul>
                            <button style={{ padding: '10px', background: 'green', color: 'white', border: 'none' }}>
                                Generate Prescription
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => { setResult(null); setSymptoms(''); }}
                        style={{ marginTop: '20px', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        New Analysis
                    </button>
                </div>
            )}
        </div>
    );
};

export default ConsultationDashboard;
