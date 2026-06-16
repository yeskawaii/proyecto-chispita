import { useState } from 'react';
import { getIdeasIA } from '../services/api';

export default function TarjetaViaje({ viaje }) {
  const [ideas, setIdeas] = useState('');
  const [cargando, setCargando] = useState(false);

  const traerIdeas = async () => {
    setCargando(true);
    try {
      const datos = await getIdeasIA(viaje.id);
      setIdeas(datos.ideas_gemini);
    } catch (error) {
      setIdeas("Hubo un error de conexión con Gemini.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <li className="tarjeta">
      <h3>{viaje.destino}</h3>
      <p className="dato"><strong>Inicio:</strong> {viaje.fecha_inicio}</p>
      <p className="dato"><strong>Fin:</strong> {viaje.fecha_fin}</p>
      <p className="dato"><strong>Presupuesto:</strong> ${viaje.presupuesto_estimado} MXN</p>
      
      <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
        <button 
          onClick={traerIdeas}
          disabled={cargando}
          style={{ 
            padding: '8px 16px', background: cargando ? '#9ca3af' : '#4f46e5', 
            color: 'white', border: 'none', borderRadius: '6px', 
            cursor: cargando ? 'not-allowed' : 'pointer', width: '100%', fontWeight: 'bold'
          }}
        >
          {cargando ? 'Pensando...' : '✨ Generar Ideas IA'}
        </button>
        
        {ideas && (
          <div style={{ marginTop: '15px', padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem', color: '#374151' }}>
            <strong style={{ color: '#111827' }}>Ideas para {viaje.destino}:</strong>
            <p style={{ whiteSpace: 'pre-wrap', margin: '8px 0 0 0' }}>{ideas}</p>
          </div>
        )}
      </div>
    </li>
  );
}