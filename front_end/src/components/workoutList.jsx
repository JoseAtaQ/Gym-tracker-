import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
const token = localStorage.getItem('token');

const WorkoutList = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);

  const fetchWorkouts = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/workouts/${user.id}`, {
        headers: { token: token }
      });
      setWorkouts(res.data);
    } catch (err) {
      console.error("Error fetching workouts", err);
    }
  };
  const deleteWorkout = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/workouts/${id}`, {
        headers: { token: token }
      });
      // After deleting, fetch the updated list
      fetchWorkouts(); 
    } catch (err) {
      console.error("Error deleting workout", err);
    }
  };

  // Fetch workouts when the component loads OR when a new workout is added
  useEffect(() => {
    fetchWorkouts();
  }, [refreshTrigger, user.id]);

  return (
    <div>
      <h3>Your Recent History</h3>
      {workouts.length === 0 ? <p>No workouts found.</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {workouts.map((w) => (
            <li key={w.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              backgroundColor: '#222',
              padding: '10px',
              marginBottom: '8px',
              borderRadius: '5px'
            }}>
              <div>
                <strong>{w.exercise_name}</strong>: {w.sets} x {w.reps} @ {w.weight_lbs} lbs
              </div>
              <button 
                onClick={() => deleteWorkout(w.id)}
                style={{ backgroundColor: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px' }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WorkoutList;