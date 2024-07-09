import React from "react";
import axios from "axios";
import Icon from "@mdi/react";
import { Box, Button, createTheme, Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, ThemeProvider, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { mdiSquareEditOutline } from '@mdi/js';
import { Sheet } from "@mui/joy";
import ModalClose from '@mui/joy/ModalClose';
import Modal from '@mui/joy/Modal';
import SimpleAlert from '../Alerts/SuccessAlert';



function TablePedido() {
  const [pedidos, setPedidos] = React.useState([]);
  const [pedidoSelecionado, setPedidoSelecionado] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);


  React.useEffect(() => {
    async function fetchPedidos() {
      try {
        const response = await axios.get("http://localhost:5000/pedido");
        setPedidos(response.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchPedidos();
  }, []);


  const isMobile = useMediaQuery('(max-width:600px)');

  const OpenModal = (pedido) => {
    setPedidoSelecionado(pedido);
    setOpen(true);
  };

  const alterarPedido = (e) => {
    const { name, value } = e.target;
    setPedidoSelecionado({ ...pedidoSelecionado, [name]: value });
  };

  const editPedido = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/pedido/${pedidoSelecionado.cod}`,
        pedidoSelecionado,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

      if (response.status === 201) {
        setPedidos(pedidos.map(pedido => pedido.cod === pedidoSelecionado.codp ? pedidoSelecionado : pedido));
        setOpen(false);
      } else {
        console.error('Erro ao editar pedido:');
      }
    } catch (error) {
      console.error('Erro ao editar pedido:', error);
    }
  };


  const AdicionarPedido = () => {
    const [novoPedido, setNovoPedido] = React.useState({ cod: '', pedido: '', op: '', comp: '', qtdp: '', qtdm: '', qtdg: '', qtdgg: '', qtdxgg: '', avm: '', obs: '', cnpjc: '', codf: '', codt: '' });

    const newPedido = (e) => {
      const { name, value } = e.target;
      setNovoPedido({ ...novoPedido, [name]: value });
    };

    const submitPedido = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('http://localhost:5000/pedido', novoPedido, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
        });
        if (response.status === 201) {
          const newPedido = response.data;
          setPedidos([...pedidos, newPedido]);
          setNovoPedido({ cod: '', pedido: '', op: '', comp: '', qtdp: '', qtdm: '', qtdg: '', qtdgg: '', qtdxgg: '', avm: '', obs: '', cnpjc: '', codf: '', codt: '' });
          <SimpleAlert />
        } else {
          console.error('Erro ao cadastrar pedido');
        }
      } catch (error) {
        console.error('Erro ao cadastrar pedido:', error);
      }
    };


    const columns = [
      { id: 'cod', label: 'Código', minWidth: isMobile ? '100%' : 10 },
      { id: 'pedido', label: 'Pedido', minWidth: isMobile ? '100%' : 10 },
      { id: 'op', label: 'OP', minWidth: isMobile ? '100%' : 10 },
      { id: 'comp', label: 'Composição', minWidth: isMobile ? '100%' : 10 },
      { id: 'qtdp', label: 'P', minWidth: isMobile ? '100%' : 10 },
      { id: 'qtdm', label: 'M', minWidth: isMobile ? '100%' : 10 },
      { id: 'qtdg', label: 'G', minWidth: isMobile ? '100%' : 10 },
      { id: 'qtdgg', label: 'GG', minWidth: isMobile ? '100%' : 10 },
      { id: 'qtdxgg', label: 'XGG', minWidth: isMobile ? '100%' : 10 },
      { id: 'avm', label: 'Aviamento', minWidth: isMobile ? '100%' : 10 },
      { id: 'obs', label: 'Observação', minWidth: isMobile ? '100%' : 10 },
      { id: 'cnpjc', label: 'CNPJ Cliente', minWidth: isMobile ? '100%' : 10 },
      { id: 'codf', label: 'Código Funcionário', minWidth: isMobile ? '100%' : 10 },
      { id: 'codt', label: 'Código Tecido', minWidth: isMobile ? '100%' : 10 },
      { id: 'edit', label: 'Editar', minWidth: isMobile ? '100%' : 10 }
    ];

    const rows = pedidos.map(pedido => ({
      ...pedido,
      edit: <Tooltip title="Editar"><IconButton sx={{ color: 'warning.main' }} size="large" onClick={() => OpenModal(pedido)}>
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
              label="Código"
              name='cod'
              value={novoPedido.cod}
              onChange={newPedido}
            />
            <TextField
              color='green'
              focused
              id='outlined-basic'
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '10%' }}
              label="Pedido"
              name='pedido'
              value={novoPedido.pedido}
              onChange={newPedido}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '10%' }}
              label="OP"
              name='op'
              value={novoPedido.op}
              onChange={newPedido}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '20%' }}
              label="Comprimento Plotter"
              name='comp'
              value={novoPedido.comp}
              onChange={newPedido}
            />
          </Stack>
          <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap"
            direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
            <TextField
              color='green'
              focused
              id='outlined-basic'
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '5%' }}
              label="P"
              name='qtdp'
              value={novoPedido.qtdp}
              onChange={newPedido}
            />
            <TextField
              color='green'
              focused
              id='outlined-basic'
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '5%' }}
              label="M"
              name='qtdm'
              value={novoPedido.qtdm}
              onChange={newPedido}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '5%' }}
              label="G"
              name='qtdg'
              value={novoPedido.qtdg}
              onChange={newPedido}
            />
            <TextField
              color='green'
              focused
              id='outlined-basic'
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '5%' }}
              label="GG"
              name='qtdgg'
              value={novoPedido.qtdgg}
              onChange={newPedido}
            />
            <TextField
              color='green'
              focused
              id='outlined-basic'
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '10%' }}
              label="XGG"
              name='qtdxgg'
              value={novoPedido.qtdxgg}
              onChange={newPedido}
            />
          </Stack>
          <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap"
            direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
            <TextField
              color='green'
              focused
              id='outlined-basic'
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '49%' }}
              label="Aviamento"
              name='avm'
              value={novoPedido.avm}
              onChange={newPedido}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '32%' }}
              label="Observação"
              name='obs'
              value={novoPedido.obs}
              onChange={newPedido}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '32%' }}
              label="Código Funcionário"
              name='codf'
              value={novoPedido.codf}
              onChange={newPedido}
            />
          </Stack>
          <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap" direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
            <TextField
              color='green'
              focused
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '33%' }}
              label="CNPJ Cliente"
              name='cnpjc'
              value={novoPedido.cnpjc}
              onChange={newPedido}
            />
            <TextField
              color='green'
              focused
              id='outlined-basic'
              size="small"
              sx={{ minWidth: isMobile ? '100%' : '10%' }}
              label="Código Tecido"
              name='codt'
              value={novoPedido.codt}
              onChange={newPedido}
            />
            <Button variant="contained" color="other" sx={{ minWidth: isMobile ? '100%' : '20%' }} onClick={submitPedido}>Adicionar Pedido</Button>
          </Stack>
        </ThemeProvider>
        <Grid container spacing={{ xs: 2 }}>
          <Grid item xs={12}>
            {isMobile ? (
              pedidos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((pedido) => (
                <Box key={pedido.cod} sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2, boxShadow: 1, width: "100%" }}>
                  {columns.map((column) => (
                    <Box key={column.id} sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>{column.label}:</Typography>
                      <Typography variant="body2">
                        {column.id === "edit" ? (
                          <Tooltip title="Editar">
                            <IconButton sx={{ color: 'warning.main' }} onClick={() => OpenModal(pedido)}>
                              <Icon path={mdiSquareEditOutline} size={1} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          pedido[column.id]
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
      <AdicionarPedido addNewPed={(novoPedido) => setPedidos([...pedidos, novoPedido])} />
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
            Editar Pedido
          </Typography>
          {pedidoSelecionado ? (
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
                  label="Código"
                  name='cod'
                  value={pedidoSelecionado.cod}
                  onChange={alterarPedido}
                />
                <TextField
                  color='green'
                  focused
                  id='outlined-basic'
                  size="small"
                  sx={{ minWidth: isMobile ? '100%' : '10%' }}
                  label="Pedido"
                  name='pedido'
                  value={pedidoSelecionado.pedido}
                  onChange={alterarPedido}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ minWidth: isMobile ? '100%' : '10%' }}
                  label="OP"
                  name='op'
                  value={pedidoSelecionado.op}
                  onChange={alterarPedido}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ minWidth: isMobile ? '100%' : '20%' }}
                  label="Comprimento Plotter"
                  name='comp'
                  value={pedidoSelecionado.comp}
                  onChange={alterarPedido}
                />
              </Stack>
                <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap"
                  direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
                  <TextField
                    color='green'
                    focused
                    id='outlined-basic'
                    size="small"
                    sx={{ minWidth: isMobile ? '100%' : '5%' }}
                    label="P"
                    name='qtdp'
                    value={pedidoSelecionado.qtdp}
                    onChange={alterarPedido}
                  />
                  <TextField
                    color='green'
                    focused
                    id='outlined-basic'
                    size="small"
                    sx={{ minWidth: isMobile ? '100%' : '5%' }}
                    label="M"
                    name='qtdm'
                    value={pedidoSelecionado.qtdm}
                    onChange={alterarPedido}
                  />
                  <TextField
                    color='green'
                    focused
                    size="small"
                    sx={{ minWidth: isMobile ? '100%' : '5%' }}
                    label="G"
                    name='qtdg'
                    value={pedidoSelecionado.qtdg}
                    onChange={alterarPedido}
                  />
                  <TextField
                    color='green'
                    focused
                    id='outlined-basic'
                    size="small"
                    sx={{ minWidth: isMobile ? '100%' : '5%' }}
                    label="GG"
                    name='qtdgg'
                    value={pedidoSelecionado.qtdgg}
                    onChange={alterarPedido}
                  />
                  <TextField
                    color='green'
                    focused
                    id='outlined-basic'
                    size="small"
                    sx={{ minWidth: isMobile ? '100%' : '10%' }}
                    label="XGG"
                    name='qtdxgg'
                    value={pedidoSelecionado.qtdxgg}
                    onChange={alterarPedido}
                  />
                </Stack>
                <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap"
                  direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
                  <TextField
                    color='green'
                    focused
                    id='outlined-basic'
                    size="small"
                    sx={{ minWidth: isMobile ? '100%' : '49%' }}
                    label="Aviamento"
                    name='avm'
                    value={pedidoSelecionado.avm}
                    onChange={alterarPedido}
                  />
                  <TextField
                    color='green'
                    focused
                    size="small"
                    sx={{ minWidth: isMobile ? '100%' : '32%' }}
                    label="Observação"
                    name='obs'
                    value={pedidoSelecionado.obs}
                    onChange={alterarPedido}
                  />
                  <TextField
                    color='green'
                    focused
                    size="small"
                    sx={{ minWidth: isMobile ? '100%' : '32%' }}
                    label="Código Funcionário"
                    name='codf'
                    value={pedidoSelecionado.codf}
                    onChange={alterarPedido}
                  />
                </Stack>
                <Stack spacing={{ xs: 2 }} useFlexGap flexWrap="wrap" direction={{ sm: 'column', md: 'row' }} sx={{ minWidth: 1 }}>
                  <TextField
                    color='green'
                    focused
                    size="small"
                    sx={{ minWidth: isMobile ? '100%' : '33%' }}
                    label="CNPJ Cliente"
                    name='cnpjc'
                    value={pedidoSelecionado.cnpjc}
                    onChange={alterarPedido}
                  />
                  <TextField
                    color='green'
                    focused
                    id='outlined-basic'
                    size="small"
                    sx={{ minWidth: isMobile ? '100%' : '10%' }}
                    label="Código Tecido"
                    name='codt'
                    value={pedidoSelecionado.codt}
                    onChange={alterarPedido}
                  />
                  <Button variant="outlined" color='warning' sx={{ color: 'warning.main', width: isMobile ? '100%' : '35%' }} onClick={editPedido}>Editar Pedido</Button>
                </Stack>
              </ThemeProvider>
            </Box>
          ) : (
            <Typography variant="body1">Nenhum Pedido selecionado</Typography>
          )}
        </Sheet>
      </Modal>
    </div>
  );

}

export default TablePedido;