import React from 'react';
import { Typography } from '@mui/material';
import TableServico from './TableServico';

const Servico = () => (
    <div>
      <Typography variant="h6" 
      sx={{ display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: '1em' 
            }}>
              Cadastro de Servico
      </Typography>
    <TableServico />
    </div>
);

export default Servico;