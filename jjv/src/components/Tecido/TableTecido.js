import React from "react";
import axios from "axios";
import Icon from "@mdi/react";
import { Box, Button, createTheme, Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, ThemeProvider, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { mdiSquareEditOutline } from '@mdi/js';
import { Sheet } from "@mui/joy";
import ModalClose from '@mui/joy/ModalClose';
import Modal from '@mui/joy/Modal';
import SimpleAlert from '../Alerts/SuccessAlert';

function TableTecido() {
  const [tecidos, setTecido] = React.useState([]);
  const [tecidoSelecionado, setTecidoSelecionado] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    async function fetchTecidos() {
      try {
        const response = await axios.get("http://localhost:5000/tecido");
        setTecido(response.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchTecidos();
  }, []);


  const isMobile = useMediaQuery('(max-width:600px)');

  const OpenModal = (tecido) => {
    setTecidoSelecionado(tecido);
    setOpen(true);
  };

  const alterarTecido = (e) => {
    const { name, value } = e.target;
    setTecidoSelecionado({ ...tecidoSelecionado, [name]: value });
  };

  const editTecido = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/tecido/${tecidoSelecionado.cod}`,
        tecidoSelecionado,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

      if (response.status === 201) {
        setTecido(tecidos.map(tecido => tecido.cod === tecidoSelecionado.cod ? tecidoSelecionado : tecido));
        window.location.reload();
        setOpen(false);
      } else {
        console.error('Erro ao editar tecido:');
      }
    } catch (error) {
      console.error('Erro ao editar tecido:', error);
    }
  };


  const AdicionarTecido = () => {
    const [novoTecido, setNovoTecido] = React.useState({cod: '', nome: '', dsc: ''});

    const newTecido = (e) => {
      const { name, value } = e.target;
      setNovoTecido({ ...novoTecido, [name]: value });
    };

    const submitTecido = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('http://localhost:5000/tecido', novoTecido, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
        });
        if (response.status === 201) {
          const newTecido = response.data;
          setTecido([...tecidos, newTecido]);
          setNovoTecido({cod: '', nome: '', dsc: ''});
          <SimpleAlert />
        } else {
          console.error('Erro ao cadastrar tecido');
        }
      } catch (error) {
        console.error('Erro ao cadastrar tecido:', error);
      }
    };


    const columns = [
      { id: 'cod', label: 'Código do Tecido', minWidth: isMobile ? '100%' : 10 },
      { id: 'nome', label: 'Nome', minWidth: isMobile ? '100%' : 10 },
      { id: 'dsc', label: 'Descrição', minWidth: isMobile ? '100%' : 10 },
    ];

    const rows = tecidos.map(tecido => ({
      ...tecido,
      edit: <Tooltip title="Editar"><IconButton sx={{ color: 'warning.main' }} size="large" onClick={() => OpenModal(tecido)}>
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
              sx={{ minWidth: isMobile ? '100%' : '10%' }}
              label="Código Tecido"
              name='cod'
              value={novoTecido.cod}
              onChange={newTecido}
            />
            <TextField
              color='green'
              focused
              id='outlined-basic'
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '10%' }}
              label="Nome"
              name='nome'
              value={novoTecido.tecido}
              onChange={newTecido}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '10%' }}
              label="Descrição"
              name='dsc'
              value={novoTecido.op}
              onChange={newTecido}
            />
          </Stack>
          <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap" direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
            <Button variant="contained" color="other" sx={{ minWidth: isMobile ? '100%' : '20%' }} onClick={submitTecido}>Adicionar tecido</Button>
          </Stack>
        </ThemeProvider>
        <Grid container spacing={{ xs: 2 }}>
          <Grid item xs={12}>
            {isMobile ? (
              tecidos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tecido) => (
                <Box key={tecido.cod} sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2, boxShadow: 1, width: "100%" }}>
                  {columns.map((column) => (
                    <Box key={column.id} sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>{column.label}:</Typography>
                      <Typography variant="body2">
                        {column.id === "edit" ? (
                          <Tooltip title="Editar">
                            <IconButton sx={{ color: 'warning.main' }} onClick={() => OpenModal(tecido)}>
                              <Icon path={mdiSquareEditOutline} size={1} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          tecido[column.id]
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
      <AdicionarTecido addNewPed={(novoTecido) => setTecido([...tecidos, novoTecido])} />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{ width: isMobile ? '100%' : '45%', maxHeight: '90%', margin: 'auto', maxWidth: '90%', overflowY: 'auto' }}
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
            Editar tecido
          </Typography>
          {tecidoSelecionado ? (
            <Box sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 3,
            }} >
              <ThemeProvider theme={theme}>
              <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap"
                  direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
                <TextField
                  color='green'
                  focused
                  id='outlined-basic'
                  size="small"
                  sx={{ minWidth: isMobile ? '100%' : '10%' }}
                  label="Código Tecido"
                  name='cod'
                  value={tecidoSelecionado.cod}
                  onChange={alterarTecido}
                />
                <TextField
                  color='green'
                  focused
                  id='outlined-basic'
                  size="small"
                  sx={{ minWidth: isMobile ? '100%' : '10%' }}
                  label="Nome"
                  name='nome'
                  value={tecidoSelecionado.pedido}
                  onChange={alterarTecido}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ minWidth: isMobile ? '100%' : '10%' }}
                  label="Descrição"
                  name='dsc'
                  value={tecidoSelecionado.op}
                  onChange={alterarTecido}
                />
                </Stack>
                <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap" direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
                  <Button variant="outlined" color='warning' sx={{ color: 'warning.main', width: isMobile ? '100%' : '35%' }} onClick={editTecido}>Editar tecido</Button>
                </Stack>
              </ThemeProvider>
            </Box>
          ) : (
            <Typography variant="body1">Nenhum tecido selecionado</Typography>
          )}
        </Sheet>
      </Modal>
    </div>
  );

}

export default TableTecido;