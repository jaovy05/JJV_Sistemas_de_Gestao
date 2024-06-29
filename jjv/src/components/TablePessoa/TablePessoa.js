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



function TablePessoa() {
  const [open, setOpen] = React.useState(false);
  const [pessoas, setPessoas] = useState([]);
  const [pessoaSelecionada, setPessoaSelecionada] = useState();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);


  //busca pessoas na api
  useEffect(() => {
    const fetchPessoas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/cadastrar/pessoas', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setPessoas(response.data);
      } catch (error) {
        console.error('Erro ao buscar pessoas', error);
      }
    };
    fetchPessoas();
  }, []);
  //


  //abrir modal
  const OpenModal = (pessoa) => {
    setPessoaSelecionada(pessoa);
    setOpen(true);
  };
  //


  //atualiza 0 estado da pessoa selecionada
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPessoaSelecionada(prevPessoa => ({ ...prevPessoa, [name]: value }));
  };
  //

  //envia a requisição para editar pessoa[PUT]
  const handleEditPessoa = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/cadastrar/pessoas/${pessoaSelecionada.cod}`,
        pessoaSelecionada,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

      if (response.status === 200) {
        setPessoas(pessoas.map(pessoa => pessoa.cod === pessoaSelecionada.cod ? pessoaSelecionada : pessoa));
        setOpen(false);
      } else {
        console.error('Erro ao editar pessoa');
      }
    } catch (error) {
      console.error('Erro ao editar pessoa', error);
    }
  };
  //

  //seta o estado inicial da nova pessoa
  const AdicionarPessoa = ({ addNewPessoa }) => {
    const [novaPessoa, setNovaPessoa] = useState({ nome: '', email: '', date: '', endn: '', end_logra: '', telefone1: '' });


    //adiciona nova pessoa
    const newPerson = (e) => {
      const { name, value } = e.target;
      setNovaPessoa(prevPessoa => ({ ...prevPessoa, [name]: value }));
    };
    //

    const handleDateChange = (event) => {
      setNovaPessoa((prevPessoa) => ({
        ...prevPessoa,
        date: event.target.value,
      }));
    };


    //envia a requisição para adicionar pessoa[POST]
    const AddPessoa = async () => {
      try {
        const response = await axios.post('http://localhost:5000/cadastrar/pessoas',
          novaPessoa,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
          });

        if (response.status === 201) {
          const novaPessoaAdicionada = response.data;
          addNewPessoa(novaPessoaAdicionada);
          setNovaPessoa({ nome: '', email: '', date: '', endn: '', end_logra: '', telefone1: '' });
          window.location.reload(); //gambiarra para atualizar a página
        } else {
          console.error(`Erro ao adicionar pessoa: ${response.status} - ${response.statusText}`);
        }
      } catch (error) {
        console.error('Erro ao adicionar pessoas', error.message);
      }
    };
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


    //criar colunas
    const columns = [
      { id: 'cod', label: 'Código' },
      { id: 'nome', label: 'Nome', },
      { id: 'email', label: 'Email' },
      { id: 'date', label: 'Data', align: 'right', },
      { id: 'end_logra', label: 'Endereço', align: 'right', },
      { id: 'endn', label: 'Número' },
      { id: 'telefone1', label: 'Telefone' },
      { id: 'edit', label: 'Editar' },
      { id: 'delete', label: 'Deletar' }
    ];

    // Format date


    function formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }



    //criar linhas popula a tabela
    const rows = pessoas.map(pessoa => ({
      ...pessoa,
      date: formatDate(pessoa.date),
      edit: <Tooltip title="Editar"><IconButton sx={{ color: 'warning.main' }} size="large" onClick={() => OpenModal(pessoa)}>
        <Icon path={mdiSquareEditOutline} size={1} />
      </IconButton></Tooltip>,
      delete: <Tooltip title="Excluir"><IconButton sx={{ color: 'error.main' }} size="large" onClick={() => DeletePessoa(pessoa.cod)}>
        <Icon path={mdiDeleteForeverOutline} size={1} />
      </IconButton></Tooltip>
    }));

    //

    //deletar pessoa
    const DeletePessoa = async (cod) => {
      try {
        const response = await axios.delete(`http://localhost:5000/cadastrar/pessoas/${cod}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.status === 200) {
          setPessoas(pessoas.filter(pessoa => pessoa.cod !== cod));
        } else {
          console.error('Erro ao deletar pessoa', response.data);
        }
      } catch (error) {
        console.error('Erro ao deletar pessoa', error);
      }
    };
    //


    //manipulação de paginação
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(event.target.value);
      setPage(0);
    }
    //


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
              color='green'
              focused
              id='outlined-basic'
              size="small"
              sx={{ width: '49%' }}
              label="Nome"
              name='nome'
              value={novaPessoa.nome}
              onChange={newPerson}
            />
            <TextField
              color='green'
              focused
              size="small"
              sx={{ width: '49%' }}
              label="Email"
              name='email'
              value={novaPessoa.email}
              onChange={newPerson}
            />
          </Stack>
          <Stack spacing={2}  useFlexGap flexWrap="wrap"
            direction={{ sm: 'column', md: 'row' }} sx={{ minWidth:1 }}>
          <TextField
            color='green'
            focused
            size="small"
            sx={{ width: '64%' }}
            label="Endereço"
            name='end_logra'
            value={novaPessoa.end_logra}
            onChange={newPerson}
          />
          <TextField
            color='green'
            focused
            size="small"
            sx={{ width: '34%' }}
            label="Número"
            name='endn'
            value={novaPessoa.endn}
            onChange={newPerson}
          />
          </Stack>
          <Stack spacing={2}  useFlexGap flexWrap="wrap"
            direction={{ sm: 'column', md: 'row' }} sx={{ minWidth:1 }}>
          <TextField
            color='green'
            focused
            size="small"
            sx={{ width: '49%' }}
            type='date'
            label="Data"
            name='date'
            value={novaPessoa.date}
            onChange={handleDateChange}
          />
          <TextField
            color='green'
            focused
            size="small"
            sx={{ width: '49%' }}
            label="Telefone"
            name='telefone1'
            value={novaPessoa.telefone1}
            onChange={newPerson}
          />
          </Stack>
          <Button variant="contained" color="other" sx={{ width: '25%' }} onClick={AddPessoa}>Adicionar Pessoa</Button>
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
      <AdicionarPessoa addNewPessoa={(novaPessoa) => setPessoas([...pessoas, novaPessoa])} />
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
            Editar Pessoa
          </Typography>
          {pessoaSelecionada ? (
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
                  value={pessoaSelecionada.nome}
                  onChange={handleChange}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: '45%' }}
                  label="Email"
                  name='email'
                  value={pessoaSelecionada.email}
                  onChange={handleChange}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: '65%' }}
                  label="Endereço"
                  name='end_logra'
                  value={pessoaSelecionada.end_logra}
                  onChange={handleChange}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: '30%' }}
                  label="Número"
                  name='endn'
                  value={pessoaSelecionada.endn}
                  onChange={handleChange}
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: '45%' }}
                  type='date'
                  label="Data"
                  name='date'
                  value={pessoaSelecionada.date}
                  onChange={(e) =>
                    setPessoaSelecionada((prevPessoa) => ({
                      ...prevPessoa,
                      date: e.target.value
                    }))
                  }
                />
                <TextField
                  color='green'
                  focused
                  size="small"
                  sx={{ width: '45%' }}
                  label="Telefone"
                  name='telefone1'
                  value={pessoaSelecionada.telefone1}
                  onChange={handleChange}
                />
                <Button variant="outlined" color='warning' sx={{ color: 'warning.main', width: '25%' }} onClick={handleEditPessoa}>Editar Pessoa</Button>
              </ThemeProvider>
            </Box>
          ) : (
            <Typography variant="body1">Nenhuma pessoa selecionada</Typography>
          )}
        </Sheet>
      </Modal>
    </div>
  );
}

export default TablePessoa;


