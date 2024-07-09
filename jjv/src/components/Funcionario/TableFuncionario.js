import React from "react";
import axios from "axios";
import Icon from "@mdi/react";
import { Box, Button, createTheme, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, ThemeProvider, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { mdiSquareEditOutline } from '@mdi/js';
import { Sheet } from "@mui/joy";
import ModalClose from '@mui/joy/ModalClose';
import Modal from '@mui/joy/Modal';


function TableFuncionario() {
  const [funcionarios, setFuncionarios] = React.useState([]);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = React.useState();
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    async function fetchFuncionarios() {
      try {
        const response = await axios.get("http://localhost:5000/funcionario");
        setFuncionarios(response.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchFuncionarios();
  }, []);

  const isMobile = useMediaQuery('(max-width:600px)');

  const OpenModal = (funcionario) => {
    setFuncionarioSelecionado(funcionario);
    setOpen(true);
  };

  const alterarFuncionario = (e) => {
    const { name, value } = e.target;
    setFuncionarioSelecionado({ ...funcionarioSelecionado, [name]: value });
  };


  const editFuncionario = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/funcionario/${funcionarioSelecionado.codp}`,
        funcionarioSelecionado,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

      if (response.status === 201) {
        setFuncionarios(funcionarios.map(funcionario => funcionario.codp === funcionarioSelecionado.codp ? funcionarioSelecionado : funcionario));
        setOpen(false);
      } else {
        console.error('Erro ao editar ionário');
      }
    } catch (error) {
      console.error('Erro ao editar funcionário:', error);
    }
  };

  const AdicionarFuncionario = () => {
    const [novoFuncionario, setNovoFuncionario] = React.useState({ nome: '', email: '', data: '', endn: '', end_logra: '', telefone1: '', telefone2: '', cpf: '', senha: '', pis: '', adm: 0 });

    const newFuncionario = (e) => {
      const { name, value } = e.target;
      setNovoFuncionario({ ...novoFuncionario, [name]: value });
    };

    const submitFuncionario = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('http://localhost:5000/funcionario', novoFuncionario, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
        });
        if (response.status === 201) {
          const newFuncionario = response.data;
          setFuncionarios([...funcionarios, newFuncionario]);
          setNovoFuncionario({ nome: '', email: '', data: '', endn: '', end_logra: '', telefone1: '', telefone2: '', cpf: '', senha: '', pis: '', adm: 0 });
          window.location.reload();
        } else {
          console.error('Erro ao cadastrar funcionário');
        }
      } catch (error) {
        console.error('Erro ao cadastrar funcionário:', error);
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
      { id: 'cpf', label: 'CPF', minWidth: isMobile ? '100%' : 120 },
      // { id: 'senha', label: 'Senha', width: 10 },
      { id: 'pis', label: 'Pis', minWidth: isMobile ? '100%' : 120 },
      { id: 'adm', label: 'ADM', minWidth: isMobile ? '100%' : 80 },
      { id: 'edit', label: 'Editar', minWidth: isMobile ? '100%' : 20 }
    ];

    function formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${day}-${month}-${year}`;
    }

    function formatAdm(adm) {
      if (adm === 1) {
        return 'Administrador';
      } else {
        return 'Normal';
      }
    }

    const rows = funcionarios.map(funcionario => ({
      ...funcionario,
      data: formatDate(funcionario.data),
      adm: formatAdm(funcionario.adm),
      edit: <Tooltip title="Editar"><IconButton sx={{ color: 'warning.main' }} size="large" onClick={() => OpenModal(funcionario)}>
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
    //

    //criar as cores estilizadas
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
              value={novoFuncionario.nome}
              onChange={newFuncionario}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '49%' }}
              label="Email"
              name='email'
              value={novoFuncionario.email}
              onChange={newFuncionario}
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
              value={novoFuncionario.end_logra}
              onChange={newFuncionario}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '34%' }}
              label="Número"
              name='endn'
              value={novoFuncionario.endn}
              onChange={newFuncionario}
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
              value={novoFuncionario.data}
              onChange={(e) => setNovoFuncionario((prevPessoa) => ({ ...prevPessoa, data: e.target.value }))}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '32%' }}
              label="Telefone1"
              name='telefone1'
              value={novoFuncionario.telefone1}
              onChange={newFuncionario}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '32%' }}
              label="Telefone2"
              name='telefone2'
              value={novoFuncionario.telefone2}
              onChange={newFuncionario}
            />
          </Stack>
          <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap" direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '33%' }}
              label="CPF"
              name='cpf'
              value={novoFuncionario.cpf}
              onChange={newFuncionario}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '32%' }}
              label="Senha"
              name='senha'
              value={novoFuncionario.senha}
              onChange={newFuncionario}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '32%' }}
              label="Pis"
              name='pis'
              value={novoFuncionario.pis}
              onChange={newFuncionario}
            />
          </Stack>
          <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap" direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>

            <FormControl sx={{ minWidth: isMobile ? '100%' : '32%' }} color="green" focused size="small">
              <InputLabel>Acesso</InputLabel>
              <Select
                label="Acesso"
                name="adm"
                value={novoFuncionario.adm}
                onChange={newFuncionario}
              >
                <MenuItem value={1}>Administrador</MenuItem>
                <MenuItem value={0}>Normal</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" color="other" sx={{ minWidth: isMobile ? '100%' : '20%' }} onClick={submitFuncionario}>Adicionar Funcionário</Button>
          </Stack>
        </ThemeProvider>
        <Grid container spacing={{ xs: 2 }}>
          <Grid item xs={12}>
            {isMobile ? (
              funcionarios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((funcionario) => (
                <Box key={funcionario.codp} sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2, boxShadow: 1, width: "100%" }}>
                  {columns.map((column) => (
                    <Box key={column.id} sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>{column.label}:</Typography>
                      <Typography variant="body2">
                        {column.id === "edit" ? (
                          <Tooltip title="Editar">
                            <IconButton sx={{ color: 'warning.main' }} onClick={() => OpenModal(funcionario)}>
                              <Icon path={mdiSquareEditOutline} size={1} />
                            </IconButton>
                          </Tooltip>
                        ) : column.id === "data" ? (formatDate(funcionario.data)) : (
                          funcionario[column.id]
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
      <AdicionarFuncionario addNewFunc={(novoFuncionario) => setFuncionarios([...funcionarios, novoFuncionario])} />
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
          {funcionarioSelecionado ? (
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
                  value={funcionarioSelecionado.nome}
                  onChange={alterarFuncionario}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: isMobile ? '100%' : '45%' }}
                  label="Email"
                  name='email'
                  value={funcionarioSelecionado.email}
                  onChange={alterarFuncionario}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: isMobile ? '100%' : '65%' }}
                  label="Endereço"
                  name='end_logra'
                  value={funcionarioSelecionado.end_logra}
                  onChange={alterarFuncionario}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: isMobile ? '100%' : '30%' }}
                  label="Número"
                  name='endn'
                  value={funcionarioSelecionado.endn}
                  onChange={alterarFuncionario}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: isMobile ? '100%' : '45%' }}
                  type='data'
                  label="Data"
                  name='data'
                  value={formatDate(funcionarioSelecionado.data)}
                  onChange={alterarFuncionario}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: isMobile ? '100%' : '45%' }}
                  label="Telefone1"
                  name='telefone1'
                  value={funcionarioSelecionado.telefone1}
                  onChange={alterarFuncionario}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: isMobile ? '100%' : '45%' }}
                  label="Telefone2"
                  name="telefone2"
                  value={funcionarioSelecionado?.telefone2 || ""}
                  onChange={alterarFuncionario}
                />
                <TextField
                  color='green'
                  focused
                  sx={{ width: isMobile ? '100%' : '45%' }}
                  label="CPF"
                  name="cpf"
                  value={funcionarioSelecionado?.cpf || ""}
                  onChange={alterarFuncionario}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: isMobile ? '100%' : '45%' }}
                  label="Senha"
                  name="senha"
                  value={funcionarioSelecionado.senha}
                  onChange={alterarFuncionario}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: isMobile ? '100%' : '45%' }}
                  label="Pis"
                  name="pis"
                  value={funcionarioSelecionado?.pis || ""}
                  onChange={alterarFuncionario}
                />
                <FormControl color='green'
                  focused
                  size="small"
                  sx={{ width: isMobile ? '100%' : '45%' }}>
                  <InputLabel>Acesso</InputLabel>
                  <Select
                    name="adm"
                    label="Acesso"
                    value={funcionarioSelecionado?.adm || 0}
                    onChange={alterarFuncionario}
                  >
                    <MenuItem value={1}>Administrador</MenuItem>
                    <MenuItem value={0}>Normal</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="outlined" color='warning' sx={{ color: 'warning.main',width: isMobile ? '100%' : '35%'  }} onClick={editFuncionario}>Editar Funcionário</Button>
              </ThemeProvider>
            </Box>
          ) : (
            <Typography variant="body1">Nenhum Funcionário selecionado</Typography>
          )}
        </Sheet>
      </Modal>
    </div>
  );
}

export default TableFuncionario;