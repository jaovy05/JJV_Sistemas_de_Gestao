import React from 'react'
import './CadastroPessoa.css'
import '../TablePessoa/TablePessoa.css'
import Navbar from '../Navbar/Navbar'
import TablePessoa from '../TablePessoa/TablePessoa';

function CadastroPessoa() {
  return (
    <div className='nav'>
        <Navbar/>
        <h1>Cadastro de Pessoas</h1>
        <TablePessoa className='table'/>
    </div>
  )
}
export default CadastroPessoa;