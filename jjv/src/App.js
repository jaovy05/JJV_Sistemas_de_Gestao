import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import CadastroPessoa from './components/CadastroPessoa/CadastroPessoa';
import { Link } from "react-router-dom";
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Button from '@mui/material/Button';
import ListItemButton from '@mui/material/ListItemButton';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import './components/Home/Home.css';
import { Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CadastroFuncionario from './components/Funcionario/CadastroFuncionario';
import Servico from './components/Servico/Servico';
import Operacao from './components/Operacao/Operacao'
const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function App() {
  const [open, setOpen] = React.useState(true);
  const [openCad, setOpenCadastro] = React.useState(false);
  const [openRh, setOpenRh] = React.useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const sair = async () => {
    try {
      
      await axios.post('http://localhost:5000/logout'
      );
      localStorage.removeItem('cod');
      localStorage.removeItem('token');
      navigate('/');
  
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userCod = localStorage.getItem('cod');
        const token = localStorage.getItem('token');
        if (!userCod || !token) {
          navigate('/');
          return;
        }
        const response = await axios.get(`http://localhost:5000/cadastrar/pessoas/${userCod}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.data) {
          setUserName(response.data.nome);
        }
      } catch (error) {
        console.error('Erro ao buscar nome do usuário', error);
      }
    };
    fetchUserName();
  }, [navigate]);


  const theme = createTheme({
    palette: {
      green: { main: '#3f5a40c5' },
      greenBar: { main: '#2d5d2ea6' },
    },
  });


  const dropDownCad = () => {
    setOpenCadastro(!openCad);
  };

  const dropDownRh = () => {
    setOpenRh(!openRh);
  };



  return (

    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/*' element={
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <ThemeProvider theme={theme}>
            <AppBar position="fixed" color='greenBar'>
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  edge="start"
                  sx={{ mr: 2, ...(open && { display: 'none' }) }}
                >
                  <MenuIcon />
                </IconButton>
              </Toolbar>
            </AppBar>
          </ThemeProvider>
          <Drawer
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
              },
            }}
            variant="persistent"
            anchor="left"
            open={open}
          >
            <DrawerHeader>
              <Typography variant="h6"
                sx={{
                  width: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'black'
                }}>{userName}</Typography>
              <IconButton onClick={handleDrawerClose}>
                {<ChevronLeftIcon color="success" />}
              </IconButton>
            </DrawerHeader>
            <Divider />
            <List>
              <ListItemButton sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <ThemeProvider theme={theme}>
                  <Button variant="outlined" color="green" sx={{ width: 1 }}><Link className="link1" to="/home">Início</Link></Button>
                  <Button variant="outlined" color="green" sx={{ width: 1 }} onClick={dropDownCad} className="link1">
                    Cadastrar{openCad ? <ExpandLess /> : <ExpandMore />}
                  </Button>
                  <Collapse in={openCad} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      <ListItemButton sx={{ pl: 4 }}>
                        <Button variant="outlined" color="green" sx={{ width: 1 }}><Link className="link1">Cadastrar Tecido</Link></Button>
                        <Button variant="outlined" color="green" sx={{ width: 1 }}><Link className="link1" to="/operacao">Cadastrar Operacao</Link></Button>
                      </ListItemButton>
                    </List>
                  </Collapse>

                  <Button variant="outlined" color="green" sx={{ width: 1 }} onClick={dropDownRh} className="link1">RH{openRh ? <ExpandLess /> : <ExpandMore />}</Button>
                  <Collapse in={openRh} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      <ListItemButton sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', }}>
                        <Button variant="outlined" color="green" sx={{ width: 1 }}><Link className="link1" to="/cadastrar/pessoas">Cadastrar Pessoa</Link></Button>
                        <Button variant="outlined" color="green" sx={{ width: 1 }}><Link className="link1" to="/funcionario">Cadastrar Funcionário</Link></Button>
                      </ListItemButton>
                    </List>
                  </Collapse>
                  <Button onClick={sair} variant="outlined" color="green" sx={{ width: 1 }}><Link className="link1" to="/">Sair</Link></Button>
                </ThemeProvider>
              </ListItemButton>
            </List>
          </Drawer>
          <Main open={open}>
            <DrawerHeader />
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', my: 4 }}>
              <Routes>
                <Route path='/home' element={<Home />} />
                <Route path='/cadastrar/pessoas' element={<CadastroPessoa />} />
                <Route path='/funcionario' element={<CadastroFuncionario />} />
                <Route path='/servico' element={<Servico />} />
                <Route path='/operacao' element={<Operacao />} />
              </Routes>
            </Box>
          </Main>
        </Box >
      } />
    </Routes>
  );
}



