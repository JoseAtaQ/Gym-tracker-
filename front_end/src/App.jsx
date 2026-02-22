import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Register from './components/register';
import Login from './components/login';
import WorkoutForm from './components/workoutForm';
import WorkoutList from './components/workoutList';
import PersonalRecords from './components/personalRecords';
import ProgressChart from './components/progressChart';
import axios from 'axios';


axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.token = token; // This matches the "token" header your backend is looking for
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const Home = () => {
  const auth = useAuth();
  //tell the list to update when the form saves data
  const [refresh, setRefresh] = React.useState(false); 
  const [view, setView] = React.useState('log');

  if (!auth) return <div>Loading Auth...</div>;

  const { user, logout } = auth;

  if (user) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Dashboard 🏋️‍♂️</h2>
          <div>
            <span>Welcome, <strong>{user.username}</strong> </span>
            <button onClick={logout} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </header>
        <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
          <button 
            onClick={() => setView('log')} 
            style={{ flex: 1, padding: '10px', backgroundColor: view === 'log' ? '#4caf50' : '#333', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Log Workouts
          </button>
          <button 
            onClick={() => setView('stats')} 
            style={ {flex: 1, padding: '10px', backgroundColor: view === 'stats' ? '#4caf50' : '#333', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Progress & Records
          </button>
        </div>
        <hr />
        {view === 'log' ? (
          <>
            <WorkoutForm onWorkoutAdded={() => setRefresh(!refresh)} />
            <WorkoutList refreshTrigger={refresh} />
          </>
        ) : (
          <>
            <PersonalRecords />
            <div style={{ marginTop: '30px' }}>
              <ProgressChart />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <Login />
      <p>OR</p>
      <Register />
    </div>
  );
};

// App stays at the bottom
function App() {
  return (
    <AuthProvider>
        <Home />
    </AuthProvider>
  );
}

export default App;
