import { useState } from 'react';
import { getIdeasIA, getGastos, postGasto, deleteViaje, deleteGasto } from '../services/api';
import Itinerario from './Itinerario';

export default function TarjetaViaje({ viaje, onDelete }) {
  const [ideas, setIdeas] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarGastos, setMostrarGastos] = useState(false);
  const [listaGastos, setListaGastos] = useState([]);
  const [nuevoGasto, setNuevoGasto] = useState({ concepto: '', monto: '' });
  const [mostrarItinerario, setMostrarItinerario] = useState(false);

  const traerIdeas = async () => {
    setCargando(true);
    try {
      const datos = await getIdeasIA(viaje.id);
      setIdeas(datos.ideas_gemini);
    } catch (error) {
      setIdeas("Error de conexión con Gemini.");
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

  const manejarCambioGasto = (e) => setNuevoGasto({ ...nuevoGasto, [e.target.name]: e.target.value });

  const agregarGasto = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        concepto: nuevoGasto.concepto,
        monto: parseFloat(nuevoGasto.monto),
        fecha_pago: new Date().toISOString().split('T')[0]
      };

      const gastoGuardado = await postGasto(viaje.id, payload);
      setListaGastos([...listaGastos, gastoGuardado]);
      setNuevoGasto({ concepto: '', monto: '' });
    } catch (error) {
      console.error("Error al guardar el gasto:", error);
    }
  };

  const borrarViaje = async () => {
    try {
      await deleteViaje(viaje.id);
      if (onDelete) onDelete(viaje.id);
    } catch (error) {
      console.error("Error al borrar viaje:", error);
    }
  };

  const borrarGasto = async (gastoId) => {
    try {
      await deleteGasto(gastoId);
      setListaGastos(listaGastos.filter(g => g.id !== gastoId));
    } catch (error) {
      console.error("Error al borrar gasto:", error);
    }
  };

  const totalGastado = listaGastos.reduce((total, gasto) => total + gasto.monto, 0);
  const restante = viaje.presupuesto_estimado - totalGastado;

  return (
    <li className="bg-white border border-teal-100 rounded-2xl p-6 shadow-lg hover:shadow-teal-500/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col">
      {/* Línea decorativa arriba: tonos caribeños */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-cyan-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>

      <div className="mb-4 pb-3 border-b border-gray-100 flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-teal-800">{viaje.titulo}</h3>
          <p className="text-sm text-gray-500 mt-1">
            📍 Destino: <span className="text-gray-700 font-medium">{viaje.destino}</span>
          </p>
        </div>
        <button onClick={borrarViaje} className="text-red-400 hover:text-red-600 transition-colors p-1" title="Eliminar viaje">
          🗑️
        </button>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-6 flex-grow">
        <p><strong className="text-gray-800">Inicio:</strong> {viaje.fecha_inicio}</p>
        <p><strong className="text-gray-800">Fin:</strong> {viaje.fecha_fin}</p>
        <p><strong className="text-gray-800">Presupuesto:</strong> <span className="text-emerald-600 font-semibold">${viaje.presupuesto_estimado} MXN</span></p>
      </div>

      <div className="flex gap-3 mt-auto">
        <button onClick={traerIdeas} disabled={cargando} className="flex-1 py-2 px-3 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg font-semibold transition-colors text-sm border border-cyan-100">
          {cargando ? 'Pensando...' : '✨ IA Ideas'}
        </button>
        <button onClick={toggleGastos} className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-colors text-sm border ${mostrarGastos ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100'}`}>
          {mostrarGastos ? 'Ocultar Gastos' : '💸 Gastos'}
        </button>
        <button onClick={() => setMostrarItinerario(!mostrarItinerario)} className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-colors text-sm border ${mostrarItinerario ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100'}`}>
          {mostrarItinerario ? 'Ocultar Itinerario' : '📅 Itinerario'}
        </button>
      </div>

      {ideas && (
        <div className="mt-5 p-4 bg-cyan-50/50 border border-cyan-100 rounded-xl text-sm text-cyan-900 relative">
          <button onClick={() => setIdeas('')} className="absolute top-2 right-2 text-cyan-500 hover:text-cyan-800 transition-colors text-xs" title="Cerrar ideas">
            ❌
          </button>
          <p className="whitespace-pre-wrap mt-2">{ideas}</p>
        </div>
      )}

      {mostrarGastos && (
        <div className="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <form className="flex gap-2 mb-4" onSubmit={agregarGasto}>
            <input className="flex-2 bg-white border border-gray-300 rounded p-2 text-sm text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-full" type="text" name="concepto" placeholder="Concepto" value={nuevoGasto.concepto} onChange={manejarCambioGasto} required />
            <input className="flex-1 bg-white border border-gray-300 rounded p-2 text-sm text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-24" type="number" name="monto" placeholder="$" value={nuevoGasto.monto} onChange={manejarCambioGasto} required />
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 rounded font-bold transition-colors shadow-sm">+</button>
          </form>

          <ul className="space-y-2 mb-4 max-h-32 overflow-y-auto pr-1">
            {listaGastos.map((gasto, i) => (
              <li key={gasto.id || i} className="flex justify-between items-center text-sm border-b border-gray-200 pb-1">
                <span className="text-gray-700">{gasto.concepto}</span>
                <div className="flex items-center gap-2">
                  <span className="text-orange-500 font-medium">-${gasto.monto}</span>
                  <button onClick={() => borrarGasto(gasto.id)} className="text-red-400 hover:text-red-600 text-xs" title="Eliminar gasto">🗑️</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-gray-200 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-500">Total Gastado:</span>
              <span className="font-bold text-gray-800">${totalGastado} MXN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Restante:</span>
              <span className={`font-bold ${restante < 0 ? 'text-red-500' : 'text-emerald-600'}`}>${restante} MXN</span>
            </div>
          </div>
        </div>
      )}
      {mostrarItinerario && <Itinerario viajeId={viaje.id} />}
    </li>
  );
}