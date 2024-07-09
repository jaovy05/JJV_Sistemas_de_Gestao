import React from 'react';
import { Typography } from '@mui/material';
import TableModelo from './TableModelo';

const Modelos = () => (
    <div>
      <Typography variant="h6" 
      sx={{ display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: '1em' 
            }}>
              Cadastro de Modelo
      </Typography>
    <TableModelo />
    </div>
);

export default Modelos;