import React from 'react'
import './Home.css'
import Navbar from '../Navbar/Navbar'
import TableHome from '../TableHome/TableHome';

function Home() {
  return (
    <div className='navhome'>
        <Navbar/>
        <TableHome className='table'/>
        <h1>Home</h1>
    </div>
  )
}

export default Home;