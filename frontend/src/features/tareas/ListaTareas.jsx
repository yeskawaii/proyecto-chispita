import { useState, useEffect } from 'react';
import ConfirmModal from '../../components/ui/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ListaTareas() {
  const [tareas, setTareas] = useState([]);
  const [nuevoTexto, setNuevoTexto] = useState('');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const cargarTareas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tareas`);
      if (res.ok) {
        const data = await res.json();
        setTareas(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarTareas();

    const handleUpdate = () => {
      cargarTareas();
    };

    window.addEventListener('WS_ACTUALIZACION_TAREAS', handleUpdate);
    return () => window.removeEventListener('WS_ACTUALIZACION_TAREAS', handleUpdate);
  }, []);

  const agregarTarea = async (e) => {
    e.preventDefault();
    if (!nuevoTexto.trim()) return;
    
    try {
      await fetch(`${API_URL}/api/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: nuevoTexto })
      });
      setNuevoTexto('');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCompletada = async (id, actual) => {
    try {
      await fetch(`${API_URL}/api/tareas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completada: !actual })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const eliminarTarea = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Tarea',
      message: '¿Seguro que quieres eliminar esta tarea?',
      onConfirm: async () => {
        try {
          await fetch(`${API_URL}/api/tareas/${id}`, {
            method: 'DELETE'
          });
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6">
      <div className="flex items-center justify-between mb-6">
         <h2 className="text-xl font-black text-slate-800 tracking-tight">Checklist</h2>
         <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full">{tareas.length} tareas</span>
      </div>
      
      <form onSubmit={agregarTarea} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Añadir nueva tarea..."
          value={nuevoTexto}
          onChange={(e) => setNuevoTexto(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={!nuevoTexto.trim()}
          className="bg-teal-600 hover:bg-teal-700 text-white w-12 h-12 rounded-2xl flex items-center justify-center transition-transform active:scale-90 disabled:opacity-50"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
        </button>
      </form>

      <div className="space-y-3">
        {tareas.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
             <p className="text-4xl mb-2">✨</p>
             <p className="text-slate-500 text-sm font-medium">Lista vacía. ¡Todo al día!</p>
          </div>
        ) : (
          tareas.map(tarea => (
            <div key={tarea.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${tarea.completada ? 'bg-slate-50/50 border-transparent opacity-60' : 'bg-white border-slate-100 shadow-sm'}`}>
              <label className="flex items-center gap-4 cursor-pointer flex-1 select-none">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={tarea.completada}
                    onChange={() => toggleCompletada(tarea.id, tarea.completada)}
                    className="peer w-7 h-7 cursor-pointer appearance-none rounded-full border-2 border-slate-200 checked:border-teal-500 checked:bg-teal-500 transition-all"
                  />
                  <svg className="absolute w-4 h-4 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 8 7 12 13 4"></polyline>
                  </svg>
                </div>
                <span className={`text-[15px] font-medium leading-tight transition-all duration-300 ${tarea.completada ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {tarea.texto}
                </span>
              </label>
              
              <button
                onClick={() => eliminarTarea(tarea.id)}
                className="text-slate-300 hover:text-red-500 p-2 ml-2 transition-colors"
                title="Eliminar tarea"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

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
