import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProgressChart = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState('Bench Press');

    useEffect(() => {
        const fetchChartData = async () => {
            const res = await axios.get(`http://localhost:5000/workouts/${user.id}`);
            // Filter for selected exercise and format for Recharts
            const filtered = res.data
                .filter(w => w.exercise_name === selectedExercise)
                .map(w => ({
                    date: new Date(w.created_at).toLocaleDateString(),
                    weight: parseFloat(w.weight_lbs)
                }))
                .reverse(); // Show oldest to newest
            setData(filtered);
        };
        fetchChartData();
    }, [selectedExercise, user.id]);

    return (
        <div style={{ width: '100%', height: 400, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', color: '#000' }}>
            <h3>Progress: {selectedExercise}</h3>
            <ResponsiveContainer width="100%" height="80%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#8884d8" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
export default ProgressChart;