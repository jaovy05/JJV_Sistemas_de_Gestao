import React from 'react';
import axios from 'axios';
import { Box, Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography, useMediaQuery } from '@mui/material';
import Icon from '@mdi/react';
import { mdiSquareEditOutline } from '@mdi/js';

function TableHome() {
  const [dados, setDados] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    async function fetchHome() {
      try {
        const response = await axios.get("http://localhost:5000/tablehome");
        setDados(response.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchHome();
  }, []);

  const isMobile = useMediaQuery('(max-width:600px)');

  const columns = [
    { id: 'pedido', label: 'Pedido', minWidth: isMobile ? '100%' : 10 },
    { id: 'nome', label: 'Terceirizado', minWidth: isMobile ? '100%' : 120 },
    { id: 'dsc', label: 'Modelo', minWidth: isMobile ? '100%' : 120 },
  ];

  const rows = dados.map(cliente => ({
    ...cliente, pedido: cliente.pedido, nome: cliente.nome, dsc: cliente.dsc}));

      //manipulação de paginação
      const handleChangePage = (event, newPage) => {
        setPage(newPage);
      };
  
      const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setPage(0);
      }

  return (
    <Grid container spacing={{ xs: 2 }}>
    <Grid item xs={12}>
      {isMobile ? (
        dados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((cliente) => (
          <Box key={cliente.codp} sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2, boxShadow: 1, width: "100%" }}>
            {columns.map((column) => (
              <Box key={column.id} sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>{column.label}:</Typography>
                <Typography variant="body2">
                  {column.id === "edit" ? (
                    <Tooltip title="Editar">
                      <IconButton sx={{ color: 'warning.main' }}>
                        <Icon path={mdiSquareEditOutline} size={1} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    cliente[column.id]
                  )}
                </Typography>
              </Box>
            ))}
          </Box>
        ))
      ) : (
        <TableContainer component={Box} sx={{ display: "table", tableLayout: "fixed", overflowX: 'auto' }}>
          <Table
            size="small" aria-label="a dense table"
            stripe="even"
            variant="soft">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ top: 57, minWidth: column.minWidth }}
                    sx={{ minWidth: isMobile ? '100%' : '150px' }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth }}>
                            {column.format && typeof value === 'number'
                              ? column.format(value)
                              : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Grid>
    <TablePagination
      rowsPerPageOptions={[5, 10]}
      component="div"
      count={rows.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  </Grid>
  );

}

export default TableHome;
