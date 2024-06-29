import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const entrar = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', { name, password });
      localStorage.setItem('token', response.data.token);
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const theme = createTheme({
    palette: {
      green: {
        main: '#427c44a6',
      },
    },
  });
  return (
    <div sx={{ bgcolor:'#FFEAAF'}}>
      <Box sx={{
        width: 1,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        gap: 3,
        bgcolor:'#f4f8f4'
      }}>
        <ThemeProvider theme={theme}>
          <TextField
            color='green'
            focused
            size='small'
            label="Nome"
            name='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            color='green'
            focused
            size='small'
            label="Senha"
            type="password"
            name='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="outlined" color="green" onClick={entrar}>Entrar</Button>
        </ThemeProvider>
      </Box>
    </div>
  );
}

export default Login;

