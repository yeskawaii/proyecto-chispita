import { useState } from 'react';
import { getIdeasIA, getGastos, postGasto } from '../services/api';

export default function TarjetaViaje({ viaje }) {
  const [ideas, setIdeas] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarGastos, setMostrarGastos] = useState(false);
  const [listaGastos, setListaGastos] = useState([]);
  const [nuevoGasto, setNuevoGasto] = useState({ descripcion: '', monto: '' });

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

  const toggleGastos = async () => {
    if (!mostrarGastos) {
      try {
        const gastos = await getGastos(viaje.id);
        setListaGastos(gastos);
      } catch (error) {
        console.error("Error al traer gastos:", error);
      }
    }
    setMostrarGastos(!mostrarGastos);
  };

  const manejarCambioGasto = (e) => {
    setNuevoGasto({ ...nuevoGasto, [e.target.name]: e.target.value });
  };

  const agregarGasto = async (e) => {
    e.preventDefault();
    try {
      const gastoFormateado = {
        descripcion: nuevoGasto.descripcion,
        monto: parseFloat(nuevoGasto.monto)
      };
      const gastoGuardado = await postGasto(viaje.id, gastoFormateado);
      setListaGastos([...listaGastos, gastoGuardado]);
      setNuevoGasto({ descripcion: '', monto: '' });
    } catch (error) {
      console.error("Error al guardar el gasto:", error);
    }
  };

  const totalGastado = listaGastos.reduce((total, gasto) => total + gasto.monto, 0);
  const restante = viaje.presupuesto_estimado - totalGastado;

  return (
    <li className="tarjeta">
      <h3>{viaje.destino}</h3>
      <p className="dato"><strong>Inicio:</strong> {viaje.fecha_inicio}</p>
      <p className="dato"><strong>Fin:</strong> {viaje.fecha_fin}</p>
      <p className="dato"><strong>Presupuesto:</strong> ${viaje.presupuesto_estimado} MXN</p>
      
      <div className="acciones-tarjeta">
        <button className="btn-accion btn-ia" onClick={traerIdeas} disabled={cargando}>
          {cargando ? 'Pensando...' : '✨ Ideas IA'}
        </button>
        <button className={`btn-accion btn-gastos ${mostrarGastos ? 'activo' : ''}`} onClick={toggleGastos}>
          {mostrarGastos ? 'Ocultar Gastos' : '💸 Ver Gastos'}
        </button>
      </div>
      
      {ideas && (
        <div className="seccion-ia">
          <strong>Ideas para {viaje.destino}:</strong>
          <p style={{ whiteSpace: 'pre-wrap', margin: '8px 0 0 0' }}>{ideas}</p>
        </div>
      )}

      {mostrarGastos && (
        <div className="seccion-gastos">
          <h4 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>Control de Gastos</h4>
          
          <form className="form-gasto" onSubmit={agregarGasto}>
            <input className="input-estilo" style={{flex: 2}} type="text" name="descripcion" placeholder="¿En qué gastaste?" value={nuevoGasto.descripcion} onChange={manejarCambioGasto} required />
            <input className="input-estilo" style={{flex: 1}} type="number" name="monto" placeholder="$ Monto" value={nuevoGasto.monto} onChange={manejarCambioGasto} required />
            <button type="submit" className="btn-principal" style={{padding: '8px 16px'}}>+</button>
          </form>

          {listaGastos.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>No hay gastos registrados aún.</p>
          ) : (
            <ul className="lista-gastos">
              {listaGastos.map((gasto, index) => (
                <li key={index}>
                  <span style={{color: '#374151'}}>{gasto.descripcion}</span>
                  <span style={{ fontWeight: 'bold', color: '#ef4444' }}>-${gasto.monto}</span>
                </li>
              ))}
            </ul>
          )}
          
          <div className="resumen-gastos">
            <div className="fila-resumen">
              <span style={{fontWeight: 'bold', color: '#111827'}}>Total Gastado:</span>
              <span style={{fontWeight: 'bold', color: '#111827'}}>${totalGastado} MXN</span>
            </div>
            <div className="fila-resumen">
              <span style={{color: '#6b7280'}}>Presupuesto Restante:</span>
              <span style={{ fontWeight: 'bold', color: restante < 0 ? '#ef4444' : '#10b981' }}>
                ${restante} MXN
              </span>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}