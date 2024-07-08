import React, {useState} from 'react';
import Divider from '@mui/material/Divider';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import ListItemButton from '@mui/material/ListItemButton';
import List from '@mui/material/List';
import { Link } from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

function MenuLateral ({theme}){
  const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  }));

  const [open, setOpen] = React.useState(true);
  const [openCad, setOpenCadastro] = React.useState(false);

  const handleDrawerClose = () => {
    setOpen(false);
  };
  
  const dropDownCad = () => {
    setOpenCadastro(!openCad);
  };


  return (
    <>  
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
                    <Button variant="outlined" color="green" sx={{ width: 1 }}><Link className="link1" to="/cadastrar/pessoas">Tabela Servico</Link></Button>
                  </ListItemButton>
                </List>
              </Collapse>
              <Button variant="outlined" color="green" sx={{ width: 1 }}><Link className="link1">Teste</Link></Button>
            </ThemeProvider>
          </ListItemButton>
        </List>
    </>
  )
}

export default MenuLateral;