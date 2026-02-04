import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const TestBackend = () => {
    const [message, setMessage] = useState('Connecting...');
    const [error, setError] = useState('');

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const response = await api.get('/');
                setMessage(response.data);
            } catch (err) {
                setError(err.message);
                setMessage('Connection Failed');
            }
        };

        checkConnection();
    }, []);

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Backend Connection Status</h2>
            {error ? (
                <p style={{ color: 'red' }}>Error: {error}</p>
            ) : (
                <p style={{ color: 'green' }}>{message}</p>
            )}
        </div>
    );
};

export default TestBackend;
