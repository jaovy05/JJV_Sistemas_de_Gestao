import React from 'react';
import { Typography } from '@mui/material';
import TableCliente from './TableCliente';

const Cliente = () => (
    <div>
      <Typography variant="h6" 
      sx={{ display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: '1em' 
            }}>
              Cadastro de Cliente
      </Typography>
    <TableCliente />
    </div>
);

export default Cliente;