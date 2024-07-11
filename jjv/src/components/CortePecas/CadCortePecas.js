import React from 'react';
import { Typography } from '@mui/material';
import TableCortePecas from './TableCortePecas';

const CortePecas = () => (
    <div>
      <Typography variant="h6" 
      sx={{ display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: '1em' 
            }}>
              Cadastro de Corte de Peças
      </Typography>
    <TableCortePecas />
    </div>
);

export default CortePecas;