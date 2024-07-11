import React from 'react';
import { Typography } from '@mui/material';
import TableTecido from './TableTecido';

const Tecido = () => (
    <div>
      <Typography variant="h6" 
      sx={{ display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: '1em' 
            }}>
              Cadastro de Tecido
      </Typography>
    <TableTecido />
    </div>
);

export default Tecido;