import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import AdicionarPessoa from '../AdicionarPessoa/AdicionarPessoa';
import axios from 'axios';
import './TablePessoa.css';

const columns = [
  {
    name: 'Código',
    selector: row => row.cod,
  },
  {
    name: 'Nome',
    selector: row => row.nome,
  },
  {
    name: 'Email',
    selector: row => row.email,
  },
  {
    name: 'Data',
    selector: row => row.date,
  },
  {
    name: 'Endereço',
    selector: row => row.end_logra,
  },
  {
    name: 'Número',
    selector: row => row.endn,
  },
  {
    name: 'Telefone',
    selector: row => row.telefone1,
  },
];

const customStyles = {
  rows: {
    style: {
      color: 'black',
      fontWeight: 'bold',
      fontSize: '12px',
    }
  },
  headCells: {
    style: {
      fontSize: '14px',
      fontWeight: 'bold',
      paddingRight: '4px',
      backgroundColor: '#8fad8fa6',
    },
  },
};

function TablePessoa() {
  const [pessoa, setPessoa] = useState([]);

  useEffect(() => {
    const fetchPessoas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/cadastro/pessoa', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setPessoa(response.data);
      } catch (error) {
        console.error('Erro ao buscar pessoas', error);
      }
    };
    fetchPessoas();
  }, []);

  const handleAddPessoa = (novaPessoa) => {
    setPessoa(prevPessoas => [...prevPessoas, novaPessoa]);
  };

  return (
    <div className='table'>
      <AdicionarPessoa onAddPessoa={handleAddPessoa} />
      <DataTable
        columns={columns}
        data={pessoa}
        responsive={true}
        striped={true}
        customStyles={customStyles}
      />
    </div>
  );
}

export default TablePessoa;
