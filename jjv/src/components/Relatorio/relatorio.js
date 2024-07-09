import React from "react";
import axios from "axios";
import Icon from "@mdi/react";
import {
  Box, Button, createTheme, Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField, ThemeProvider, Tooltip, Typography, useMediaQuery
} from '@mui/material';
import { mdiSquareEditOutline } from '@mdi/js';
import ModalClose from '@mui/joy/ModalClose';
import Modal from '@mui/joy/Modal';

function TableRelatorio() {
  const [relatorio, setRelatorios] = React.useState([]);
  const [relatorioSelecionado, setRelatorioSelecionado] = React.useState();
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [novoRelatorio, setNovoRelatorio] = React.useState({
    terceirizado: '',
    cliente: '',
    dataInicio: '',
    dataFim: ''
  });

  const fetchRelatorio = async (filters) => {
    try {
      const response = await axios.post("http://localhost:5000/relatorio", filters, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRelatorios(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    fetchRelatorio({});
  }, []);

  const isMobile = useMediaQuery('(max-width:600px)');

  const OpenModal = (relatorio) => {
    setRelatorioSelecionado(relatorio);
    setOpen(true);
  };

  const alterarRelatorio = (e) => {
    const { name, value } = e.target;
    setRelatorioSelecionado({ ...relatorioSelecionado, [name]: value });
  };

  const columns = [
    { id: 'terceirizado', label: 'Terceirizado', minWidth: isMobile ? '100%' : 120 },
    { id: 'cliente', label: 'Cliente', minWidth: isMobile ? '100%' : 120 },
    { id: 'dataInicio', label: 'Data de Retirada', minWidth: isMobile ? '100%' : 120 },
    { id: 'dataFim', label: 'Data de Entrega', minWidth: isMobile ? '100%' : 120 },
  ];

  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  const rows = relatorio.map(relatorio => ({
    ...relatorio,
    data: formatDate(relatorio.data),
    edit: <Tooltip title="Editar"><IconButton sx={{ color: 'warning.main' }} size="large" onClick={() => OpenModal(relatorio)}>
      <Icon path={mdiSquareEditOutline} size={1} />
    </IconButton></Tooltip>,
  }));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(event.target.value);
    setPage(0);
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoRelatorio({ ...novoRelatorio, [name]: value });
  };

  const submitRelatorio = async (e) => {
    e.preventDefault();
    fetchRelatorio(novoRelatorio);
  };

  return (
    <Box component="form" sx={{ minWidth: 'sm', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" component="h1">Relatorio</Typography>
      <ThemeProvider theme={theme}>
        <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap" direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: '100%' }}>
          <TextField
            color='green'
            focused
            size="small"
            sx={{ minWidth: isMobile ? '100%' : '49%' }}
            label="Terceirizado"
            name='terceirizado'
            value={novoRelatorio.terceirizado}
            onChange={handleInputChange}
          />
          <TextField
            color='green'
            focused
            size="small"
            sx={{ minWidth: isMobile ? '100%' : '49%' }}
            label="Cliente"
            name='cliente'
            value={novoRelatorio.cliente}
            onChange={handleInputChange}
          />
        </Stack>
        <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap" direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
          <TextField
            color='green'
            focused
            size="small"
            sx={{ minWidth: isMobile ? '100%' : '49%' }}
            type='date'
            label="Data de Retirada"
            name='dataInicio'
            InputLabelProps={{ shrink: true }}
            value={novoRelatorio.dataInicio}
            onChange={handleInputChange}
          />
          <TextField
            color='green'
            focused
            size="small"
            sx={{ minWidth: isMobile ? '100%' : '49%' }}
            type='date'
            label="Data de Entrega"
            name='dataFim'
            InputLabelProps={{ shrink: true }}
            value={novoRelatorio.dataFim}
            onChange={handleInputChange}
          />
        </Stack>
        <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap" direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
          <Button variant="contained" color="other" sx={{ minWidth: isMobile ? '100%' : '20%' }} onClick={submitRelatorio}>Filtrar</Button>
          <Button variant="contained" color="other" sx={{ minWidth: isMobile ? '100%' : '20%' }} onClick={submitRelatorio}>Baixar pdf</Button>
        </Stack>
      </ThemeProvider>
      <Box>
        <Grid container>
          <Grid item xs={12}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth }}>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === 'number' ? column.format(value) : value}
                          </TableCell>
                        );
                      })}
                      <TableCell align="center">{row.edit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Grid>
        </Grid>
        {relatorioSelecionado && (
          <Modal open={open} onClose={() => setOpen(false)}>
            <Box sx={{ maxWidth: 400, borderRadius: 5, boxShadow: 24, p: 4, backgroundColor: 'background.paper' }}>
              <ModalClose />
              <TextField label="Terceirizado" fullWidth value={relatorioSelecionado.terceirizado} onChange={alterarRelatorio} />
              <TextField label="Cliente" fullWidth value={relatorioSelecionado.cliente} onChange={alterarRelatorio} />
              <TextField label="Data de Retirada" fullWidth value={relatorioSelecionado.dataInicio} onChange={alterarRelatorio} />
              <TextField label="Data de Entrega" fullWidth value={relatorioSelecionado.dataFim} onChange={alterarRelatorio} />
            </Box>
          </Modal>
        )}
      </Box>
    </Box>
  );
}

export default TableRelatorio;
