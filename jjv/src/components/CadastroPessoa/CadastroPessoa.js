import './CadastroPessoa.css';
import { Link } from "react-router-dom";
import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Button from '@mui/material/Button';
import ListItemButton from '@mui/material/ListItemButton';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TablePessoa from '../TablePessoa/TablePessoa';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

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

export default function PersistentDrawerLeft() {
  const [open, setOpen] = React.useState(true);
  const [openCad, setOpenCadastro] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const theme = createTheme({
    palette: {
      green: {main: '#3f5a40c5'},
      greenBar: { main: '#2d5d2ea6' },
    },
  });

  const dropDownCad = () => {
    setOpenCadastro(!openCad);
  };

  return (
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
          <IconButton onClick={handleDrawerClose}>
            {<ChevronLeftIcon color="success" />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItemButton  sx={{display: 'flex', flexDirection: 'column', gap:1}}>
            <ThemeProvider theme={theme}>
            <Button variant="outlined" color="green" sx={{ width: 1 }}><Link className="link1" to="/">Sair</Link></Button>
              <Button variant="outlined" color="green" sx={{ width: 1 }}><Link className="link1" to="/home">Início</Link></Button>
              <Button variant="outlined" color="green" sx={{ width: 1 }} onClick={dropDownCad} className="link1">
                Cadastros{openCad ? <ExpandLess /> : <ExpandMore />}
              </Button>
              <Collapse in={openCad} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItemButton sx={{ pl: 4 }}>
                    <Button variant="outlined" color="green" sx={{ width: 1 }}><Link className="link1" to="/cadastrar/pessoas">Tabela Pessoas</Link></Button>
                  </ListItemButton>
                </List>
              </Collapse>

              <Button variant="outlined" color="green" sx={{ width: 1 }}><Link className="link1">Teste</Link></Button>
            </ThemeProvider>
          </ListItemButton>
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Box sx={{  display: 'flex', flexDirection: 'row' , justifyContent: 'center', my: 4}}>
          <Typography variant="h6">
            Tabela de Pessoas
          </Typography>
        </Box>
        <TablePessoa/>
      </Main>
    </Box >
  );
}
