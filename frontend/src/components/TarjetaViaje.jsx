import { useState } from 'react';
import { getIdeasIA, getGastos, postGasto } from '../services/api';

export default function TarjetaViaje({ viaje }) {
  const [ideas, setIdeas] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarGastos, setMostrarGastos] = useState(false);
  const [listaGastos, setListaGastos] = useState([]);
  const [nuevoGasto, setNuevoGasto] = useState({ concepto: '', monto: '' });

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

  const totalGastado = listaGastos.reduce((total, gasto) => total + gasto.monto, 0);
  const restante = viaje.presupuesto_estimado - totalGastado;

  return (
    <li className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      
      <h3 className="text-2xl font-bold text-indigo-400 mb-4 pb-3 border-b border-slate-800/60">{viaje.destino}</h3>
      
      <div className="space-y-2 text-sm text-slate-400 mb-6 flex-grow">
        <p><strong className="text-slate-300">Inicio:</strong> {viaje.fecha_inicio}</p>
        <p><strong className="text-slate-300">Fin:</strong> {viaje.fecha_fin}</p>
        <p><strong className="text-slate-300">Presupuesto:</strong> <span className="text-emerald-400 font-semibold">${viaje.presupuesto_estimado} MXN</span></p>
      </div>
      
      <div className="flex gap-3 mt-auto">
        <button onClick={traerIdeas} disabled={cargando} className="flex-1 py-2 px-3 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg font-semibold transition-colors text-sm">
          {cargando ? 'Pensando...' : '✨ IA Ideas'}
        </button>
        <button onClick={toggleGastos} className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${mostrarGastos ? 'bg-slate-800 text-slate-300' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>
          {mostrarGastos ? 'Ocultar' : '💸 Gastos'}
        </button>
      </div>
      
      {ideas && (
        <div className="mt-5 p-4 bg-indigo-950/30 border border-indigo-900/50 rounded-xl text-sm text-indigo-200">
          <p className="whitespace-pre-wrap">{ideas}</p>
        </div>
      )}

      {mostrarGastos && (
        <div className="mt-5 p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
          <form className="flex gap-2 mb-4" onSubmit={agregarGasto}>
            {/* 3. Cambiamos el name y value a "concepto" */}
            <input className="flex-2 bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 w-full" type="text" name="concepto" placeholder="Concepto" value={nuevoGasto.concepto} onChange={manejarCambioGasto} required />
            <input className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 w-24" type="number" name="monto" placeholder="$" value={nuevoGasto.monto} onChange={manejarCambioGasto} required />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 rounded font-bold transition-colors">+</button>
          </form>

          <ul className="space-y-2 mb-4 max-h-32 overflow-y-auto pr-1">
            {listaGastos.map((gasto, i) => (
              <li key={i} className="flex justify-between text-sm border-b border-slate-800/50 pb-1">
                {/* 4. Renderizamos gasto.concepto */}
                <span className="text-slate-300">{gasto.concepto}</span>
                <span className="text-red-400 font-medium">-${gasto.monto}</span>
              </li>
            ))}
          </ul>
          
          <div className="pt-3 border-t border-slate-700/50 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Total Gastado:</span>
              <span className="font-bold text-slate-200">${totalGastado} MXN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Restante:</span>
              <span className={`font-bold ${restante < 0 ? 'text-red-500' : 'text-emerald-400'}`}>${restante} MXN</span>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}