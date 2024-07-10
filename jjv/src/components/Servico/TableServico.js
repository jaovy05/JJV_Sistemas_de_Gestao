import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import Icon from '@mdi/react';
import { mdiSquareEditOutline, mdiDeleteForeverOutline } from '@mdi/js';

function TableServico() {
  const [open, setOpen] = React.useState(false);
  const [servicos, setServico] = useState([]);
  const [servicoSelecionado, setServicoSelecionado] = useState();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  //busca servicos na api
  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/servico', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setServico(response.data);
      } catch (error) {
        console.error('Erro ao buscar serviço', error);
      }
    };
    fetchServicos();
  }, []);

  //abrir modal
  const OpenModal = (servico) => {
    setServicoSelecionado(servico);
    setOpen(true);
  };

  //atualiza 0 estado da servico selecionada
  const handleChange = (e) => {
    const { name, value } = e.target;
    setServicoSelecionado(prevServico => ({ ...prevServico, [name]: value }));
  };

  //envia a requisição para editar servico[PUT]
  const handleEditServico = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/servico/${servicoSelecionado.os}`,
        servicoSelecionado,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

      if (response.status === 200) {
        setServico(servicos.map(servico => servico.os === servicoSelecionado.os ? servicoSelecionado : servico));
        setOpen(false);
      } else {
        console.error('Erro ao editar servico');
      }
    } catch (error) {
      console.error('Erro ao editar servico', error);
    }
  };

  //seta o estado inicial da nova servico
  const AdicionarServico = ({ addNewServico }) => {

    const [novoServico, setNovoServico] = useState({ 
            os: '',
            data_ter: '',
            data_esperada: '',
            terceirizado: {
              cnpj: '',
            }, 
            corte: {
              qtd: 0,
              tam: '',
              codp: '',
            },
            ops: {
              op1: ''
            }
        });


    //adiciona nova servico
    const newPerson = (e) => {
      const { name, value } = e.target;
      setNovoServico(prevServico => ({ ...prevServico, [name]: value }));
    };

    const handleDateChange = (event) => {
      setNovoServico((prevServico) => ({
        ...prevServico,
        date: event.target.value,
      }));
    };

    //envia a requisição para adicionar servico[POST]
    const AddServico = async () => {
      try {
        const response = await axios.post('http://localhost:5000/servico',
          novoServico,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
          });

        if (response.status === 201) {
          const novoServicoAdicionado = response.data;
          addNewServico(novoServicoAdicionado);
          setNovoServico({ 
            os: '',
            data_ter: '',
            data_esperada: '',
            terceirizado: {
              cnpj: '',
            }, 
            corte: {
              qtd: 0,
              tam: '',
              codp: '',
            },
            ops: {
              op1: '',
            },
        });
          window.location.reload(); //gambiarra para atualizar a página
        } else {
          console.error(`Erro ao adicionar serviço: ${response.status} - ${response.statusText}`);
        }
      } catch (error) {
        console.error('Erro ao adicionar serviços', error.message);
      }
    };
    
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


    //criar colunas
    const columns = [
      { id: 'os', label: 'OS'},
      { id: 'ter', label: 'Terceirizado' },
      { id: 'codp', label: 'Pedido'},
      { id: 'tam', label: 'Tamanho'},
      {id: 'qtd', label: 'Quantidade'},
      { id: 'datee', label: 'Data Enviado', align: 'right', },
      { id: 'datet', label: 'Data Recebido', align: 'right', },
      {id: 'op', label: 'Operações'},
      { id: 'edit', label: 'Editar' },
      { id: 'delete', label: 'Deletar' }
    ];

    function formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    //criar linhas popula a tabela
    const rows = servicos.map(servico => ({
      ...servico,
      date: formatDate(servico.date),
      edit: <Tooltip title="Editar"><IconButton sx={{ color: 'warning.main' }} size="large" onClick={() => OpenModal(servico)}>
        <Icon path={mdiSquareEditOutline} size={1} />
      </IconButton></Tooltip>,
      delete: <Tooltip title="Excluir"><IconButton sx={{ color: 'error.main' }} size="large" onClick={() => DeleteServico(servico.os)}>
        <Icon path={mdiDeleteForeverOutline} size={1} />
      </IconButton></Tooltip>
    }));

    //deletar servico
    const DeleteServico = async (os) => {
      try {
        const response = await axios.delete(`http://localhost:5000/servico/${os}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.status === 200) {
          setServico(servicos.filter(servico => servico.os !== os));
        } else {
          console.error('Erro ao deletar servico', response.data);
        }
      } catch (error) {
        console.error('Erro ao deletar servico', error);
      }
    };

    //manipulação de paginação
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(event.target.value);
      setPage(0);
    }
    //

    const commonTextFieldProps = (namep) => ({
        color: 'green',
        focused: true,
        size: 'small',
        onChange: newPerson,
        name: namep,
      });

    return (
      <Box component="form" sx={{
        width: 'auto',
        mimWidth: 'sm',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 3,
      }}>
        <ThemeProvider theme={theme}>
          <Stack spacing={2}  useFlexGap flexWrap="wrap"
            direction={{ sm: 'column', md: 'row' }} sx={{ minWidth:1 }}>
            <TextField 
                {...commonTextFieldProps('nome')}
              id='outlined-basic'
              sx={{ width: '49%' }}
              label="Nome"
              value={novoServico.terceirizado.cnpj}
            />
            <TextField
              sx={{ width: '49%' }}
              label="Ordem de serviço"
              {...commonTextFieldProps('os')}
              value={novoServico.os}
            />
          </Stack>
          <Stack spacing={2}  useFlexGap flexWrap="wrap"
            direction={{ sm: 'column', md: 'row' }} sx={{ minWidth:1 }}>
          <TextField         
            sx={{ width: '30%' }}
            label="Pedido"
            {...commonTextFieldProps('pedido')}
            value= {novoServico.corte.codp}
          />
          <TextField
            sx={{ width: '15%' }}
            label="Tamanho do corte"
            {...commonTextFieldProps('corte')}
            value={novoServico.corte.tam}
          />
          <TextField
            sx={{ width: '15%' }}
            label="Quantidade Corte"
            {...commonTextFieldProps('qtd')}
            value={novoServico.corte.tam}
          />
          </Stack>
          <Stack spacing={2}  useFlexGap flexWrap="wrap"
            direction={{ sm: 'column', md: 'row' }} sx={{ minWidth:1 }}>
          <TextField
            color='green'
            focused
            size="small"
            sx={{ width: '25%' }}
            type='date'
            label="Data de entrega"
            name='datee'
            value={novoServico.data_ter}
            onChange={handleDateChange}
          />
          <TextField
            color='green'
            focused
            size="small"
            sx={{ width: '40%' }}
            type='date'
            label="Data esperada de recebimento"
            name='dater'
            value={novoServico.data_esperada}
            onChange={handleDateChange}
          />
          <TextField
            
            sx={{ width: '25%' }}
            label="Operação"
            {...commonTextFieldProps('op')}
            value={novoServico.ops.op1}
            
          />
          </Stack>
          <Button variant="contained" color="other" sx={{ width: '25%' }} onClick={AddServico}>Adicionar Serviço</Button>
        </ThemeProvider>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
          <TableContainer >  
            {/* sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }} */}
            <Table
              size="lg"
              stripe="even"
              variant="soft">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ top: 57, minWidth: column.minWidth }}
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
                            <TableCell key={column.id} align={column.align}>
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
      <AdicionarServico addNewServico={(novoServico) => setServico([...servicos, novoServico])} />
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Sheet
          variant="outlined"
          sx={{
            minWidth: 500,
            maxWidth: 800,
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
            textColor="inherit"
            fontWeight="lg"
            mb={1}
          >
            Editar serviço
          </Typography>
          {servicoSelecionado ? (
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
                  sx={{ width: '45%' }}
                  label="Nome"
                  name='nome'
                  value={servicoSelecionado.terceirizado.cnpj}
                  onChange={handleChange}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: '45%' }}
                  label="Ordem de Serviço"
                  name='os'
                  value={servicoSelecionado.os}
                  onChange={handleChange}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: '65%' }}
                  label="Tamanho do Corte"
                  name='corte'
                  value={servicoSelecionado.corte.tam}
                  onChange={handleChange}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: '30%' }}
                  label="Quantidade Corte"
                  name='qtd'
                  value={servicoSelecionado.corte.tam}
                  onChange={handleChange}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: '45%' }}
                  type='date'
                  label="Data de Entrega"
                  name='datee'
                  value={servicoSelecionado.data_ter}
                  onChange={(e) =>
                    setServicoSelecionado((prevServico) => ({
                      ...prevServico,
                      date: e.target.value
                    }))
                  }
                />
                 <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: '45%' }}
                  type='date'
                  label="Data esperada"
                  name='dater'
                  value={servicoSelecionado.data_esperada}
                  onChange={(e) =>
                    setServicoSelecionado((prevServico) => ({
                      ...prevServico,
                      date: e.target.value
                    }))
                  }
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: '45%' }}
                  label="Operação"
                  name='op'
                  value={servicoSelecionado.ops.op1}
                  onChange={handleChange}
                />
                <Button variant="outlined" color='warning' sx={{ color: 'warning.main', width: '25%' }} onClick={handleEditServico}>Editar Serviço</Button>
              </ThemeProvider>
            </Box>
          ) : (
            <Typography variant="body1">Nenhum serviço selecionado</Typography>
          )}
        </Sheet>
      </Modal>
    </div>
  );
}

export default TableServico;