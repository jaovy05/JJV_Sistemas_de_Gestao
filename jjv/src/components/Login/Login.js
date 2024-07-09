import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function Login({onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const entrar = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password});
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('cod', response.data.cod); 
<<<<<<< HEAD
      if(response.data.isAdm) onLogin();
=======
>>>>>>> a639927 (criando relatorio, corte de peças e modelo)
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
            label="Email"
            name='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

