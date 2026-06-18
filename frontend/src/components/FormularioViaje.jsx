import { useState } from 'react';
import { postViaje } from '../services/api';

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

  const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

  return (
    <form className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto mb-14 flex flex-col gap-5" onSubmit={guardarViaje}>
      <h2 className="text-2xl font-bold text-slate-100 mb-1">Inicia un Nuevo Proyecto</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className={`${inputClass} md:col-span-2`} type="text" name="titulo" placeholder="Título (ej. Vacaciones de Aniversario)" value={nuevoViaje.titulo} onChange={manejarCambio} required />
        <input className={`${inputClass} md:col-span-2`} type="text" name="destino" placeholder="Destino (ej. Punta Cana)" value={nuevoViaje.destino} onChange={manejarCambio} required />
        <input className={inputClass} type="date" name="fecha_inicio" value={nuevoViaje.fecha_inicio} onChange={manejarCambio} required />
        <input className={inputClass} type="date" name="fecha_fin" value={nuevoViaje.fecha_fin} onChange={manejarCambio} required />
        <input className={`${inputClass} md:col-span-2`} type="number" name="presupuesto_estimado" placeholder="Presupuesto ($ MXN)" value={nuevoViaje.presupuesto_estimado} onChange={manejarCambio} required />
      </div>
      
      <button type="submit" className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-3 px-4 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300 transform hover:-translate-y-1">
        Guardar Viaje
      </button>
    </form>
  );
}