import React from "react";
import axios from "axios";
import Icon from "@mdi/react";
import { Box, Button, createTheme, Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, ThemeProvider, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { mdiSquareEditOutline, mdiDeleteForeverOutline } from '@mdi/js';
import { Sheet } from "@mui/joy";
import ModalClose from '@mui/joy/ModalClose';
import Modal from '@mui/joy/Modal';


function TableOperacao() {
  const [operacoes, setOperacoes] = React.useState([]);
  const [operacaoSelecionada, setOperacaoSelecionada] = React.useState();
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    async function fetchOperacoes() {
      try {
        const response = await axios.get("http://localhost:5000/operacao");
        setOperacoes(response.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchOperacoes();
  }, []);

  const isMobile = useMediaQuery('(max-width:600px)');

  const OpenModal = (operacao) => {
    setOperacaoSelecionada(operacao);
    setOpen(true);
  };

  const alterarOperacao = (e) => {
    const { name, value } = e.target;
    setOperacaoSelecionada({ ...operacaoSelecionada, [name]: value });
  };


  const editOperacao = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/operacao/${operacaoSelecionada.cod}`,
        operacaoSelecionada,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

      if (response.status === 201) {
        setOperacoes(operacoes.map(operacao => operacao.cod === operacaoSelecionada.cod ? operacaoSelecionada : operacao));
        window.location.reload();
        setOpen(false);
      } else {
        console.error('Erro ao editar operacão');
      }
    } catch (error) {
      console.error('Erro ao editar operação:', error);
    }
  };

  const AdicionarOperacao = () => {
    const [novaOperacao, setNovaOperacao] = React.useState({ dsc: '',  valor: '' });

    const newOperacao = (e) => {
      const { name, value } = e.target;
      setNovaOperacao({ ...novaOperacao, [name]: value });
    };

    const submitOperacao = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('http://localhost:5000/operacao', novaOperacao, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
        });
        if (response.status === 201) {
          const newOperacao = response.data;
          setOperacoes([...operacoes, newOperacao]);
          setNovaOperacao({ dsc: '',  valor: '' });
          window.location.reload();
        } else {
          console.error('Erro ao cadastrar operação');
        }
      } catch (error) {
        console.error('Erro ao cadastrar operação:', error);
      }
    };

    const DeleteOperacao = async (cod) => {
      try {
        const response = await axios.delete(`http://localhost:5000/operacao/${cod}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.status === 200) {
          setOperacoes(operacoes.filter(operacao => operacao.cod !== cod));
        } else {
          console.error('Erro ao deletar operação', response.data);
        }
      } catch (error) {
        console.error('Erro ao deletar operação', error);
      }
    };

    const columns = [
      { id: 'cod', label: 'Código', minWidth: isMobile ? '100%' : 5 },
      { id: 'dsc', label: 'Nome', minWidth: isMobile ? '100%' : 40 },
      { id: 'valor', label: 'Valor', minWidth: isMobile ? '100%' : 120 },
      { id: 'edit', label: 'Editar', minWidth: isMobile ? '100%' : 20 },
      { id: 'delete', label: 'Deletar', minWidth: isMobile ? '100%' : 20 },
    ];

    const rows = operacoes.map(operacao => ({
      ...operacao,
      edit: <Tooltip title="Editar"><IconButton sx={{ color: 'warning.main' }} size="large" onClick={() => OpenModal(operacao)}>
        <Icon path={mdiSquareEditOutline} size={1} />
      </IconButton></Tooltip>,
      delete: <Tooltip title="Excluir"><IconButton sx={{ color: 'error.main' }} size="large" onClick={() => DeleteOperacao(operacao.cod)}>
      <Icon path={mdiDeleteForeverOutline}  size={1} />
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
              name='dsc'
              value={novaOperacao.dsc}
              onChange={newOperacao}
            />
          </Stack>     
          <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap" direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
          <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '10%' }}
              label="valor"
              name='valor'
              value={novaOperacao.valor}
              onChange={newOperacao}
            />
            
            <Button variant="contained" color="other" sx={{ minWidth: isMobile ? '100%' : '20%' }} onClick={submitOperacao}>Adicionar Operação</Button>
          </Stack>
        </ThemeProvider>
        <Grid container spacing={{ xs: 2 }}>
          <Grid item xs={12}>
            {isMobile ? (
              operacoes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((operacao) => (
                <Box key={operacao.cod} sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2, boxShadow: 1, width: "100%" }}>
                  {columns.map((column) => (
                    <Box key={column.id} sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>{column.label}:</Typography>
                      <Typography variant="body2">
                        {column.id === "edit" ? (
                          <Tooltip title="Editar">
                            <IconButton sx={{ color: 'warning.main' }} onClick={() => OpenModal(operacao)}>
                              <Icon path={mdiSquareEditOutline} size={1} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          operacao[column.id]
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

  return (
    <div>
      <AdicionarOperacao addNewFunc={(novaOperacao) => setOperacoes([...operacoes, novaOperacao])} />
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
            Editar Operação
          </Typography>
          {operacaoSelecionada ? (
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
                  name='dsc'
                  value={operacaoSelecionada.dsc}
                  onChange={alterarOperacao}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: isMobile ? '100%' : '45%' }}
                  label="Valor"
                  name='valor'
                  value={operacaoSelecionada.valor}
                  onChange={alterarOperacao}
                />
              
                <Button variant="outlined" color='warning' sx={{ color: 'warning.main',width: isMobile ? '100%' : '35%'  }} onClick={editOperacao}>Editar Operação</Button>
              </ThemeProvider>
            </Box>
          ) : (
            <Typography variant="body1">Nenhuma Operação selecionada</Typography>
          )}
        </Sheet>
      </Modal>
    </div>
  );
}

export default TableOperacao;