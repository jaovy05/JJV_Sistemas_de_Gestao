import React from 'react';
import { Typography } from '@mui/material';
import TablePessoa from '../TablePessoa/TablePessoa';

const CadastroPessoa = () => (
    <div>
      <Typography variant="h6" 
      sx={{ display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center', 
            marginBottom: '1em' 
            }}>
              Cadastro de Pessoa
      </Typography>
    <TablePessoa />
    </div>
);

export default CadastroPessoa;