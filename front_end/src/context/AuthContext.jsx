import { createContext, useState, useContext } from 'react';
import axios from 'axios';
import React from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = React.useState(true);
  //register
  const register = async (username, email, password) => {
    console.log("Sending to backend:", { username, email, password });
    try {
      const res = await axios.post('http://localhost:5000/register', { 
        username, email, password 
      });
      setUser(res.data.user); // Save the user info we got back from Postgres!
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response.data.message };
    }
  };
  
  //auto-login on app start (if token exists)
  React.useEffect(() => {
    const checkLoggedIn = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        // If we find both, log them back in automatically
        setUser(JSON.parse(savedUser));
      }
      setLoading(false); // Done checking!
    };

    checkLoggedIn();
  }, []);

  //login
  const login = async (email, password) => {
  try {
    const res = await axios.post('http://localhost:5000/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token); // Save the "Hand Stamp"
    localStorage.setItem('user', JSON.stringify(userData)); // Save user info
    setUser(userData); // Update the global user state
    return { success: true };
  } catch (err) {
    return { success: false, error: err.response?.data?.message || "Login failed" };
  }
  };

  //logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {/* Don't render the app until we know if the user is logged in or not */}
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);