import React  from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import CadastroPessoa from './components/CadastroPessoa/CadastroPessoa';

function App() {
  
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/home' element={<Home />} />
        <Route path='/cadastro/pessoa' element={<CadastroPessoa />} />
      </Routes>
    </div>
  );
}

export default App;


