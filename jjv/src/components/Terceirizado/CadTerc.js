import React from 'react';
import { Typography } from '@mui/material';
import TableTerc from './TableTerc';

const Terceirizado = () => (
    <div>
      <Typography variant="h6" 
      sx={{ display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: '1em' 
            }}>
              Cadastro de Terceirizado
      </Typography>
    <TableTerc />
    </div>
);

export default Terceirizado;