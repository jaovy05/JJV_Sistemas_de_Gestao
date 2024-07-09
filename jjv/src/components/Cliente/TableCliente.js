import React from "react";
import axios from "axios";
import Icon from "@mdi/react";
import { Box, Button, createTheme,Grid, IconButton,Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, ThemeProvider, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { mdiSquareEditOutline } from '@mdi/js';
import { Sheet } from "@mui/joy";
import ModalClose from '@mui/joy/ModalClose';
import Modal from '@mui/joy/Modal';



function TableCliente() {
  const [clientes, setClientes] = React.useState([]);
  const [clienteSelecionado, setClienteSelecionado] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);


  React.useEffect(() => {
    async function fetchClientes() {
      try {
        const response = await axios.get("http://localhost:5000/cliente");
        setClientes(response.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchClientes();
  }, []);


  const isMobile = useMediaQuery('(max-width:600px)');

  const OpenModal = (cliente) => {
    setClienteSelecionado(cliente);
    setOpen(true);
  };

  const alterarTerceirizado = (e) => {
    const { name, value } = e.target;
    setClienteSelecionado({ ...clienteSelecionado, [name]: value });
  };

  const editFuncionario = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/cliente/${clienteSelecionado.codp}`,
        clienteSelecionado,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

      if (response.status === 201) {
        setClientes(clientes.map(cliente => cliente.codp === clienteSelecionado.codp ? clienteSelecionado : cliente));
        window.location.reload();
        setOpen(false);
      } else {
        console.error('Erro ao editar cliente:');
      }
    } catch (error) {
      console.error('Erro ao editar cliente:', error);
    }
  };

  const AdicionarCliente = () => {
    const [novoCliente, setNovoCliente] = React.useState({ nome: '', email: '', data: '', endn: '', end_logra: '', telefone1: '', telefone2: '', cnpj: '' });

    const newCliente = (e) => {
      const { name, value } = e.target;
      setNovoCliente({ ...novoCliente, [name]: value });
    };

    const submitCliente = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('http://localhost:5000/cliente', novoCliente, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
        });
        if (response.status === 201) {
          const newCliente = response.data;
          setClientes([...clientes, newCliente]);
          setNovoCliente({ nome: '', email: '', data: '', endn: '', end_logra: '', telefone1: '', telefone2: '', cnpj: '' });
          window.location.reload();
        } else {
          console.error('Erro ao cadastrar cliente:');
        }
      } catch (error) {
        console.error('Erro ao cadastrar cliente:', error);
      }
    };


    const columns = [
      { id: 'cod', label: 'Código', minWidth: isMobile ? '100%' : 10 },
      { id: 'nome', label: 'Nome', minWidth: isMobile ? '100%' : 120 },
      { id: 'email', label: 'Email', minWidth: isMobile ? '100%' : 120 },
      { id: 'data', label: 'Data', minWidth: isMobile ? '100%' : 120 },
      { id: 'end_logra', label: 'Endereço', minWidth: isMobile ? '100%' : 120 },
      { id: 'endn', label: 'Número', minWidth: isMobile ? '100%' : 20 },
      { id: 'telefone1', label: 'Telefone1', minWidth: isMobile ? '100%' : 120 },
      { id: 'telefone2', label: 'Telefone2', minWidth: isMobile ? '100%' : 120 },
      { id: 'cnpj', label: 'CNPJ', minWidth: isMobile ? '100%' : 120 },
      { id: 'edit', label: 'Editar', minWidth: isMobile ? '100%' : 20 }
    ];

    function formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${day}-${month}-${year}`;
    }

    const rows = clientes.map(cliente => ({
      ...cliente,
      data: formatDate(cliente.data),
      edit: <Tooltip title="Editar"><IconButton sx={{ color: 'warning.main' }} size="large" onClick={() => OpenModal(cliente)}>
        <Icon path={mdiSquareEditOutline} size={1} />
      </IconButton></Tooltip>,
    }));


    //manipulação de paginação
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
              sx={{ minWidth: isMobile ? '100%' : '49%' }}
              label="Nome"
              name='nome'
              value={novoCliente.nome}
              onChange={newCliente}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '49%' }}
              label="Email"
              name='email'
              value={novoCliente.email}
              onChange={newCliente}
            />
          </Stack>
          <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap"
            direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '64%' }}
              label="Endereço"
              name='end_logra'
              value={novoCliente.end_logra}
              onChange={newCliente}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '34%' }}
              label="Número"
              name='endn'
              value={novoCliente.endn}
              onChange={newCliente}
            />
          </Stack>
          <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap"
            direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '33%' }}
              type='date'
              label="Data"
              name='data'
              value={novoCliente.data}
              onChange={(e) => setNovoCliente((prevCliente) => ({ ...prevCliente, data: e.target.value }))}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '32%' }}
              label="Telefone1"
              name='telefone1'
              value={novoCliente.telefone1}
              onChange={newCliente}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '32%' }}
              label="Telefone2"
              name='telefone2'
              value={novoCliente.telefone2}
              onChange={newCliente}
            />
          </Stack>
          <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap" direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '33%' }}
              label="CNPJ"
              name='cnpj'
              value={novoCliente.cnpj}
              onChange={newCliente}
            />
          <Button variant="contained" color="other" sx={{ minWidth: isMobile ? '100%' : '20%' }} onClick={submitCliente}>Adicionar Cliente</Button>
          </Stack> 
        </ThemeProvider>
        <Grid container spacing={{ xs: 2 }}>
          <Grid item xs={12}>
            {isMobile ? (
              clientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((cliente) => (
                <Box key={cliente.codp} sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2, boxShadow: 1, width: "100%" }}>
                  {columns.map((column) => (
                    <Box key={column.id} sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>{column.label}:</Typography>
                      <Typography variant="body2">
                        {column.id === "edit" ? (
                          <Tooltip title="Editar">
                            <IconButton sx={{ color: 'warning.main' }} onClick={() => OpenModal(cliente)}>
                              <Icon path={mdiSquareEditOutline} size={1} />
                            </IconButton>
                          </Tooltip>
                        ) : column.id === "data" ? (formatDate(cliente.data)) : (
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
      </Box>
    );
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

  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  return (
    <div>
      <AdicionarCliente addNewTerc={(novoCliente) => setClientes([...clientes, novoCliente])} />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{ width: isMobile ? '100%' : '45%', maxHeight: '90%', margin: 'auto',maxWidth: '90%', overflowY: 'auto'}}
      >
        <Sheet
          variant="outlined"
          sx={{
            borderRadius: 'md',
            boxShadow: 'lg',
            p: 3,
          }}
        >
          <ModalClose variant="plain" sx={{ m: 1 }} />
          <Typography
            component="h2"
            id="modal-title"
            level="h4"
            fontWeight="lg"
            mb={1}
          >
            Editar Funcionário
          </Typography>
          {clienteSelecionado ? (
            <Box sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 3,
            }} >
              <ThemeProvider theme={theme}>
                <TextField
                  color='green'
                  focused
                  id='outlined-basic'
                  size="small"
                  sx={{ width: isMobile ? '100%' : '45%' }}
                  label="Nome"
                  name='nome'
                  value={clienteSelecionado.nome}
                  onChange={alterarTerceirizado}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: isMobile ? '100%' : '45%' }}
                  label="Email"
                  name='email'
                  value={clienteSelecionado.email}
                  onChange={alterarTerceirizado}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: isMobile ? '100%' : '65%' }}
                  label="Endereço"
                  name='end_logra'
                  value={clienteSelecionado.end_logra}
                  onChange={alterarTerceirizado}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: isMobile ? '100%' : '30%' }}
                  label="Número"
                  name='endn'
                  value={clienteSelecionado.endn}
                  onChange={alterarTerceirizado}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: isMobile ? '100%' : '45%' }}
                  type='data'
                  label="Data"
                  name='data'
                  value={formatDate(clienteSelecionado.data)}
                  onChange={alterarTerceirizado}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: isMobile ? '100%' : '45%' }}
                  label="Telefone1"
                  name='telefone1'
                  value={clienteSelecionado.telefone1}
                  onChange={alterarTerceirizado}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: isMobile ? '100%' : '45%' }}
                  label="Telefone2"
                  name="telefone2"
                  value={clienteSelecionado.telefone2}
                  onChange={alterarTerceirizado}
                />
                <TextField
                  color='green'
                  focused
                   size="small"
                  sx={{ width: isMobile ? '100%' : '45%' }}
                  label="CNPJ"
                  name="cnpj"
                  value={clienteSelecionado.cnpj}
                  onChange={alterarTerceirizado}
                />
                <Button variant="outlined" color='warning' sx={{ color: 'warning.main',width: isMobile ? '100%' : '35%'  }} onClick={editFuncionario}>Editar Cliente</Button>
              </ThemeProvider>
            </Box>
          ) : (
            <Typography variant="body1">Nenhum Cliente selecionado</Typography>
          )}
        </Sheet>
      </Modal>
    </div>
  );

}

export default TableCliente;