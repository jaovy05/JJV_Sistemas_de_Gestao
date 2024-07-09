import React from 'react';
import { Typography } from '@mui/material';
import TableOperacao from './TableOperação';

function Operacao() {
    return (
        <div>
            <Typography variant="h6" 
            sx={{ display: 'flex',
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    marginBottom: '1em' 
                    }}>
                    Cadastro de Operação
            </Typography>
            <TableOperacao />
        </div>
    )
    
};

export default Operacao;