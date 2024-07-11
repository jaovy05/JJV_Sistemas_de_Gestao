import React from 'react';
import { Typography } from '@mui/material';
import TableFuncionario from './TableFuncionario';

const Funcionario = () => (
    <div>
      <Typography variant="h6" 
      sx={{ display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: '1em' 
            }}>
              Cadastro de Funcionário
      </Typography>
    <TableFuncionario />
    </div>
);

export default Funcionario;