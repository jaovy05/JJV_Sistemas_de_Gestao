import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Grid } from '@mui/material';

function createData(pedido, terceirizado, data, status) {
  return { pedido, terceirizado, data, status };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24),
  createData('Ice cream sandwich', 237, 9.0, 37),
  createData('Eclair', 262, 16.0, 24),
  createData('Cupcake', 305, 3.7, 67),
  createData('Gingerbread', 356, 16.0, 49),
];

export default function BasicTable() {
  return (
    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
      <TableContainer component={Paper} sx={{ width: "100%", display: "table", tableLayout: "fixed" }}>
        <Table sx={{ width: '100%' }} size="lg"
          stripe="even"
          variant="soft">
          <TableHead>
            <TableRow>
              <TableCell>Pedido</TableCell>
              <TableCell>Terceirizado</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.pedido}
              >
                <TableCell>{row.pedido}</TableCell>
                <TableCell>{row.terceirizado}</TableCell>
                <TableCell>{row.data}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
}
