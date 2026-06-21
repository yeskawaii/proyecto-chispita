import { useState, useEffect } from 'react';
import { getItinerario, postItinerario, deleteItinerario } from '../../services/api';

export default function Itinerario({ viajeId }) {
  const [lista, setLista] = useState([]);
  const [nuevoItem, setNuevoItem] = useState({ tipo: 'actividad', titulo: '', fecha: '', hora_inicio: '' });

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

  const borrarActividad = async (itemId) => {
    try {
      await deleteItinerario(viajeId, itemId);
      setLista(lista.filter(i => i.id !== itemId));
    } catch (error) {
      console.error("Error al borrar itinerario:", error);
    }
  };

  const inputClass = "bg-white border border-gray-300 rounded p-2 text-sm text-gray-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-full";

  return (
    <div className="mt-5 p-4 bg-teal-50/50 border border-teal-100 rounded-xl">
      <h4 className="font-bold text-teal-800 mb-3 flex items-center gap-2">📅 Itinerario del Viaje</h4>
      
      <form className="flex flex-col gap-2 mb-4" onSubmit={guardarActividad}>
        <div className="flex gap-2">
          <select name="tipo" value={nuevoItem.tipo} onChange={manejarCambio} className={`${inputClass} flex-1`} required>
            <option value="vuelo">✈️ Vuelo</option>
            <option value="hotel">🏨 Hotel</option>
            <option value="comida">🍽️ Comida</option>
            <option value="actividad">🏖️ Actividad</option>
          </select>
          <input type="date" name="fecha" value={nuevoItem.fecha} onChange={manejarCambio} className={`${inputClass} flex-1`} required />
          <input type="time" name="hora_inicio" value={nuevoItem.hora_inicio} onChange={manejarCambio} className={`${inputClass} w-24`} />
        </div>
        <div className="flex gap-2">
          <input type="text" name="titulo" placeholder="¿Qué vamos a hacer?" value={nuevoItem.titulo} onChange={manejarCambio} className={`${inputClass} flex-2`} required />
          <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white px-4 rounded font-bold transition-colors shadow-sm">Add</button>
        </div>
      </form>

      <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {lista.map((item, i) => (
          <li key={item.id || i} className="flex flex-col text-sm border-b border-teal-200/50 pb-2 bg-white/60 p-2 rounded group">
            <div className="flex justify-between font-semibold text-gray-800 items-start">
              <span>{item.tipo === 'vuelo' ? '✈️' : item.tipo === 'hotel' ? '🏨' : item.tipo === 'comida' ? '🍽️' : '🏖️'} {item.titulo}</span>
              <div className="flex items-center gap-2">
                <span className="text-teal-600">{item.hora_inicio ? item.hora_inicio.substring(0,5) : 'Todo el día'}</span>
                <button onClick={() => borrarActividad(item.id)} className="text-red-400 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity" title="Eliminar actividad">🗑️</button>
              </div>
            </div>
            <span className="text-xs text-gray-500">{item.fecha}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}