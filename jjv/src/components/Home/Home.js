import React from 'react'
import './Home.css'
import Navbar from '../Navbar/Navbar'
import TableHome from '../TableHome/TableHome';

function Home() {
  return (
    <div className='navhome'>
        <Navbar/>
        <h1>Pedidos em andamento</h1>
        <TableHome className='table'/>
    </div>
  )
}

export default Home;