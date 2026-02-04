import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const RegistrationForm = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        mobile_number: '',
        full_name: '',
        age: '',
        gender: 'Male'
    });

    useEffect(() => {
        if (state && state.mobile) {
            setFormData(prev => ({ ...prev, mobile_number: state.mobile }));
        }
    }, [state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/patients', formData);
            // Auto login/select
            localStorage.setItem('currentPatient', JSON.stringify(res.data));
            navigate('/consultation');
        } catch (err) {
            console.error(err);
            alert('Registration Failed');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
            <h2>Register New Patient</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    placeholder="Mobile Number"
                    value={formData.mobile_number}
                    onChange={e => setFormData({ ...formData, mobile_number: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Age"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    required
                />
                <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                <button type="submit" style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    Register & Start Consultation
                </button>
            </form>
        </div>
    );
};

export default RegistrationForm;
