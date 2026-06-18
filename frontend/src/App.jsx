import { useState, useEffect } from 'react';
import { getViajes } from './services/api';
import FormularioViaje from './components/FormularioViaje';
import TarjetaViaje from './components/TarjetaViaje';
import './styles/App.css';

function App() {
  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorConexion, setErrorConexion] = useState(false);

  useEffect(() => {
    getViajes()
      .then(datos => {
        setViajes(datos);
        setCargando(false);
      })
      .catch(error => {
        console.error("Tronó la conexión:", error);
        setErrorConexion(true);
        setCargando(false);
      });
  }, []);

  const agregarNuevoViaje = (viaje) => {
    setViajes([...viajes, viaje]);
  };

  return (
    <div className="contenedor">
      <h1 className="titulo-principal">Centro de Comando Chispita 🚀</h1>
      
      <FormularioViaje onViajeGuardado={agregarNuevoViaje} />
      
      {/* Lógica condicional separada y clara */}
      {cargando ? (
        <p style={{textAlign: 'center'}}>Cargando datos del backend...</p>
      ) : errorConexion ? (
        <div style={{ textAlign: 'center', padding: '20px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', border: '1px solid #f87171' }}>
          <h3>🚨 Error de Conexión</h3>
          <p>No se pudo conectar con el backend. Revisa que tu servidor esté corriendo o que la URL en api.js sea correcta.</p>
        </div>
      ) : viajes.length === 0 ? (
        <p style={{textAlign: 'center'}}>No hay viajes registrados. ¡Agrega el primero arriba!</p>
      ) : (
        <ul className="grid-viajes">
          {viajes.map(viaje => (
            <TarjetaViaje key={viaje.id} viaje={viaje} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;