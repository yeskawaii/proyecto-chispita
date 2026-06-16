import { useState, useEffect } from 'react';
import { getViajes } from './services/api';
import FormularioViaje from './components/FormularioViaje';
import TarjetaViaje from './components/TarjetaViaje';
import './styles/App.css';

function App() {
  const [viajes, setViajes] = useState([]);

  useEffect(() => {
    getViajes()
      .then(datos => setViajes(datos))
      .catch(error => console.error("Tronó la conexión:", error));
  }, []);

  const agregarNuevoViaje = (viaje) => {
    setViajes([...viajes, viaje]);
  };

  return (
    <div className="contenedor">
      <h1 className="titulo-principal">Centro de Comando Chispita 🚀</h1>
      
      <FormularioViaje onViajeGuardado={agregarNuevoViaje} />
      
      {viajes.length === 0 ? (
        <p style={{textAlign: 'center'}}>Cargando datos del backend...</p>
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