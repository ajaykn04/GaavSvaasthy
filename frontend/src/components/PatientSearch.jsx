import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const PatientSearch = () => {
    const [mobile, setMobile] = useState('');
    const [patients, setPatients] = useState([]);
    const [searched, setSearched] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async () => {
        if (!mobile) return;
        try {
            const res = await api.get(`/api/patients/search/${mobile}`);
            setPatients(res.data);
            setSearched(true);
        } catch (err) {
            console.error(err);
            alert('Error searching for patients');
        }
    };

    const handleSelect = (patient) => {
        // Store selected patient in local storage or context (simple approach for now)
        localStorage.setItem('currentPatient', JSON.stringify(patient));
        navigate('/consultation');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h2>Patient Search</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter Mobile Number"
                    style={{ padding: '10px', flex: 1 }}
                />
                <button onClick={handleSearch} style={{ padding: '10px 20px' }}>Search</button>
            </div>

            {searched && (
                <div>
                    {patients.length > 0 ? (
                        <div>
                            <h3>Select Patient:</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {patients.map(p => (
                                    <li key={p.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <strong>{p.full_name}</strong> ({p.age} / {p.gender})
                                        </div>
                                        <button onClick={() => handleSelect(p)}>Select</button>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => navigate('/register', { state: { mobile } })}
                                style={{ marginTop: '20px', background: '#eee', color: '#333' }}
                            >
                                + Add New Member to this Number
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p>No patients found for this number.</p>
                            <button onClick={() => navigate('/register', { state: { mobile } })}>
                                Register New Patient
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PatientSearch;
