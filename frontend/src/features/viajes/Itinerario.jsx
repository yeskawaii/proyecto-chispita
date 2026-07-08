import { useState, useEffect } from 'react';
import { getItinerario, postItinerario, deleteItinerario } from '../../services/api';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function Itinerario({ viajeId }) {
  const [lista, setLista] = useState([]);
  const [nuevoItem, setNuevoItem] = useState({ tipo: 'actividad', titulo: '', fecha: '', hora_inicio: '' });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    getItinerario(viajeId).then(setLista).catch(console.error);
  }, [viajeId]);

  const manejarCambio = (e) => setNuevoItem({ ...nuevoItem, [e.target.name]: e.target.value });

  const guardarActividad = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...nuevoItem, viaje_id: viajeId };
      if (!payload.hora_inicio) delete payload.hora_inicio; // Por si lo dejan vacío
      
      const itemGuardado = await postItinerario(viajeId, payload);
      
      // Actualizamos la lista y la ordenamos rápido por si acaso
      const nuevaLista = [...lista, itemGuardado].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      setLista(nuevaLista);
      
      setNuevoItem({ tipo: 'actividad', titulo: '', fecha: '', hora_inicio: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const borrarActividad = (itemId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Actividad',
      message: '¿Seguro que quieres eliminar esta actividad del itinerario?',
      onConfirm: async () => {
        try {
          await deleteItinerario(viajeId, itemId);
          setLista(lista.filter(i => i.id !== itemId));
        } catch (error) {
          console.error("Error al borrar itinerario:", error);
        }
      }
    });
  };

  const inputClass = "bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 w-full transition-all";

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
      <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Itinerario del Viaje</h4>
      
      <form className="flex flex-col gap-2 mb-5" onSubmit={guardarActividad}>
        <div className="flex gap-2">
          <select name="tipo" value={nuevoItem.tipo} onChange={manejarCambio} className={`${inputClass} flex-1`} required>
            <option value="vuelo">✈️ Vuelo</option>
            <option value="hotel">🏨 Hotel</option>
            <option value="comida">🍽️ Comida</option>
            <option value="actividad">🏖️ Actividad</option>
          </select>
          <input type="date" name="fecha" value={nuevoItem.fecha} onChange={manejarCambio} className={`${inputClass} flex-1`} required />
          <input type="time" name="hora_inicio" value={nuevoItem.hora_inicio} onChange={manejarCambio} className={`${inputClass} w-[90px]`} />
        </div>
        <div className="flex gap-2">
          <input type="text" name="titulo" placeholder="¿Qué vamos a hacer?" value={nuevoItem.titulo} onChange={manejarCambio} className={`${inputClass} flex-[2]`} required />
          <button type="submit" className="bg-teal-600 active:bg-teal-700 text-white px-5 rounded-xl font-bold shadow-sm flex items-center justify-center transition-transform active:scale-95">+</button>
        </div>
      </form>

      <ul className="space-y-3 max-h-48 overflow-y-auto pr-1">
        {lista.map((item, i) => (
          <li key={item.id || i} className="flex flex-col border border-slate-100 bg-white p-3 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <span className="font-bold text-slate-700 text-[15px]">{item.tipo === 'vuelo' ? '✈️' : item.tipo === 'hotel' ? '🏨' : item.tipo === 'comida' ? '🍽️' : '🏖️'} {item.titulo}</span>
              <div className="flex items-center gap-3">
                <span className="text-teal-600 font-bold text-sm bg-teal-50 px-2 py-0.5 rounded-md">{item.hora_inicio ? item.hora_inicio.substring(0,5) : 'Todo el día'}</span>
                <button onClick={() => borrarActividad(item.id)} className="text-slate-300 hover:text-red-500 active:scale-90 transition-transform p-1" title="Eliminar actividad">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400 mt-1">{item.fecha}</span>
          </li>
        ))}
      </ul>

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