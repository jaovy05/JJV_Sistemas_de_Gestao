import React from "react";
import axios from "axios";
import Icon from "@mdi/react";
import { Box, Button, createTheme, Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, ThemeProvider, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { mdiSquareEditOutline } from '@mdi/js';
import { Sheet } from "@mui/joy";
import ModalClose from '@mui/joy/ModalClose';
import Modal from '@mui/joy/Modal';
import SimpleAlert from '../Alerts/SuccessAlert';

function TableModelo() {
  const [modelos, setModelo] = React.useState([]);
  const [modeloSelecionado, setModeloSelecionado] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  React.useEffect(() => {
    async function fetchModelos() {
      try {
        const response = await axios.get("http://localhost:5000/modelo");
        setModelo(response.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchModelos();
  }, []);


  const isMobile = useMediaQuery('(max-width:600px)');

  const OpenModal = (modelo) => {
    setModeloSelecionado(modelo);
    setOpen(true);
  };

  const alterarModelo = (e) => {
    const { name, value } = e.target;
    setModeloSelecionado({ ...modeloSelecionado, [name]: value });
  };

  const editModelo = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/modelo/${modeloSelecionado.cod}`,
        modeloSelecionado,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

      if (response.status === 201) {
        setModelo(modelos.map(modelo => modelo.cod === modeloSelecionado.cod ? modeloSelecionado : modelo));
        setOpen(false);
      } else {
        console.error('Erro ao editar modelo:');
      }
    } catch (error) {
      console.error('Erro ao editar modelo:', error);
    }
  };


  const Adicionarmodelo = () => {
    const [novoModelo, setNovoModelo] = React.useState({cod: '', dsc: '', cnpjc: ''});

    const newModelo = (e) => {
      const { name, value } = e.target;
      setNovoModelo({ ...novoModelo, [name]: value });
    };

    const submitModelo = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('http://localhost:5000/modelo', novoModelo, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
        });
        if (response.status === 201) {
          const newModelo = response.data;
          setModelo([...modelos, newModelo]);
          setNovoModelo({cod: '', dsc: '', cnpjc: ''});
          <SimpleAlert />
        } else {
          console.error('Erro ao cadastrar modelo');
        }
      } catch (error) {
        console.error('Erro ao cadastrar modelo:', error);
      }
    };


    const columns = [
      { id: 'cod', label: 'Código do Modelo', minWidth: isMobile ? '100%' : 10 },
      { id: 'dsc', label: 'Descrição', minWidth: isMobile ? '100%' : 10 },
      { id: 'cnpjc', label: 'CNPJ do Cliente', minWidth: isMobile ? '100%' : 10 },
    ];

    const rows = modelos.map(modelo => ({
      ...modelo,
      edit: <Tooltip title="Editar"><IconButton sx={{ color: 'warning.main' }} size="large" onClick={() => OpenModal(modelo)}>
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
              label="Código Modelo"
              name='cod'
              value={novoModelo.cod}
              onChange={newModelo}
            />
            <TextField
              color='green'
              focused
              id='outlined-basic'
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '10%' }}
              label="Descrição"
              name='dsc'
              value={novoModelo.modelo}
              onChange={newModelo}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '10%' }}
              label="CNPJ do Cliente"
              name='cnpjc'
              value={novoModelo.op}
              onChange={newModelo}
            />
          </Stack>
          <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap" direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
            <Button variant="contained" color="other" sx={{ minWidth: isMobile ? '100%' : '20%' }} onClick={submitModelo}>Adicionar modelo</Button>
          </Stack>
        </ThemeProvider>
        <Grid container spacing={{ xs: 2 }}>
          <Grid item xs={12}>
            {isMobile ? (
              modelos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((modelo) => (
                <Box key={modelo.cod} sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2, boxShadow: 1, width: "100%" }}>
                  {columns.map((column) => (
                    <Box key={column.id} sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>{column.label}:</Typography>
                      <Typography variant="body2">
                        {column.id === "edit" ? (
                          <Tooltip title="Editar">
                            <IconButton sx={{ color: 'warning.main' }} onClick={() => OpenModal(modelo)}>
                              <Icon path={mdiSquareEditOutline} size={1} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          modelo[column.id]
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
      <Adicionarmodelo addNewPed={(novoModelo) => setModelo([...modelos, novoModelo])} />
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
            Editar modelo
          </Typography>
          {modeloSelecionado ? (
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
                  label="Código do Modelo"
                  name='cod'
                  value={modeloSelecionado.cod}
                  onChange={alterarModelo}
                />
                <TextField
                  color='green'
                  focused
                  id='outlined-basic'
                  size="small"
                  sx={{ minWidth: isMobile ? '100%' : '10%' }}
                  label="Descrição"
                  name='dsc'
                  value={modeloSelecionado.pedido}
                  onChange={alterarModelo}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ minWidth: isMobile ? '100%' : '10%' }}
                  label="CNPJ do Cliente"
                  name='cnpjc'
                  value={modeloSelecionado.op}
                  onChange={alterarModelo}
                />
                </Stack>
                <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap" direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
                  <Button variant="outlined" color='warning' sx={{ color: 'warning.main', width: isMobile ? '100%' : '35%' }} onClick={editModelo}>Editar modelo</Button>
                </Stack>
              </ThemeProvider>
            </Box>
          ) : (
            <Typography variant="body1">Nenhum modelo selecionado</Typography>
          )}
        </Sheet>
      </Modal>
    </div>
  );

}

export default TableModelo;