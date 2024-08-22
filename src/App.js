import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Thermometer from 'react-thermometer-component'
import ReactSpeedometer from "react-d3-speedometer"
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

var items


const layout = {
  title: 'Ejemplo de Gráfico de Líneas con Plotly',
  xaxis: {
      title: 'Muestras'
  },
  yaxis: {
      title: 'Velocidad'
  }
};

const layout2 = {
  title: 'Ejemplo de Gráfico de Líneas con Plotly',
  xaxis: {
      title: 'Muestras'
  },
  yaxis: {
      title: 'Potencia'
  }
};

function exportToCSV(jsonData) {
  const csv = Papa.unparse(jsonData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "data.csv");
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportar() {

  console.log("Función 2 ejecutada");
    // Exportar los datos JSON a CSV
    axios.get('https://fasapicar-1-c2378527.deta.app/Car')
        .then(response => {
            exportToCSV(response.data);
        })
        .catch(error => {
            console.error("Error al obtener y exportar los datos:", error);
        });

}

function borrar() {

  axios.delete('https://fasapicar-1-c2378527.deta.app/Car')
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error("Error al obtener y exportar los datos:", error);
        });
}


function App() {

  
  const [data, setPlotData] = useState([]);
  const [data2, setPlotData2] = useState([]);

  // Estado local para almacenar los valores de los gauges
  const [gaugesData, setGaugesData] = useState({
    velocidad: 0,
    temperatura: 0,
    presion: 0,
    humedad: 0,
    corriente: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://fasapicar-1-c2378527.deta.app/Car');
        items = response.data;



        setPlotData([
          {
              x: items.map(item => item.key) ,
              y: items.map(item => item.speed) ,
              type: 'scatter',
              mode: 'lines+points',
              marker: {color: 'red'},
          }]);

          setPlotData2([
            {
                x: items.map(item => item.key) ,
                y: items.map(item => (item.voltaje * item.current)) ,
                type: 'scatter',
                mode: 'lines+points',
                marker: {color: 'red'},
            }]);
        
        const filteredItems = items.filter(item => item.key === items[items.length - 1].key);

        // Actualizar el estado local con los nuevos valores
        setGaugesData({

          velocidad: filteredItems[0]?.speed || 0,
          temperatura: filteredItems[0]?.tempeture || 0,
          altura: filteredItems[0]?.presure || 0,
          humedad: filteredItems[0]?.humidity || 0,
          corriente: filteredItems[0]?.current || 0,
          voltaje: filteredItems[0]?.voltaje || 0,
        });
       
        
      } catch (error) {
        console.error(error);
      }
    };

    // Llamar a fetchData inmediatamente
    fetchData();

    // Configurar un intervalo para llamar a fetchData cada 1 segundos
    const interval = setInterval(fetchData, 2600);

    // Limpiar el intervalo cuando el componente se desmonta
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <img src="/LogoCarro.jpeg" className="app-logo"/>
      <div className="gauges">
        
        <div className="gauge-container">
            <h3>Potencia</h3>
            <ReactSpeedometer valueTextFontSize='60px' height={200} labelFontSize='13px' maxValue={700} value={Math.round(gaugesData.voltaje * gaugesData.corriente)} needleColor="red" startColor="grey" segments={10} endColor="black"/>
        </div>
        
        <div className="gauge-container">
            <h3>velocidad</h3>
            <ReactSpeedometer valueTextFontSize='60px' height={200} labelFontSize='13px' maxValue={60} value={Math.round(gaugesData.velocidad)} needleColor="red" startColor="grey" segments={10} endColor="black"/>
        </div>

        <div className="gauge-container">
            <h3>Voltaje</h3>
            <ReactSpeedometer valueTextFontSize='60px' height={200} labelFontSize='13px' minValue={35} maxValue={60} value={Math.round(gaugesData.voltaje)} needleColor="red" startColor="grey" segments={10} endColor="black"/>
        </div>

      </div>
      
      <div className="gauges">
        <div className="gauge-container">
            <h3>Temperatura</h3>
            <Thermometer theme="dark" value={gaugesData.temperatura} max={100} steps={3} format="°C" size="large" height="180"/>
        </div>

        <div className="gauge-container">
            <h3>humedad</h3>
            <ReactSpeedometer  valueTextFontSize='30px' height={200} labelFontSize='13px' maxValue={100} value={gaugesData.humedad} needleColor="red" startColor="white" segments={10} endColor="blue"/>
        </div>

        <div className="gauge-container">
            <h3>Altura</h3>
            <ReactSpeedometer  valueTextFontSize='30px' height={200} labelFontSize='13px' minValue={100} maxValue={3000} value={gaugesData.altura} needleColor="red" startColor="grey" segments={10} endColor="black"/>
        </div>
        
        <div className="gauge-container">
            <h3>Corriente</h3>
            <ReactSpeedometer valueTextFontSize='30px' height={200} labelFontSize='13px' maxValue={15} value={gaugesData.corriente} needleColor="red" startColor="grey" segments={10} endColor="black"/>
        </div>
      </div>
      <div>

        <div className="plots-container">
            <Plot data={data} layout={layout} className='plots'/>
            <Plot data={data2} layout={layout2} className='plots'/>
        </div>

        <div className="buttons-container">

            <button onClick={exportar}>Exportar CSV</button>
            <button onClick={borrar}>Borrar datos</button>

        </div>

      </div>
    </div>
  );
}

export default App;


