import React  from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import CadastroPessoa from './components/CadastroPessoa/CadastroPessoa';

function App() {
  
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/home' element={<Home />} />
        <Route path='/cadastrar/pessoas' element={<CadastroPessoa />} />
      </Routes>
    </div>
  );
}

export default App;


