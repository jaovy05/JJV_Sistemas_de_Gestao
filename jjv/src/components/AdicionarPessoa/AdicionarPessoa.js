import React, { useState } from 'react';
import './AdicionarPessoa.css';

const AdicionarPessoa = ({ onAddPessoa }) => {
  const [pessoa, setPessoa] = useState({ nome: '', email: '', date: '', endn: '', end_logra: '', telefone1: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPessoa(prevPessoa => ({ ...prevPessoa, [name]: value }));
  };

  const handleAddPessoa = async () => {
    if (pessoa.nome.trim() !== '' && pessoa.email.trim() !== '' && pessoa.date.trim() !== '' && pessoa.end_logra.trim() !== '' && pessoa.telefone1.trim() !== '') {
      try {
        const response = await fetch('http://localhost:5000/home', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(pessoa),
        });

        if (response.ok) {
          const novaPessoa = await response.json();
          onAddPessoa(novaPessoa);
          setPessoa({ nome: '', email: '', date: '', endn: '', end_logra: '', telefone1: '' });
        } else {
          console.error('Erro ao adicionar pessoa');
        }
      } catch (error) {
        console.error('Erro ao adicionar pessoa', error);
      }
    }
  };

  const Mystyle = {
    maxWidth: '72%',
  };

  return (
    <div style={Mystyle}>
      <input
        type="text"
        name="nome"
        value={pessoa.nome}
        onChange={handleChange}
        placeholder="Nome"
      />
      <input
        type="email"
        name="email"
        value={pessoa.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <input
        type='date'
        name='date'
        value={pessoa.date}
        onChange={handleChange}
        placeholder='Data'
      />
      <input
        type='text'
        name='endn'
        value={pessoa.endn}
        onChange={handleChange}
        placeholder='Número'
      />
      <input
        type="text"
        name="end_logra"
        value={pessoa.end_logra}
        onChange={handleChange}
        placeholder="Endereço"
      />
      <input
        type="text"
        name="telefone1"
        value={pessoa.telefone1}
        onChange={handleChange}
        placeholder="Número"
      />
      <button className='addButton' onClick={handleAddPessoa}>Adicionar Pessoa</button>
    </div>
  );
};

export default AdicionarPessoa;
