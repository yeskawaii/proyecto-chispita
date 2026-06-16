import { useState, useEffect } from 'react'

function App() {
  // Aquí guardamos los viajes que nos mande el backend
  const [viajes, setViajes] = useState([])

  // Esto se ejecuta una sola vez cuando la página carga
  useEffect(() => {
    fetch('http://127.0.0.1:8000/viajes/')
      .then(respuesta => respuesta.json())
      .then(datos => setViajes(datos))
      .catch(error => console.error("Tronó la conexión:", error))
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Centro de Comando Chispita 🚀</h1>
      <h2>Viajes Planeados:</h2>
      
      {viajes.length === 0 ? (
        <p>Cargando datos del backend...</p>
      ) : (
        <ul>
          {viajes.map(viaje => (
            <li key={viaje.id} style={{ marginBottom: '10px' }}>
              <strong>{viaje.destino}</strong> <br/>
              Fechas: {viaje.fecha_inicio} al {viaje.fecha_fin} <br/>
              Presupuesto: ${viaje.presupuesto_estimado} MXN
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App