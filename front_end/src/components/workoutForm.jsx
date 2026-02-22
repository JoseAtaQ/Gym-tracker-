import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const WorkoutForm = ({ onWorkoutAdded }) => {
  const { user } = useAuth();

  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [filteredCatalog, setFilteredCatalog] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await axios.get('http://localhost:5000/exercises');
        setCatalog(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Could not load exercises", err);
      }
    };
    fetchCatalog();
  }, []);

  // Handle Searching
  const handleSearch = (e) => {
    const value = e.target.value;
    setExercise(value);
    if (value.length > 1) {
        const matches = catalog.filter(ex => 
            ex.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredCatalog(matches);
        setShowDropdown(true);
    } else {
        setShowDropdown(false);
    }
  };

  const selectExercise = (name) => {
    setExercise(name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/workouts', {
        headers: { token: localStorage.getItem('token') },
        user_id: user.id,
        exercise_name: exercise,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight_lbs: parseFloat(weight)
      });
      setExercise(''); setSets(''); setReps(''); setWeight('');
      onWorkoutAdded();
    } catch (err) {
      alert("Error saving workout");
    }
  };

  return (
    <div style={{ position: 'relative', marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
      <form onSubmit={handleSubmit}>
        <h3>Log Workout</h3>
        
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <input 
            type="text" 
            placeholder="Search Exercise..." 
            value={exercise} 
            onChange={handleSearch} 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            required 
          />
          
          {/* Searchable Dropdown */}
          {showDropdown && filteredCatalog.length > 0 && (
            <ul style={{ 
              position: 'absolute', top: '100%', left: 0, right: 0, 
              backgroundColor: 'white', border: '1px solid #ccc', 
              listStyle: 'none', padding: 0, margin: 0, zIndex: 1000, maxHeight: '200px', 
              overflowY: 'auto', boxShadow: '0px 4px 6px rgba(0,0,0,0.1)' 
            }}>
              {filteredCatalog.map(ex => (
                <li 
                  key={ex.id} 
                  onClick={() => selectExercise(ex.name)}
                  style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#000', textAlign: 'Left' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <span style={{ fontWeight: 'bold' }}>{ex.name}</span> 
                  <small style={{ color: '#666', marginLeft: '10px' }}>({ex.muscle_group})</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        <input type="number" placeholder="Sets" value={sets} onChange={(e) => setSets(e.target.value)} required />
        <input type="number" placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} required />
        <input type="number" placeholder="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} required />
        <button type="submit">Add to Log</button>
      </form>
    </div>
  );
};

export default WorkoutForm;