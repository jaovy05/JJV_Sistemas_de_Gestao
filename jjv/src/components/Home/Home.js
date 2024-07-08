import React from 'react';
import TableHome from '../TableHome/TableHome';
import { Typography } from '@mui/material';

const Home = () => (

  <div>
    <Typography variant="h6"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '2em'
      }}>
      Pedidos em Andamento
    </Typography>
    <TableHome />
  </div>

);

export default Home;
