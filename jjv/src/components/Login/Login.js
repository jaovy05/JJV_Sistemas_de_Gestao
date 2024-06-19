import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', { name, password });
      localStorage.setItem('token', response.data.token);
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className='login'>
      <h1>Login</h1>
      <input
        type="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
      />
      <div className='msgAlert'>{msg !== '' && <p>{msg}</p>}</div>
      <button onClick={() => {
        if (name === '') {
          setMsg('Preencha o campo nome');
          return
        }
        if (password === '') {
          setMsg('Preencha o campo senha');
          return false
        }
        setMsg('');
        handleLogin();
      }}>Login</button>
    </div>
  );
}

export default Login;
