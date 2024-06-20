import DataTable from 'react-data-table-component';
import './TableHome.css';

const columns = [
  {
    name: 'Pedido',
    selector: row => row.ped,
  },
  {
    name: 'Tercerizado',
    selector: row => row.terc,
  },
  {
    name: 'Data',
    selector: row => row.date,
  },
  {
    name: 'Status',
    selector: row => row.state,
  },
];
const data = [
  { ped:1, terc: 'João', date:'10/10/2010', state: 'Aguardando'},
  { ped:2, terc: "Maria", date: '12/12/2012', state: 'Concluído'},
  { ped:3, terc: "José", date: '14/14/2014', state: 'Aguardando'},
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

function TableHome() {

return (
  <div className='table'>
    <DataTable
      columns={columns}
      data={data}
      responsive={true}
      striped={true}
      customStyles={customStyles}
    />
  </div>
);
}
export default TableHome;
