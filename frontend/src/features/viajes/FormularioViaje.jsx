import { useState } from 'react';
import { postViaje } from '../../services/api';

export default function FormularioViaje({ onViajeGuardado }) {
  const [nuevoViaje, setNuevoViaje] = useState({
    titulo: '', destino: '', fecha_inicio: '', fecha_fin: '', presupuesto_estimado: ''
  });

  const manejarCambio = (e) => {
    setNuevoViaje({ ...nuevoViaje, [e.target.name]: e.target.value });
  };

  const guardarViaje = async (e) => {
    e.preventDefault();
    try {
      const viajeParaGuardar = { ...nuevoViaje, presupuesto_estimado: parseFloat(nuevoViaje.presupuesto_estimado) };
      const viajeGuardado = await postViaje(viajeParaGuardar);
      onViajeGuardado(viajeGuardado);
      setNuevoViaje({ titulo: '', destino: '', fecha_inicio: '', fecha_fin: '', presupuesto_estimado: '' });
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  // Inputs claros con bordes sutiles y foco color verde agua (teal)
  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-sm";

  return (
    // Contenedor blanco semi-transparente para que se fusione con el fondo degradado
    <form className="bg-white/70 backdrop-blur-md border border-teal-100 p-6 md:p-8 rounded-3xl shadow-xl max-w-2xl mx-auto mb-14 flex flex-col gap-5" onSubmit={guardarViaje}>
      <div>
        <h2 className="text-2xl font-bold text-teal-900 mb-1">Planifica tu Próxima Aventura 🗺️</h2>
        <p className="text-xs text-teal-700/70">Arma las maletas y empieza a trazar el mapa.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className={`${inputClass} md:col-span-2`} type="text" name="titulo" placeholder="Título (ej. Escapada Romántica)" value={nuevoViaje.titulo} onChange={manejarCambio} required />
        <input className={`${inputClass} md:col-span-2`} type="text" name="destino" placeholder="Destino (ej. Bora Bora)" value={nuevoViaje.destino} onChange={manejarCambio} required />
        
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-teal-800 px-1">Fecha de salida</label>
          <input className={inputClass} type="date" name="fecha_inicio" value={nuevoViaje.fecha_inicio} onChange={manejarCambio} required />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-teal-800 px-1">Fecha de regreso</label>
          <input className={inputClass} type="date" name="fecha_fin" value={nuevoViaje.fecha_fin} onChange={manejarCambio} required />
        </div>
        
        <div className="md:col-span-2 flex flex-col gap-1">
          <input className={inputClass} type="number" name="presupuesto_estimado" placeholder="Presupuesto Inicial ($ MXN)" value={nuevoViaje.presupuesto_estimado} onChange={manejarCambio} required />
        </div>
      </div>
      
      <button type="submit" className="w-full mt-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300 transform hover:-translate-y-0.5">
        Crear Itinerario de Viaje ✈️
      </button>
    </form>
  );
}