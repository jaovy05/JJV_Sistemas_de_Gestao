import React from 'react';
import { Typography } from '@mui/material';
import TableRelatorio from './relatorio';

const Relatorio = () => (
    <div>
      <Typography variant="h6" 
      sx={{ display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: '1em' 
            }}>
              
      </Typography>
    <TableRelatorio />
    </div>
);

export default Relatorio;