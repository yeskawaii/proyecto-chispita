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

  const cerrarModal = () => document.getElementById('modal-nuevo-viaje').close();

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition-all text-[15px]";

  return (
    <dialog 
      id="modal-nuevo-viaje" 
      className="backdrop:bg-slate-900/60 p-0 m-0 mt-auto fixed inset-x-0 bottom-0 max-w-md w-full mx-auto rounded-t-[2rem] bg-white shadow-2xl transition-transform ease-out duration-300 open:animate-in open:slide-in-from-bottom-full"
    >
      <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex flex-col gap-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-xl font-black text-slate-800">Nuevo Viaje 🗺️</h2>
            <p className="text-sm text-slate-500 font-medium">¿A dónde vamos?</p>
          </div>
          <button type="button" onClick={cerrarModal} className="w-9 h-9 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 active:scale-90 transition-transform">
             ✕
          </button>
        </div>
        
        <form className="flex flex-col gap-4" onSubmit={(e) => { guardarViaje(e); cerrarModal(); }}>
          <input className={inputClass} type="text" name="titulo" placeholder="Título (ej. Escapada Romántica)" value={nuevoViaje.titulo} onChange={manejarCambio} required />
          <input className={inputClass} type="text" name="destino" placeholder="Destino (ej. Bora Bora)" value={nuevoViaje.destino} onChange={manejarCambio} required />
          
          <div className="flex gap-4">
             <div className="flex-1 flex flex-col gap-1.5">
               <label className="text-[13px] font-bold text-slate-500 px-1 uppercase tracking-wider">Salida</label>
               <input className={inputClass} type="date" name="fecha_inicio" value={nuevoViaje.fecha_inicio} onChange={manejarCambio} required />
             </div>
             
             <div className="flex-1 flex flex-col gap-1.5">
               <label className="text-[13px] font-bold text-slate-500 px-1 uppercase tracking-wider">Regreso</label>
               <input className={inputClass} type="date" name="fecha_fin" value={nuevoViaje.fecha_fin} onChange={manejarCambio} required />
             </div>
          </div>
          
          <div className="flex flex-col gap-1.5 mt-2">
            <input className={inputClass} type="number" name="presupuesto_estimado" placeholder="Presupuesto ($ MXN)" value={nuevoViaje.presupuesto_estimado} onChange={manejarCambio} required />
          </div>
          
          <button type="submit" className="w-full mt-4 bg-teal-600 active:bg-teal-700 text-white font-bold py-4 rounded-2xl active:scale-[0.98] transition-all shadow-md shadow-teal-600/20 text-[15px]">
            Crear Itinerario
          </button>
        </form>
      </div>
    </dialog>
  );
}