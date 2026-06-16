import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [viajes, setViajes] = useState([])
  const [ideasGemini, setIdeasGemini] = useState({}) 
  const [cargandoIA, setCargandoIA] = useState({}) 

  useEffect(() => {
    fetch('http://127.0.0.1:8000/viajes/')
      .then(respuesta => respuesta.json())
      .then(datos => setViajes(datos))
      .catch(error => console.error("Tronó la conexión:", error))
  }, [])

  const traerIdeas = async (viajeId) => {
    setCargandoIA(prev => ({ ...prev, [viajeId]: true }))
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/viajes/${viajeId}/ideas`)
      const datos = await res.json()
      
      setIdeasGemini(prev => ({ ...prev, [viajeId]: datos.ideas_gemini }))
    } catch (error) {
      console.error("Error con la IA:", error)
      setIdeasGemini(prev => ({ ...prev, [viajeId]: "Hubo un problema de conexión con Gemini." }))
    } finally {
      setCargandoIA(prev => ({ ...prev, [viajeId]: false }))
    }
  }

  return (
    <div className="contenedor">
      <h1 className="titulo-principal">Centro de Comando Chispita 🚀</h1>
      
      {viajes.length === 0 ? (
        <p style={{textAlign: 'center'}}>Cargando datos del backend...</p>
      ) : (
        <ul className="grid-viajes">
          {viajes.map(viaje => (
            <li key={viaje.id} className="tarjeta">
              <h3>{viaje.destino}</h3>
              <p className="dato"><strong>Inicio:</strong> {viaje.fecha_inicio}</p>
              <p className="dato"><strong>Fin:</strong> {viaje.fecha_fin}</p>
              <p className="dato"><strong>Presupuesto:</strong> ${viaje.presupuesto_estimado} MXN</p>
              
              <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
                <button 
                  onClick={() => traerIdeas(viaje.id)}
                  disabled={cargandoIA[viaje.id]}
                  style={{ 
                    padding: '8px 16px', 
                    background: cargandoIA[viaje.id] ? '#9ca3af' : '#4f46e5', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: cargandoIA[viaje.id] ? 'not-allowed' : 'pointer',
                    width: '100%',
                    fontWeight: 'bold'
                  }}
                >
                  {cargandoIA[viaje.id] ? 'Pensando...' : '✨ Generar Ideas IA'}
                </button>
                

                {ideasGemini[viaje.id] && (
                  <div style={{ marginTop: '15px', padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem', color: '#374151' }}>
                    <strong style={{ color: '#111827' }}>Ideas para {viaje.destino}:</strong>
                    <p style={{ whiteSpace: 'pre-wrap', margin: '8px 0 0 0' }}>
                      {ideasGemini[viaje.id]}
                    </p>
                  </div>
                )}
              </div>

            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App