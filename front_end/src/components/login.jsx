import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 

  const { login } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error); // Show error on screen instead of alert
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}
      
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Enter</button>
    </form>
  );
};

export default Login;