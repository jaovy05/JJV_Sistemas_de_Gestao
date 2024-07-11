import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart } from "react-google-charts";

const Grafico = () => {
  const [dadosGrafico, setDadosGrafico] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/grafico');
        const dadosFormatados = response.data.map(item => [
          item.mes,  // Convertendo para número inteiro
          parseFloat(item.sum)  // Convertendo para número de ponto flutuante
        ]);

        // Inclui cabeçalhos das colunas
        const dadosComCabecalho = [['Mês', 'Valor'], ...dadosFormatados];
        
        setDadosGrafico(dadosComCabecalho);
        console.log(dadosComCabecalho)
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error);
      }
    };  
    fetchData();
  }, []);

  const options = {
    legend: 'none',
    animation: { duration: 500, easing: "linear", startup: true },
    title: "Gastos X Mês (ultimos 24 meses)",
    titleTextStyle: { fontSize: 18, bold: true, textAlign: 'center' }, // Ajusta o estilo do título
    hAxis: {
    ticks: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],// Define os ticks do eixo X apenas para os meses desejados
      title: 'Meses',
      titleTextStyle: { fontSize: 14, italic: false } // Estilo do título do eixo X
    },
    vAxis: {
      title: 'Valores',
      titleTextStyle: { fontSize: 14, italic: false } // Estilo do título do eixo Y
    }
  };
  return (
    <>
        <Chart 
        chartType='ColumnChart'
        width="84%"
        height="400px"
        data={dadosGrafico}
        chartLanguage='pt-BR'
        options={options}
        />
    </>
  );
};

export default Grafico;
