import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PersonalRecords = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const fetchPRs = async () => {
            const res = await axios.get(`http://localhost:5000/personal-records/${user.id}`);
            setRecords(res.data);
        };
        fetchPRs();
    }, [user.id]);

    return (
        <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: 'white', borderRadius: '8px' }}>
            <h3> Personal Records</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {records.map(r => (
                    <div key={r.exercise_name} style={{ border: '1px solid #444', padding: '10px' }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>{r.exercise_name}</p>
                        <p style={{ margin: 0, fontSize: '1.2rem', color: '#4caf50' }}>{r.max_weight} lbs</p>
                        <small>{new Date(r.date_set).toLocaleDateString()}</small>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default PersonalRecords;
