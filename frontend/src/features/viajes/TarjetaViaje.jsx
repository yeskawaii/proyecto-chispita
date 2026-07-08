import { useState } from 'react';
import { getIdeasIA, getGastos, postGasto, deleteViaje, deleteGasto } from '../../services/api';
import Itinerario from './Itinerario';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function TarjetaViaje({ viaje, onDelete }) {
  const [ideas, setIdeas] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarGastos, setMostrarGastos] = useState(false);
  const [listaGastos, setListaGastos] = useState([]);
  const [nuevoGasto, setNuevoGasto] = useState({ concepto: '', monto: '' });
  const [mostrarItinerario, setMostrarItinerario] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

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

  const borrarViaje = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Viaje',
      message: '¿Seguro que quieres eliminar este viaje por completo?',
      onConfirm: async () => {
        try {
          await deleteViaje(viaje.id);
          if (onDelete) onDelete(viaje.id);
        } catch (error) {
          console.error("Error al borrar viaje:", error);
        }
      }
    });
  };

  const borrarGasto = (gastoId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Gasto',
      message: '¿Seguro que quieres eliminar este gasto?',
      onConfirm: async () => {
        try {
          await deleteGasto(gastoId);
          setListaGastos(listaGastos.filter(g => g.id !== gastoId));
        } catch (error) {
          console.error("Error al borrar gasto:", error);
        }
      }
    });
  };

  const totalGastado = listaGastos.reduce((total, gasto) => total + gasto.monto, 0);
  const restante = viaje.presupuesto_estimado - totalGastado;

  return (
    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">{viaje.titulo}</h3>
          <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
            <span className="text-teal-500">📍</span> {viaje.destino}
          </p>
        </div>
        <button onClick={borrarViaje} className="text-slate-300 hover:text-red-500 transition-colors p-2 -mr-2 -mt-2 active:scale-90" title="Eliminar viaje">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      <div className="flex bg-slate-50 rounded-2xl p-3 mb-5">
         <div className="flex-1 border-r border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Fechas</p>
            <p className="text-xs font-semibold text-slate-700">{viaje.fecha_inicio.slice(5)} al {viaje.fecha_fin.slice(5)}</p>
         </div>
         <div className="flex-1 pl-3">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Presupuesto</p>
            <p className="text-xs font-bold text-teal-600">${viaje.presupuesto_estimado}</p>
         </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-auto">
        <button onClick={traerIdeas} disabled={cargando} className="flex flex-col items-center justify-center py-3 bg-white border border-slate-100 hover:bg-slate-50 active:bg-slate-100 rounded-2xl font-semibold transition-all text-xs text-slate-600 shadow-sm disabled:opacity-50">
          <span className="text-lg mb-1">{cargando ? '⏳' : '✨'}</span>
          <span>Ideas</span>
        </button>
        <button onClick={toggleGastos} className={`flex flex-col items-center justify-center py-3 border rounded-2xl font-semibold transition-all text-xs shadow-sm ${mostrarGastos ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
          <span className="text-lg mb-1">💸</span>
          <span>Gastos</span>
        </button>
        <button onClick={() => setMostrarItinerario(!mostrarItinerario)} className={`flex flex-col items-center justify-center py-3 border rounded-2xl font-semibold transition-all text-xs shadow-sm ${mostrarItinerario ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
          <span className="text-lg mb-1">📅</span>
          <span>Ruta</span>
        </button>
      </div>

      {ideas && (
        <div className="mt-4 p-4 bg-teal-50 border border-teal-100 rounded-2xl text-sm text-teal-900 relative animate-in fade-in slide-in-from-top-2">
          <button onClick={() => setIdeas('')} className="absolute top-3 right-3 text-teal-400 hover:text-teal-700 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm" title="Cerrar">
             ✕
          </button>
          <p className="whitespace-pre-wrap mt-2 font-medium leading-relaxed">{ideas}</p>
        </div>
      )}

      {mostrarGastos && (
        <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
          <form className="flex gap-2 mb-4" onSubmit={agregarGasto}>
            <input className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400" type="text" name="concepto" placeholder="Concepto..." value={nuevoGasto.concepto} onChange={manejarCambioGasto} required />
            <input className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400" type="number" name="monto" placeholder="$" value={nuevoGasto.monto} onChange={manejarCambioGasto} required />
            <button type="submit" className="bg-teal-600 active:bg-teal-700 text-white w-10 flex items-center justify-center rounded-xl font-bold shadow-sm">+</button>
          </form>

          <ul className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-1">
            {listaGastos.map((gasto, i) => (
              <li key={gasto.id || i} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-sm font-medium text-slate-700">{gasto.concepto}</span>
                <div className="flex items-center gap-3">
                  <span className="text-orange-500 font-bold text-sm">-${gasto.monto}</span>
                  <button onClick={() => borrarGasto(gasto.id)} className="text-slate-300 hover:text-red-500 active:scale-90 transition-transform">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-slate-200">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Gastado</span>
              <span className="font-bold text-slate-700">${totalGastado}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Restante</span>
              <span className={`font-black ${restante < 0 ? 'text-red-500' : 'text-emerald-500'}`}>${restante}</span>
            </div>
          </div>
        </div>
      )}
      {mostrarItinerario && <div className="mt-4 animate-in fade-in slide-in-from-top-2"><Itinerario viajeId={viaje.id} /></div>}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
}