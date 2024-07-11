import React from 'react';
import { Typography } from '@mui/material';
import TableDesligamento from './TableDesligamento';

const Desligamento = () => (
    <div>
      <Typography variant="h6" 
      sx={{ display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: '1em' 
            }}>
              Cadastro de Desligamento
      </Typography>
    <TableDesligamento />
    </div>
);

export default Desligamento;