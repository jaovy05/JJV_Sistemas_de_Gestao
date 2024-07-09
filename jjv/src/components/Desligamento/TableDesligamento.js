import React from "react";
import axios from "axios";
import Icon from "@mdi/react";
import { mdiDeleteForeverOutline } from '@mdi/js';
import { Box, Button, createTheme, Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, ThemeProvider, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { mdiDelete } from '@mdi/js';

function TableDesligamento() {
  const [desligamentos, setDesligamentos] = React.useState([]);
  const [novoDesligamento, setNovoDesligamento] = React.useState({ nome: '', cpfCnpj: '' });
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    async function fetchDesligamentos() {
      try {
        const response = await axios.get("http://localhost:5000/desligamento");
        setDesligamentos(response.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchDesligamentos();
  }, []);

  const isMobile = useMediaQuery('(max-width:600px)');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoDesligamento({ ...novoDesligamento, [name]: value });
  };

  const submitDesligamento = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/desligamento', novoDesligamento, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
      });
      if (response.status === 201) {
        const newDesligamento = response.data;
        setDesligamentos([...desligamentos, newDesligamento]);
        setNovoDesligamento({ nome: '', cpfCnpj: '' });
      } else {
        console.error('Erro ao cadastrar desligamento');
      }
    } catch (error) {
      console.error('Erro ao cadastrar desligamento:', error);
    }
  };

  const Delete = async (cpfCnpj) => {
    try {
      const response = await axios.delete(`http://localhost:5000/desligamento/${cpfCnpj}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.status === 200) {
        setDesligamentos(desligamentos.filter(desligamento => desligamento.cpfCnpj !== cpfCnpj));
      } else {
        console.error('Erro ao desligar funcionário', response.data);
      }
    } catch (error) {
      console.error('Erro ao desligar funcionário', error);
    }
  };

  const columns = [
    { id: 'cpfCnpj', label: 'CPF/CNPJ', minWidth: isMobile ? '100%' : 10 },
    { id: 'nome', label: 'Nome', minWidth: isMobile ? '100%' : 10 },
    { id: 'email', label: 'Email', minWidth: isMobile ? '100%' : 10 },
    { id: 'telefone', label: 'Telefone', minWidth: isMobile ? '100%' : 10 },
    { id: 'delete', label: 'Desligar', minWidth: isMobile ? '100%' : 10 },
  ];

  const rows = desligamentos.map(desligamento => ({
    ...desligamento,
    delete: <Tooltip title="Excluir"><IconButton sx={{ color: 'error.main' }} size="large" onClick={() => Delete(desligamento.cpfCnpj)}>
      <Icon path={mdiDeleteForeverOutline}  size={1} />
      </IconButton></Tooltip>
  }));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(event.target.value);
    setPage(0);
  }

  const theme = createTheme({
    palette: {
      green: {
        main: '#427c44a6',
      },
      other: {
        main: '#427c44',
      },
    },
  });

  return (
    <Box component="form" sx={{
      mimWidth: 'sm',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 3,
    }}>
      <ThemeProvider theme={theme}>
        <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap"
          direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: '100%' }}>
          <TextField
            color='green'
            focused
            id='outlined-basic'
            size="small"
            sx={{ minWidth: isMobile ? '100%' : '10%' }}
            label="Nome"
            name='nome'
            value={novoDesligamento.nome}
            onChange={handleInputChange}
          />
          <TextField
            color='green'
            focused
            id='outlined-basic'
            size="small"
            sx={{ minWidth: isMobile ? '100%' : '10%' }}
            label="CPF/CNPJ"
            name='cpfCnpj'
            value={novoDesligamento.cpfCnpj}
            onChange={handleInputChange}
          />
        </Stack>
        <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap" direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
          <Button variant="contained" color="other" sx={{ minWidth: isMobile ? '100%' : '20%' }} onClick={submitDesligamento}>Filtrar</Button>
        </Stack>
      </ThemeProvider>
      <Grid container spacing={{ xs: 2 }}>
        <Grid item xs={12}>
          {isMobile ? (
            desligamentos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((desligamento) => (
              <Box key={desligamento.cpfCnpj} sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2, boxShadow: 1, width: "100%" }}>
                {columns.map((column) => (
                  <Box key={column.id} sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>{column.label}:</Typography>
                    <Typography variant="body2">
                      {column.id === "delete" ? (
                        <Tooltip title="Excluir">
                          <IconButton sx={{ color: 'error.main' }}>
                            <Icon path={mdiDelete} size={1} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        desligamento[column.id]
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
    </Box>
  );
}

export default TableDesligamento;