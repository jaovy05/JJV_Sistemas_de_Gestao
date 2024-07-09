import React from 'react';
import { Typography } from '@mui/material';
import TablePedido from './TablePedido';

const Pedido = () => (
    <div>
      <Typography variant="h6" 
      sx={{ display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: '1em' 
            }}>
              Cadastro Pedido
      </Typography>
    <TablePedido />
    </div>
);

export default Pedido;